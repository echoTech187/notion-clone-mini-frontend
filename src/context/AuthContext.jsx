'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../app/api/axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const loadUser = useCallback(async () => {
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
            if (res.data.success) {
                setUser(res.data.data);
                localStorage.setItem('jwtToken', res.data.token);
                Cookies.set('token', res.data.token);
                // router.push('/dashboard');
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
    }, []);
    useEffect(() => {
        loadUser();
    }, [loadUser]);

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
                router.push('/dashboard');
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
                router.push('/login');

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
            Cookies.remove('token');
            router.push('/login');
            return { success: true };
        } catch (err) {
            console.error('Logout error:', err.response?.data?.message || err.message);
            return { success: false, message: 'Logout gagal.' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout, loadUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);