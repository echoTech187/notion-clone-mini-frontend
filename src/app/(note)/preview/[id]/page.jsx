"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Editor from '../../../../hooks/useBlockNoteEditor';
import axios from '../../../api/axios';
import PreviewLayout from '../../../../components/PreviewLayout';
import PrivateRouter from '../../../../components/PrivateRouter';
import Link from 'next/link';


const PreviewPage = () => {
    const { id } = useParams();

    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [parsedContent, setParsedContent] = useState([{ type: 'paragraph', content: 'Loading...' }]);

    useEffect(() => {

        async function fetchNoteForPreview() {
            try {
                const res = await axios.get(`/preview/${id}`);

                let loadedBlocks = [];
                try {
                    // Parsing konten dari string JSON ke array of Block objects
                    if (typeof res.data.content === 'string' && res.data.content.startsWith('[')) {
                        loadedBlocks = JSON.parse(res.data.content);
                    } else if (Array.isArray(res.data.content)) {
                        loadedBlocks = res.data.content;
                    } else {
                        console.log("Note content is not in expected BlockNote array format for preview:", res.data.content);
                        loadedBlocks = [{ type: 'paragraph', content: 'Failed to load preview content.' }];
                    }
                } catch (parseError) {
                    console.log("Error parsing note content for preview:", parseError);
                    loadedBlocks = [{ type: 'paragraph', content: 'Error loading preview content.' }];
                }
                setParsedContent(loadedBlocks);
                setNote(res.data.data);
            } catch (err) {
                setError(err || 'Failed to fetch note preview');
                console.log('Error fetching note preview:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNoteForPreview();


    }, [id]);


    if (loading) {
        return (
            <PreviewLayout title={`Preview`}>
                <div className="flex justify-center items-center h-screen bg-gray-100">
                    <div className="text-xl font-semibold text-gray-700">Loading note preview...</div>
                </div>
            </PreviewLayout>
        );
    }

    if (error) {
        return (
            <PreviewLayout title={`Preview`}>
                <div className="p-4 sm:p-6 md:p-8">
                    <p className="text-red-600 text-lg text-center">{error}</p>
                    <Link href="/" className="block mx-auto mt-4 btn-secondary max-w-xs text-center">
                        Back to Dashboard
                    </Link>
                </div>
            </PreviewLayout>
        );
    }

    if (!note) {
        return (
            <PreviewLayout title={`Preview`}>
                <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center">
                    <p className="text-gray-600 text-xl mb-4">Note not found.</p>
                    <Link href="/" className="btn-primary">
                        Go to Dashboard
                    </Link>
                </div>
            </PreviewLayout>
        );
    }

    if (parsedContent.length === 0) {
        return (
            <PreviewLayout title={`Preview`}>
                <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center">
                    <p className="text-gray-600 text-xl mb-4">Note content is empty.</p>
                    <Link href="/" className="btn-primary">
                        Go to Dashboard
                    </Link>
                </div>
            </PreviewLayout>
        );
    } else {

        return (
            <>
                <PrivateRouter>
                    <PreviewLayout title={`Preview: ${note[0].title}`}>
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
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 w-full bg-transparent border-none outline-none resize-none placeholder-gray-400">
                                    {note[0].title}
                                </h1>
                                {note[0].lastEditedBy && (
                                    <div className="text-gray-500 text-xs sm:text-sm mt-2">
                                        Last edited by {note[0].lastEditedBy.username || 'Unknown'} on{' '}
                                        {new Date(note[0].lastEditedAt).toLocaleDateString('id-ID', {
                                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                )}
                            </div>

                            {!loading ? <div className="blocknote-editor-wrapper bg-white mx-auto w-full px-0 sm:px-4">
                                <Editor content={parsedContent} editable={false} />
                            </div> :
                                <div className='min-h-screen'>
                                    Loading...
                                </div>
                            }

                        </div>
                    </PreviewLayout>
                </PrivateRouter>
            </>
        );
    }
};

export default PreviewPage;