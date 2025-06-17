"use client";
import React, { useEffect } from 'react';
import Layout from '../../../components/Layout';
import PrivateRoute from '../../../components/PrivateRouter';
import { useAuth, AuthProvider } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const HomePage = () => {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const token = Cookies.get('token');

        if (!token) {
            router.push('/login');
        } else {
            router.push('/dashboard');
        }
    }, [user, router]);
    return (
        <AuthProvider>
            <PrivateRoute>
                <Layout title="Dashboard">
                    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-myedlinks-gray-800 text-center mb-6">
                            Welcome to NotionCloneMini, {user?.username || 'Guest'}!
                        </h1>
                        <p className="text-xl text-myedlinks-gray-600 text-center mb-8 max-w-2xl">
                            This is your personalized workspace. Start organizing your thoughts, notes, and projects.
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            <button
                                onClick={() => router.push('/notes')}
                                className="btn-primary py-3 px-6 text-lg"
                            >
                                Create New Note
                            </button>
                        </div>
                    </div>
                </Layout>
            </PrivateRoute>
        </AuthProvider>
    );
};

export default HomePage;