'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

export default function LoginPage() {
    const { register: loginUser, handleSubmit, formState: { errors } } = useForm();
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        setLoading(true);
        const token = Cookies.get('token');
        if (token) {
            router.push('/dashboard');
        } else {
            setLoading(false);
        }
    }, [router]);

    const onSubmit = async (data) => {
        console.log(data);
        const result = await login(data.email, data.password);
        if (result.success) {
            router.push('/dashboard');
        } else {
            alert(result.message);
        }
    };
    if (loading) {
        return <div className='min-h-screen w-screen flex items-center justify-center '></div>;
    } else {
        setLoading(false);
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 min-w-md">
            <div className="bg-white p-8 rounded-lg shadow-md w-full ">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Masuk</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name='email'
                            {...loginUser("email", { required: true })}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : ''}`}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Sandi
                        </label>
                        <input
                            type="password"
                            id="password"
                            name='password'
                            {...loginUser("password", { required: true })}
                            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.password ? 'border-red-500' : ''}`}
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Masuk
                    </button>
                </form>
                <p className="mt-4 inline-block align-baseline font-bold text-sm text-gray-500">
                    Belum punya akun?{" "}
                    <Link href="/register" className="text-blue-500 hover:underline">
                        Daftar
                    </Link>
                </p>
            </div>
        </div>
    );
}