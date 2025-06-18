"use client";
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-700">Loading...</p>
            </div>
        );
    }

    return children;
};

export default PrivateRoute;