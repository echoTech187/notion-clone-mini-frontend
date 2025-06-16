"use client";
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function App() {
  const router = useRouter();
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);
}
