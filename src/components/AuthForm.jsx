import React, { useState } from 'react';
import Link from 'next/link';

const AuthForm = ({ type, onSubmit, errorMessage }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (type === 'register' && password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        onSubmit({ username, email, password });
    };

    return (
        <form onSubmit={handleSubmit}>
            {type === 'register' && (
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        className="shadow appearance-none border  placeholder:text-sm border-grey-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Masukkan username Anda"
                    />
                </div>
            )}
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    className="shadow appearance-none border  placeholder:text-sm border-grey-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Contoh: email@example.com"
                />
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                    Password
                </label>
                <div className="relative">
                    <input
                        type="password" // Keep as password type for security
                        id="password"
                        className="shadow appearance-none border  placeholder:text-sm border-grey-300 rounded w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Masukkan kata sandi kamu"
                    />
                    {/* Eye icon - purely decorative if not implementing show/hide password */}
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </span>
                </div>
                {type === 'login' && (
                    <div className="text-right mt-2">
                        <Link href="/forgot-password" className="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800">
                            Lupa kata sandi?
                        </Link>
                    </div>
                )}
            </div>
            {type === 'register' && (
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                        Konfirmasi Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        className="shadow appearance-none border  placeholder:text-sm border-grey-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Konfirmasi kata sandi"
                    />
                </div>
            )}
            <div className="flex items-center justify-between">
                <button
                    type="submit"
                    className="btn-primary w-full py-2"
                >
                    {type === 'login' ? 'Masuk' : 'Daftar'}
                </button>
            </div>
        </form>
    );
};

export default AuthForm;