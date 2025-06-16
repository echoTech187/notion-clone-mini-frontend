'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../app/api/axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = Cookies.get('token');
                if (token) {
                    localStorage.setItem('jwtToken', token);

                } else {
                    localStorage.removeItem('jwtToken');
                    setLoading(false);
                    return;
                }
                const res = await api.get('/auth/me', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (res.success) {
                    setUser(res.data);
                } else {
                    setUser(null);
                    localStorage.removeItem('jwtToken');
                }
            } catch (err) {
                console.error('Error loading user:', err);
                setUser(null);
                localStorage.removeItem('jwtToken');
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [router]);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password },
                {
                    withCredentials: false,
                    headers:
                    {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',

                    }
                }).then(res => res);
            if (res.data.success) {
                setUser(res.data.user);
                Cookies.set('token', res.data.token);
                localStorage.setItem('jwtToken', res.data.token);
                return { success: true };
            }
            return { success: false, message: 'Login gagal.' };
        } catch (err) {
            console.error('Login error:', err.response?.data?.message || err.message);
            return { success: false, message: err.response?.data?.message || 'Login gagal.' };
        }
    };

    const register = async (username, email, password) => {
        try {
            const res = await api.post('/auth/register', { username, email, password });
            if (res.data.success) {
                setUser(res.data.user);
                localStorage.setItem('jwtToken', res.data.token);
                return { success: true };
            }
            return { success: false, message: 'Registrasi gagal.' };
        } catch (err) {
            console.error('Register error:', err.response?.data?.message || err.message);
            return { success: false, message: err.response?.data?.message || 'Registrasi gagal.' };
        }
    };

    const logout = async () => {
        try {
            await api.get('/auth/logout', {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`
                }
            });
            setUser(null);
            localStorage.removeItem('jwtToken');
            return { success: true };
        } catch (err) {
            console.error('Logout error:', err.response?.data?.message || err.message);
            return { success: false, message: 'Logout gagal.' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);