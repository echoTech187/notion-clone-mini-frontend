'use client';
import { useAuth } from '../context/AuthContext';
import { redirect } from 'next/navigation';
const PrivateRoute = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        redirect('/login');
    }

    return children;
};

export default PrivateRoute;