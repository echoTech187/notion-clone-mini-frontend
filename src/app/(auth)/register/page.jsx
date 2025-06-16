// 'use client' karena ini adalah Client Component yang membutuhkan interaktivitas
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation'; // Menggunakan useRouter dari next/navigation
import Link from 'next/link'; // Menggunakan Link dari next/link
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
    const { register: registerUser, handleSubmit, formState: { errors } } = useForm();
    const router = useRouter();
    const { register } = useAuth();

    const onSubmit = async (data) => {
        const result = await register(data.username, data.password);
        if (result.success) {
            router.push('/notes');
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 min-w-screen md:min-w-md lg:min-w-md xl:min-w-md">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Daftar</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700">
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            id="name"
                            {...registerUser("name", { required: true })}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.name ? 'border-red-500' : ''}`}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            {...registerUser("email", { required: true })}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : ''}`}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700">
                            Sandi
                        </label>
                        <input
                            type="password"
                            id="password"
                            {...registerUser("password", { required: true })}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : ''}`}

                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="block text-gray-700">
                            Konfirmasi Sandi
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            {...registerUser("confirmPassword", { required: true })}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Daftar
                    </button>
                </form>
                <p className="mt-4 inline-block align-baseline font-bold text-sm text-gray-500">
                    Sudah punya akun?{" "}
                    <Link href="/login" className="text-blue-500 hover:underline">
                        Masuk
                    </Link>
                </p>
            </div>
        </div>
    );
}