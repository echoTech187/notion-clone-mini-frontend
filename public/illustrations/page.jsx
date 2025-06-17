"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation';
import axios from '../../../api/axios';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import "@blocknote/core/fonts/inter.css";
import "@blocknote/core/style.css";
import Layout from '../../../../components/Layout';
import PrivateRoute from '../../../../components/PrivateRouter';
// import socket from '../../../api/socket';
import Link from 'next/link';
import Cookies from 'js-cookie';

const NoteDetailPage = () => {
    const router = useSearchParams();
    const { id } = router.get('id') ? JSON.parse(router.get('id')) : useParams();

    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [title, setTitle] = useState('');
    const [initialContent, setInitialContent] = useState([]); // This state will hold BlockNote's expected content format
    const [isSaving, setIsSaving] = useState(false);
    const [editorReady, setEditorReady] = useState(false);

    const saveTimeoutRef = useRef(null);
    const isUpdatingEditorRef = useRef(false); // Flag to prevent editor change from re-triggering auto-save immediately after remote update

    const editor = useCreateBlockNote();




    useEffect(() => {

        if (!id || !editor) return;

        const fetchNote = async () => {
            try {
                const res = await axios.get(`/notes/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${Cookies.get('token')}`
                    }
                });
                setNote(res.data);
                setTitle(res.data.title);

                const loadedBlocks = res.data.content; // Backend now sends content in the expected BlockNote format

                // Set initialContent for the editor initialization (if it hasn't happened yet)
                setInitialContent(loadedBlocks);

                // Update editor content if it's already initialized
                if (editorReady) {
                    isUpdatingEditorRef.current = true; // Set flag to prevent re-saving
                    editor.replaceBlocks(editor.topLevelBlocks, loadedBlocks);
                }

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
        const saveNoteToBackend = async (currentTitle, currentBlocks) => {
            if (!id || !editorReady) return;

            setIsSaving(true);
            try {
                const res = await axios.put(`/notes/${id}`, {
                    title: currentTitle,
                    blocks: currentBlocks, // Send the BlockNote's topLevelBlocks
                },
                    {
                        headers: {
                            'Authorization': `Bearer ${Cookies.get('token')}`
                        }
                    });
                setNote(prevNote => ({
                    ...prevNote,
                    title: res.data.title,
                    updatedAt: res.data.updatedAt,
                    lastEditedBy: res.data.lastEditedBy,
                }));
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to auto-save note');
                console.error('Error auto-saving note:', err);
            } finally {
                setIsSaving(false);
            }
        };

    }, [id, editor, router, saveNoteToBackend, isSaving, editorReady]);

    // Effect to handle title changes separately
    useEffect(() => {
        // Trigger save only if note is loaded and title has changed from its loaded state
        if (!loading && note && title !== note.title && editorReady) {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = setTimeout(() => {
                saveNoteToBackend(title, editor.topLevelBlocks);
            }, 1000);
        }
    }, [title, loading, note, editor, saveNoteToBackend, editorReady]);


    const handleManualSave = async () => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        const saved = await saveNoteToBackend(title, editor.topLevelBlocks);
        if (!saved) return;
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
                <div className="relative max-w-4xl mx-auto py-4 sm:py-6 md:py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 px-0 sm:px-4">
                        <div className="flex space-x-2 sm:space-x-4 items-center mb-4 sm:mb-0 w-full sm:w-auto">
                            {isSaving && <span className="text-sm text-myedlinks-gray-600">Saving...</span>}
                            <Link href={`/preview/${id}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center btn-secondary py-1 px-2 sm:py-1.5 sm:px-3 text-xs sm:text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 sm:h-5 sm:w-5 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057 .458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                Preview
                            </Link>
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
                                Last edited by {note.data[0].lastEditedBy.username || 'Unknown'} on{' '}
                                {new Date(note.data[0].updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </div>
                        )}
                    </div>

                    <div className="blocknote-editor-wrapper mx-auto w-full px-0 sm:px-4">
                        {editor ? (
                            <BlockNoteView editor={editor} />
                        ) : (
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