
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../api/axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { io } from 'socket.io-client';
import { useAuth } from '../../../../context/AuthContext';
import { BlockRenderer } from '../../../../components/NoteBlockComponent';
import { useDebounce } from '../../../../hooks/useDebounce';
import { useForm } from 'react-hook-form';
import Cookies from 'js-cookie';

export default function NotePage() {
    const params = useParams();
    const id = params.id; // Mengambil ID dari params
    const router = useRouter();
    const { user } = useAuth();
    const socketRef = useRef();
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastEditedInfo, setLastEditedInfo] = useState({ by: 'N/A', at: 'N/A' });

    const isUpdatingFromSocket = useRef(false);

    const { register, handleSubmit, setValue, getValues, watch } = useForm({
        defaultValues: {
            title: 'Untitled Note',
        },
    });

    const currentTitle = watch('title');

    // Debounced values
    const debouncedBlocks = useDebounce(blocks, 500); // Debounce blocks state
    const debouncedTitle = useDebounce(currentTitle, 500); // Debounce title state

    // Fungsi untuk mengirim perubahan ke WebSocket
    const emitNoteChange = useCallback((updatedBlocks, updatedTitle) => {
        if (isUpdatingFromSocket.current) {
            return;
        }
        if (socketRef.current && id && id !== 'new') {
            socketRef.current.emit('noteChange', {
                noteId: id,
                blocks: updatedBlocks,
                title: updatedTitle
            });
            // console.log('Emitted noteChange:', updatedTitle, updatedBlocks);
        }
    }, [id]);

    // Efek untuk memicu emitNoteChange saat debouncedBlocks atau debouncedTitle berubah
    useEffect(() => {
        if (id !== 'new' && !loading && socketRef.current?.connected && !isUpdatingFromSocket.current) {
            // Cek apakah ada perubahan yang signifikan sebelum emit
            // Hindari emit saat initial load atau saat menerima update dari socket lain
            // Jika ada perubahan pada blok atau judul, emit
            emitNoteChange(debouncedBlocks, debouncedTitle);
        }
    }, [debouncedBlocks, debouncedTitle, id, loading, emitNoteChange]);


    // Fungsi saveNote sekarang akan dipanggil untuk initial save atau sebagai fallback
    const saveNoteRest = useCallback(async (currentBlocks, currentNoteTitle) => {
        try {
            if (id === 'new') {
                const res = await api.post('/notes', { title: currentNoteTitle, blocks: currentBlocks }, {
                    headers: {
                        Authorization: `Bearer ${Cookies.get('token')}`,
                    }
                });
                router.replace(`/dashboard/${res.data.note._id}`); // Menggunakan router.replace untuk mengubah URL tanpa menambah ke history
            } else {
                await api.put(`/notes/${id}`, { title: currentNoteTitle, blocks: currentBlocks },
                    {
                        headers: {
                            Authorization: `Bearer ${Cookies.get('token')}`,
                        }
                    }
                );
            }
            setError(null);
            console.log('Note saved via REST!');
        } catch (err) {
            console.error('Error saving note via REST:', err.response?.data?.message || err.message);
            setError('Failed to save note. Please check your connection.');
        }
    }, [id, router]);


    // --- WebSocket Connection & Event Handlers ---
    useEffect(() => {
        if (id === 'new' || !user) {
            setLoading(false);
            setValue('title', 'Untitled Note');
            setBlocks([{ id: uuidv4(), type: 'text', content: '<p></p>' }]);
            return;
        }

        if (!socketRef.current) {
            socketRef.current = io(process.env.NEXT_PUBLIC_WS_URL, { // URL WebSocket dari variabel lingkungan
                withCredentials: true
            });

            socketRef.current.on('connect', () => {
                console.log('Connected to WebSocket server.');
                const token = localStorage.getItem('jwtToken') || document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
                socketRef.current.emit('joinNote', { noteId: id, token: token });
            });

            socketRef.current.on('noteInitialState', (initialNote) => {
                console.log('Received initial state:', initialNote);
                isUpdatingFromSocket.current = true;
                setValue('title', initialNote.data?.title || 'Untitled Note');
                setBlocks(initialNote.data?.blocks[0]);
                setLastEditedInfo({
                    by: initialNote.data?.lastEditedBy?.username || 'Unknown',
                    at: new Date(initialNote.data?.lastEditedAt).toLocaleString()
                });
                setLoading(false);
                setTimeout(() => { // Beri sedikit jeda sebelum reset
                    isUpdatingFromSocket.current = false;
                }, 50);
            });

            socketRef.current.on('noteUpdated', (updatedNote) => {
                console.log('Received update from other user:', updatedNote);
                isUpdatingFromSocket.current = true;
                setValue('title', updatedNote.data?.title || 'Untitled Note');
                setBlocks(updatedNote.data?.blocks[0]);
                setLastEditedInfo({
                    by: updatedNote.data?.lastEditedBy?.username || 'Unknown',
                    at: new Date(updatedNote.data?.lastEditedAt).toLocaleString()
                });
                setTimeout(() => { // Beri sedikit jeda sebelum reset
                    isUpdatingFromSocket.current = false;
                }, 50);
            });

            socketRef.current.on('noteError', (err) => {
                console.error('WebSocket Error:', err);
                setError(err.message || 'A WebSocket error occurred.');
                if (err.message === 'Authentication required. Please log in.' || err.message === 'You do not have access to this note.') {
                    router.push('/notes');
                }
            });

            socketRef.current.on('disconnect', () => {
                console.log('Disconnected from WebSocket server.');
                setError('Disconnected from collaborative editing. Changes might not sync.');
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [id, router, setValue, user]);

    // --- Handlers Perubahan Blok ---
    const addBlock = (type) => {
        const newBlock = { id: uuidv4(), type: type };
        if (type === 'text') newBlock.content = '<p></p>';
        if (type === 'checklist') {
            newBlock.content = '';
            newBlock.checked = false;
        }
        if (type === 'image') {
            newBlock.url = '';
            newBlock.alt = '';
        }
        if (type === 'code') {
            newBlock.content = '';
            newBlock.language = 'text';
        }
        const updatedBlocks = [...blocks, newBlock];
        setBlocks(updatedBlocks);
        if (id === 'new') {
            saveNoteRest(updatedBlocks, getValues('title'));
        }
    };

    const deleteBlock = (blockId) => {
        const updatedBlocks = blocks.filter((block) => block.id !== blockId);
        setBlocks(updatedBlocks);
        if (id === 'new') {
            saveNoteRest(updatedBlocks, getValues('title'));
        }
    };

    const handleBlockContentChange = (blockId, newContent) => {
        const updatedBlocks = blocks.map((block) =>
            block.id === blockId ? { ...block, content: newContent } : block
        );
        setBlocks(updatedBlocks);
        if (id === 'new') {
            saveNoteRest(updatedBlocks, getValues('title'));
        }
    };

    const handleBlockToggle = (blockId) => {
        const updatedBlocks = blocks.map((block) =>
            block.id === blockId ? { ...block, checked: !block.checked } : block
        );
        setBlocks(updatedBlocks);
        if (id === 'new') {
            saveNoteRest(updatedBlocks, getValues('title'));
        }
    };

    const handleImageUpload = async (blockId, file) => {
        // Untuk kesederhanaan, kita akan mengubah gambar menjadi Data URL di frontend
        // Di aplikasi produksi, Anda harus mengunggah gambar ke penyimpanan cloud (S3, Cloudinary, dll.)
        // dan menyimpan URL yang dikembalikan di database.
        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result; // Data URL
                const updatedBlocks = blocks.map((block) =>
                    block.id === blockId ? { ...block, url: imageUrl } : block
                );
                setBlocks(updatedBlocks);
                if (id === 'new') {
                    saveNoteRest(updatedBlocks, getValues('title'));
                }
            };
            reader.readAsDataURL(file);

        } catch (err) {
            console.error('Error uploading image:', err);
            setError('Failed to upload image. Please try again.');
        }
    };

    const handleBlockAltChange = (blockId, field, value) => {
        const updatedBlocks = blocks.map((block) =>
            block.id === blockId ? { ...block, [field]: value } : block
        );
        setBlocks(updatedBlocks);
        if (id === 'new') {
            saveNoteRest(updatedBlocks, getValues('title'));
        }
    };

    const handleBlockLanguageChange = (blockId, newLanguage) => {
        const updatedBlocks = blocks.map((block) =>
            block.id === blockId ? { ...block, language: newLanguage } : block
        );
        setBlocks(updatedBlocks);
        if (id === 'new') {
            saveNoteRest(updatedBlocks, getValues('title'));
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(blocks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setBlocks(items);
        if (id === 'new') {
            saveNoteRest(items, getValues('title'));
        }
    };

    // Handler onBlur untuk judul
    const onTitleBlur = () => {
        if (id !== 'new') {
            emitNoteChange(blocks, getValues('title'));
        } else {
            saveNoteRest(blocks, getValues('title'));
        }
    };


    if (loading) return <div className="text-center mt-8 text-lg text-gray-700">Loading note editor...</div>;
    if (error) return <div className="text-center mt-8 text-red-500 text-lg">{error}</div>;

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                    ← Kembali ke Catatan
                </button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    onClick={() => saveNoteRest(blocks, getValues('title'))}
                    className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Simpan Catatan Manual
                </button>
            </div>

            <input
                type="text"
                className="w-full text-4xl font-bold mb-2 p-2 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                placeholder="Untitled Note"
                {...register('title', {
                    required: 'Judul catatan diperlukan',
                    // onChange akan ditangani oleh useDebounce, onBlur untuk memaksa save jika hanya judul yang berubah
                    onBlur: onTitleBlur,
                })}
            />
            <p className="text-sm text-gray-500 mb-6">
                Last edited by: {lastEditedInfo.by} at {lastEditedInfo.at}
            </p>

            {/* Wrapping DragDropContext with a client-only check */}
            {typeof window !== 'undefined' && (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="note-blocks">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                                {blocks.map((block, index) => (
                                    <Draggable key={block.id} draggableId={block.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="relative group p-3 border border-gray-200 rounded-md bg-white shadow-sm"
                                            >
                                                <div
                                                    {...provided.dragHandleProps}
                                                    className="absolute -top-2 left-1/2 -translate-x-1/2 cursor-grab text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-xl z-10"
                                                    title="Drag to reorder"
                                                >
                                                    &#x22EE;
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="flex-grow">
                                                        <BlockRenderer
                                                            block={block}
                                                            onBlockContentChange={handleBlockContentChange}
                                                            onBlockToggle={handleBlockToggle}
                                                            onImageUpload={handleImageUpload}
                                                            onBlockAltChange={handleBlockAltChange}
                                                            onBlockLanguageChange={handleBlockLanguageChange}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => deleteBlock(block.id)}
                                                        className="ml-2 mt-1 p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-lg hover:text-red-700"
                                                        title="Delete block"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}


            <div className="mt-8 flex justify-center gap-4 flex-wrap">
                <button
                    onClick={() => addBlock('text')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                >
                    Add Text Block
                </button>
                <button
                    onClick={() => addBlock('checklist')}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
                >
                    Add Checklist
                </button>
                <button
                    onClick={() => addBlock('image')}
                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                >
                    Add Image
                </button>
                <button
                    onClick={() => addBlock('code')}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
                >
                    Add Code Block
                </button>
            </div>
        </div>
    );
}