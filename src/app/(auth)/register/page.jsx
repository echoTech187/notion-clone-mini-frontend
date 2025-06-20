"use client";
import React, { useState } from 'react';
import AuthForm from '../../../components/AuthForm';
import AuthLayout from '../../../components/AuthLayout'; // Import Layout component
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

const RegisterPage = () => {
    const { register } = useAuth();
    const [errorMessage, setErrorMessage] = useState('');

    const handleRegister = async ({ username, email, password }) => {
        setErrorMessage('');
        const result = await register(username, email, password);
        if (!result.success) {
            setErrorMessage(result.message);
        }
    };

    return (
        // Layout component without sidebar for auth pages
        <AuthLayout title="Register" showSidebar={false}>
            <div className="flex flex-col lg:flex-row min-h-screen bg-white">
                {/* Left Section (Illustration) */}
                <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 bg-blue-50 relative overflow-hidden">
                    {/* Add your illustration SVG or image here */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 opacity-80"></div>
                    <div className="relative z-10 text-center">
                        <h1 className="text-4xl font-bold mb-4">Permudah interaksi antar <span className="text-yellow-600">Dosen</span> dan <span className="text-yellow-600">Mahasiswa</span> secara online!</h1>
                        {/* You can add your illustration image here, ensure it's in public folder */}
                        <img src="/illustrations/login-illustration.png" alt="Interaction Illustration" className="mt-8 max-w-lg mx-auto" />
                    </div>
                </div>

                {/* Right Section (Register Form) */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
                    <div className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-md">
                        <div className="text-center mb-6">
                            {/* Logo */}
                            <div className="flex justify-center items-center mb-4">
                                <span className="text-3xl font-bold text-blue-600">NotionCloneMini</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                Daftar Akun Baru
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Sudah punya akun?{' '}
                                <Link href="/login" className="text-blue-600 hover:underline">
                                    Login
                                </Link>
                            </p>
                        </div>
                        {errorMessage && <p className="text-red-500 text-center text-sm mb-4">{errorMessage}</p>}

                        {/* AuthForm component for the register logic */}
                        <AuthForm type="register" onSubmit={handleRegister} />

                    </div>
                </div>
            </div>
        </AuthLayout>
    );
};

export default RegisterPage;