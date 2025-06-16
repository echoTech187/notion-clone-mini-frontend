
'use client';

import axios from 'axios';
import { redirect } from 'next/navigation';
import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: 'http://localhost:8080/api'
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.log('Token kamu telah kadaluarsa. Silahkan login kembali..');
            // Hapus token lokal (jika disimpan)
            localStorage.removeItem('jwtToken');
            Cookies.remove('token');
            // Redirect ke halaman login
            redirect('/login');
        }
        return Promise.reject(error);
    }
)

export default api;