"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import axios from '../../../api/axios';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import "@blocknote/core/style.css";
import Layout from '../../../../components/Layout';
import PrivateRoute from '../../../../components/PrivateRouter';
import { useAuth } from '../../../../context/AuthContext';
import Link from 'next/link';
import Cookies from 'js-cookie';

const NoteDetailPage = () => {
    const { user } = useAuth();
    const router = useSearchParams();
    const { id } = router.get('id') ? JSON.parse(router.get('id')) : useParams();

    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [title, setTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false); // State baru untuk indikator saving

    const saveTimeoutRef = useRef(null);
    const isUpdatingEditorRef = useRef(false); // Flag untuk mencegah auto-save dari update remote
    const handleUploadFile = useCallback(async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file); // 'image' adalah nama field yang akan diterima backend

            // Ganti '/api/upload-image' dengan endpoint backend Anda
            const response = await axios.post('/upload-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Backend diharapkan mengembalikan URL gambar yang diunggah
            if (response.data && response.data.url) {
                return response.data.url;
            } else {
                throw new Error('Upload failed: No URL returned from server.');
            }
        } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
            setError('Failed to upload image. Please try again.');
            // BlockNote mengharapkan string URL yang valid atau Promise rejection
            return null; // Return null or throw an error to indicate failure
        }
    }, []);
    // Inisialisasi editor menggunakan useCreateBlockNote
    const editor = useCreateBlockNote({
        initialContent: [{
            type: 'paragraph',
            props: {},
            content: [],
            children: [],
        }],
        uploadFile: handleUploadFile
    });
    const saveNoteToBackend = useCallback(async (currentTitle, currentBlocks) => {
        // Pastikan editor sudah diinisialisasi dan ada ID
        if (!id || !editor || !currentBlocks) return;

        setIsSaving(true); // Set status menjadi saving
        try {
            const res = await axios.put(`/notes/${id}`, {
                title: currentTitle,
                content: currentBlocks, // Kirim document BlockNote (blocks)
            },
                {
                    headers: {
                        'Authorization': `Bearer ${Cookies.get('token')}`
                    }
                }
            );
            const result = res.data;
            // Update state note dengan data yang diterima dari backend
            editor.replaceBlocks(editor.document, result.content);
            setNote(prevNote => ({
                ...prevNote,
                title: result.data.title,
                updatedAt: result.data.updatedAt,
                lastEditedBy: result.data.lastEditedBy,
            }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to auto-save note');
            console.error('Error auto-saving note:', err);
        } finally {
            setIsSaving(false); // Set status kembali setelah selesai
        }
    }, [id, editor]); // Tambahkan editor ke dependensi
    // Callback untuk perubahan konten editor
    const handleEditorContentChange = useCallback(async (editorInstance) => {
        if (isUpdatingEditorRef.current) {
            isUpdatingEditorRef.current = false;
            return;
        }

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        // Atur timer untuk auto-save setelah 1 detik
        saveTimeoutRef.current = setTimeout(async () => {
            const currentBlocks = editorInstance.document; // Gunakan editor.document untuk semua blok
            await saveNoteToBackend(title, currentBlocks);
        }, 5000); // Debounce saving selama 1 detik
    }, [title, saveNoteToBackend]);




    useEffect(() => {
        // Pastikan editor diinisialisasi sebelum menggunakannya di useEffect
        if (!id || !editor) return;


        const fetchNote = async () => {
            try {
                const res = await axios.get(`/notes/${id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${Cookies.get('token')}`
                        }
                    }
                );
                const result = res.data.data[0];
                setNote(result);
                setTitle(result.title);

                let loadedBlocks = [];
                try {
                    // Asumsi res.data.content sudah dalam format JSON BlockNote
                    // Jika konten disimpan sebagai JSON string di DB, parse di sini
                    if (typeof res.data.content === 'string' && res.data.content.startsWith('[')) {
                        loadedBlocks = JSON.parse(res.data.content);
                    } else if (Array.isArray(res.data.content)) {
                        loadedBlocks = res.data.content;
                    } else {
                        console.warn("Note content is not in expected BlockNote array format:", res.data.content);
                        loadedBlocks = [{ type: 'paragraph', content: 'Failed to load content, starting fresh.' }];
                    }
                } catch (parseError) {
                    console.error("Error parsing note content:", parseError);
                    loadedBlocks = [{ type: 'paragraph', content: 'Error loading content.' }];
                }

                // Perbarui konten editor jika sudah diinisialisasi.
                // Gunakan ref untuk mencegah pembaruan terprogram ini memicu onEditorContentChange
                // dan menyebabkan auto-save langsung.
                isUpdatingEditorRef.current = true;
                editor.replaceBlocks(editor.document, loadedBlocks); // Ganti semua blok yang ada dengan blok yang dimuat

            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch note');
                console.error('Error fetching note:', err);
                if (err.response?.status === 404 || err.response?.status === 401) {
                    router.push('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchNote();

    }, [id, editor, router, saveNoteToBackend, isSaving]); // Tambahkan editor ke dependensi

    // Effect untuk menangani perubahan judul secara terpisah
    useEffect(() => {
        // Picu save hanya jika catatan dimuat dan judul telah berubah dari status yang dimuat
        if (!loading && note && title !== note.title && editor) { // Pastikan editor diinisialisasi
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(() => {
                saveNoteToBackend(title, editor.document); // Gunakan editor.document
            }, 1000);
        }
    }, [title, loading, note, editor, saveNoteToBackend]);


    const handleManualSave = async () => {
        if (!editor) return; // Pastikan editor diinisialisasi
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        await saveNoteToBackend(title, editor.document); // Gunakan editor.document
        alert('Note saved successfully!');
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            setError('');
            try {
                await axios.delete(`/notes/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${Cookies.get('token')}`
                    }
                });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete note');
                console.error('Error deleting note:', err);
            }
        }
    };

    if (loading) {
        return (
            <Layout title="Loading Note">
                <div className="flex justify-center items-center h-screen bg-myedlinks-gray-100">
                    <div className="text-xl font-semibold text-myedlinks-gray-700">Loading note editor...</div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Error">
                <div className="p-4 sm:p-6 md:p-8">
                    <p className="text-red-600 text-lg text-center">{error}</p>
                </div>
            </Layout>
        );
    }

    if (!note) {
        return (
            <Layout title="Note Not Found">
                <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center">
                    <p className="text-myedlinks-gray-600 text-xl mb-4">Note not found.</p>
                </div>
            </Layout>
        );
    }

    return (
        <PrivateRoute>
            <Layout title={title || 'Note Detail'}>
                <div className="relative max-w-screen mx-auto py-4 sm:py-6 md:py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 px-0 sm:px-4">
                        <div className="flex space-x-2 sm:space-x-4 items-center justify-end-safe mb-4 sm:mb-0 w-full px-4">
                            {/* <Link href={`/preview/${id}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center btn-secondary py-1 px-2 sm:py-1.5 sm:px-3 text-xs sm:text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 sm:h-5 sm:w-5 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057 .458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                Preview
                            </Link> */}
                            <button
                                onClick={handleManualSave}
                                className="btn-primary py-1 px-2 sm:py-1.5 sm:px-3 text-xs sm:text-sm"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn-danger py-1 px-2 sm:py-1.5 sm:px-3 text-xs sm:text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    <div className="px-0 sm:px-4 mb-4 sm:mb-8">
                        <div className="flex flex-wrap items-center space-x-2 text-myedlinks-gray-500 mb-4 text-sm sm:text-base">
                            <span className="text-xl sm:text-2xl mr-1">📝</span>
                            <span>Add icon</span>
                            <span className="hidden sm:inline">|</span>
                            <span>Add cover</span>
                            <span className="hidden sm:inline">|</span>
                            <span>Add comment</span>
                        </div>
                        <input
                            type="text"
                            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-myedlinks-gray-800 w-full bg-transparent border-none outline-none resize-none placeholder-myedlinks-gray-400"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Untitled"
                            rows="1"
                            style={{ overflowY: 'hidden' }}
                        />
                        {note && (
                            <div className="text-myedlinks-gray-500 text-xs sm:text-sm mt-2">
                                Last edited by {note.lastEditedBy.username || 'Unknown'} on{' '}
                                {new Date(note.lastEditedAt).toLocaleDateString('id-ID', {
                                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </div>
                        )}
                    </div>

                    <div className="blocknote-editor-wrapper mx-auto w-full px-0 sm:px-4">
                        {/* Render BlockNoteView hanya jika instance editor tersedia */}
                        {editor && (
                            <BlockNoteView
                                editor={editor}
                                onChange={handleEditorContentChange}
                                className="blocknote-editor"
                                style={{ width: '100%', height: 'auto' }}
                                placeholder="Write something..."
                            />
                        )}
                        {/* Opsional: Indikator loading untuk editor itu sendiri */}
                        {!editor && (
                            <div className="min-h-[200px] flex items-center justify-center text-myedlinks-gray-500 text-base sm:text-lg">
                                Initializing editor...
                            </div>
                        )}
                    </div>
                </div>
            </Layout>
        </PrivateRoute>
    );
};

export default NoteDetailPage;