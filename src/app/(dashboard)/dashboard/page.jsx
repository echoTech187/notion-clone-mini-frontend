'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../api/axios';
import { useAuth } from '@/context/AuthContext';
import Cookies from 'js-cookie';

export default function HomePage() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const { user, logout } = useAuth();
    const [users, setUsers] = useState(user);

    useEffect(() => {

        const fetchUser = async () => {
            try {
                const res = await api.get('/auth/me', {
                    headers: {
                        Authorization: `Bearer ${Cookies.get('token')}`,
                    },
                });
                setUsers(res.data.data);
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('Failed to load user. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        const fetchNotes = async () => {
            try {
                const res = await api.get('/notes', {
                    headers: {
                        Authorization: `Bearer ${Cookies.get('token')}`,
                    },
                });
                setNotes(res.data.data);
            } catch (err) {
                console.error('Error fetching notes:', err);
                setError('Failed to load notes. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
        fetchNotes();
    }, []);

    const handleCreateNewNote = async () => {
        router.push('/dashboard/new');
    };

    const handleDeleteNote = async (noteId) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await api.delete(`/notes/${noteId}`, {
                    headers: {
                        Authorization: `Bearer ${Cookies.get('token')}`,
                    },
                });
                setNotes(notes.filter(note => note._id !== noteId));
            } catch (err) {
                console.error('Error deleting note:', err);
                alert('Failed to delete note. Please try again.');
            }
        }
    };

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            router.push('/login');
        } else {
            alert(result.message);
        }
    };
    if (loading) return <div className="text-center mt-8">Loading your notes...</div>;
    if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;
    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Halo, {users?.name || 'Pengguna'}! Catatan Anda</h1>
                <div className="flex gap-4">
                    <button
                        onClick={handleCreateNewNote}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Buat Catatan Baru
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-5 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {notes.length === 0 ? (
                <p className="text-center text-gray-600 mt-10">Anda belum memiliki catatan. Buat catatan pertama Anda!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map((note) => (
                        <div key={note._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-semibold mb-2 truncate">{note.title || 'Untitled Note'}</h2>
                                <p className="text-gray-600 text-sm mb-2">
                                    Terakhir diperbarui: {new Date(note.updatedAt).toLocaleString()}
                                </p>
                                {note.lastEditedBy && (
                                    <p className="text-gray-500 text-xs mb-4">
                                        Oleh: {note.lastEditedBy.username} pada {new Date(note.lastEditedAt).toLocaleString()}
                                    </p>
                                )}
                                <div className="text-gray-700 text-sm line-clamp-3">
                                    {/* Menampilkan ringkasan blok */}
                                    {note.blocks && note.blocks.slice(0, 3).map((block, idx) => (
                                        <p key={idx}>
                                            {block.type === 'text' && (block.content || '').replace(/<[^>]*>/g, '').substring(0, 50) + '...'}
                                            {block.type === 'checklist' && `[${block.checked ? 'x' : ' '}] ${block.content?.substring(0, 50) || ''}...`}
                                            {block.type === 'image' && `[Image: ${block.alt || 'No description'}]`}
                                            {block.type === 'code' && `[Code: ${block.language || 'text'}] ${block.content?.substring(0, 50) || ''}...`}
                                        </p>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() => router.push(`/dashboard/${note._id}`)}
                                    className="flex-grow px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteNote(note._id)}
                                    className="flex-grow px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}