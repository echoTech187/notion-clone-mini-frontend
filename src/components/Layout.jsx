"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import axios from '../app/api/axios';
import Cookies from 'js-cookie';
import { v4 as uuid } from 'uuid';

const Layout = ({ children, title = 'NotionCloneMini', showSidebar = true }) => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notes, setNotes] = useState([]);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [errorNotes, setErrorNotes] = useState('');

    useEffect(() => {
        if (user) {
            const fetchNotes = async () => {
                try {
                    const res = await axios.get('/notes', {
                        headers: {
                            'Authorization': `Bearer ${Cookies.get('token')}`
                        }
                    });
                    setNotes(res.data.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
                } catch (err) {
                    setErrorNotes(err.response?.data?.message || 'Failed to fetch notes');
                    console.error('Error fetching notes:', err);
                } finally {
                    setLoadingNotes(false);
                }
            };
            fetchNotes();
        } else {
            setNotes([]);
            setLoadingNotes(false);
        }
    }, [user]);
    const createNewNote = async () => {
        try {
            // Generate a random ID for the initial block that BlockNote will create
            const initialBlockId = uuid();

            const res = await axios.post('/notes', {
                title: 'Untitled',
                initialBlockId: initialBlockId // Send initial block ID
            }, {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`
                }
            });
            // Add the new note to the beginning of the list and sort by updatedAt
            setNotes(prevNotes => [{
                _id: res.data._id,
                title: res.data.title,
                updatedAt: res.data.updatedAt,
                lastEditedBy: res.data.lastEditedBy,
            }, ...prevNotes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
            router.push(`/notes/${res.data._id}`);
            setIsSidebarOpen(false); // Close sidebar after creating a new note
        } catch (err) {
            console.error('Error creating note from sidebar:', err);
        }
    };

    const truncateTitle = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {user && (
                <header className="bg-white shadow-sm py-3 px-4 sm:px-6 md:px-8 flex items-center justify-between z-10">
                    <div className="flex items-center">
                        {showSidebar && (
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="mr-3 p-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 lg:hidden"
                            >
                                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                                </svg>
                            </button>
                        )}
                        <Link href="/" className="text-xl font-bold text-blue-600">
                            NotionCloneMini
                        </Link>
                    </div>
                    <nav className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <span className="text-gray-700 text-sm hidden sm:inline">Welcome, {user.name}!</span>
                                <button
                                    onClick={logout}
                                    className="btn-secondary px-3 py-1.5 text-sm"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="btn-secondary px-3 py-1.5 text-sm">
                                    Login
                                </Link>
                                <Link href="/register" className="btn-primary px-3 py-1.5 text-sm">
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
            )}


            <div className="flex flex-1 overflow-hidden">
                {showSidebar && (
                    <aside
                        className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out bg-white w-64 shadow-lg z-20 overflow-y-auto flex flex-col`}
                    >
                        <div className="p-4 border-b border-gray-200">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <nav className="flex-1 px-2 py-4">
                            <button
                                onClick={createNewNote}
                                className="w-full flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-200 mb-2 text-sm"
                            >
                                <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                New Page
                            </button>
                            {loadingNotes ? (
                                <div className="px-2 py-2 text-sm text-gray-500">Loading notes...</div>
                            ) : errorNotes ? (
                                <div className="px-2 py-2 text-sm text-red-500">{errorNotes}</div>
                            ) : notes.length === 0 ? (
                                <div className="px-2 py-2 text-sm text-gray-500">No notes yet. Create one!</div>
                            ) : (
                                <ul>
                                    {notes.map(note => (
                                        <li key={note._id}>
                                            <Link href={`/notes/${note._id}`} className="flex items-center px-2 py-2 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                {truncateTitle(note.title, 25)}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </nav>
                    </aside>
                )}

                <main className={`flex-1 overflow-y-auto ${showSidebar ? 'lg:ml-0' : ''}`}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;