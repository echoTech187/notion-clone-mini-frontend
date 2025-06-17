"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import axios from '../../../api/axios';
import dynamic from 'next/dynamic';
import Layout from '../../../../components/Layout';
import Link from 'next/link';
const BlockNoteView = dynamic(() => import('@blocknote/mantine').then((mod) => {
    return mod.BlockNoteView;
}), {
    ssr: false,
    loading: () => <p>Loading editor content...</p>, // Optional loading state
});

const PreviewPage = () => {
    const router = useSearchParams();
    const { id } = router.get('id') ? JSON.parse(router.get('id')) : useParams();

    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [parsedContent, setParsedContent] = useState([]);

    useEffect(() => {
        if (!id) return;

        const fetchNoteForPreview = async () => {
            try {
                const res = await axios.get(`/preview/${id}`);
                setNote(res.data);

                let loadedBlocks = [];
                try {
                    // Parsing konten dari string JSON ke array of Block objects
                    if (typeof res.data.content === 'string' && res.data.content.startsWith('[')) {
                        loadedBlocks = JSON.parse(res.data.content);
                    } else if (Array.isArray(res.data.content)) {
                        loadedBlocks = res.data.content;
                    } else {
                        console.warn("Note content is not in expected BlockNote array format for preview:", res.data.content);
                        loadedBlocks = [{ type: 'paragraph', content: 'Failed to load preview content.' }];
                    }
                } catch (parseError) {
                    console.error("Error parsing note content for preview:", parseError);
                    loadedBlocks = [{ type: 'paragraph', content: 'Error loading preview content.' }];
                }
                setParsedContent(loadedBlocks);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch note preview');
                console.error('Error fetching note preview:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNoteForPreview();
    }, [id, router]);

    if (loading) {
        return (
            <Layout title="Loading Preview" showSidebar={false}>
                <div className="flex justify-center items-center h-screen bg-myedlinks-gray-100">
                    <div className="text-xl font-semibold text-myedlinks-gray-700">Loading note preview...</div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Error" showSidebar={false}>
                <div className="p-4 sm:p-6 md:p-8">
                    <p className="text-red-600 text-lg text-center">{error}</p>
                    <Link href="/" className="block mx-auto mt-4 btn-secondary max-w-xs text-center">
                        Back to Dashboard
                    </Link>
                </div>
            </Layout>
        );
    }

    if (!note) {
        return (
            <Layout title="Note Not Found" showSidebar={false}>
                <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center">
                    <p className="text-myedlinks-gray-600 text-xl mb-4">Note not found.</p>
                    <Link href="/" className="btn-primary">
                        Go to Dashboard
                    </Link>
                </div>
            </Layout>
        );
    }

    if (parsedContent.length === 0) {
        return (
            <Layout title="Note Not Found" showSidebar={false}>
                <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center">
                    <p className="text-myedlinks-gray-600 text-xl mb-4">Note content is empty.</p>
                    <Link href="/" className="btn-primary">
                        Go to Dashboard
                    </Link>
                </div>
            </Layout>
        );
    }
    console.log(note);
    return (
        <Layout title={`Preview: ${note.title}`} showSidebar={false}>
            <div className="relative max-w-screen mx-auto py-4 sm:py-6 md:py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 px-0 sm:px-4">
                    <Link href={`/notes/${id}`} className="btn-secondary mb-4 sm:mb-0">
                        &larr; Back to Editor
                    </Link>
                    <Link href="/" className="btn-primary">
                        Go to Dashboard
                    </Link>
                </div>

                <div className="px-0 sm:px-4 mb-4 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-myedlinks-gray-800 w-full bg-transparent border-none outline-none resize-none placeholder-myedlinks-gray-400">
                        {note.title}
                    </h1>
                    {note.lastEditedBy && (
                        <div className="text-myedlinks-gray-500 text-xs sm:text-sm mt-2">
                            Last edited by {note.lastEditedBy.username || 'Unknown'} on{' '}
                            {new Date(note.updatedAt).toLocaleDateString('id-ID', {
                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                        </div>
                    )}
                </div>

                <div className="blocknote-editor-wrapper mx-auto w-full px-0 sm:px-4">
                    <BlockNoteView theme={'light'} blocks={parsedContent} editor={null} editable={false} previewMode />
                </div>
            </div>
        </Layout>
    );
};

export default PreviewPage;