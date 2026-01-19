import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import { io, Socket } from 'socket.io-client';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    role_id: number;
    grade?: string;
    plan_name?: string;
    subscription_expires_at?: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    loading: boolean;
    socket: Socket | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Fetch fresh user profile from backend
                    const res = await api.get('/api/auth/me');
                    console.log('AuthContext Fetched User:', res.data);
                    // Update user state and sync with local storage
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                } catch (err: any) {
                    console.error("Token validation failed", err);
                    if (err.response) {
                        // Only logout if the token is actually invalid/expired (401/403)
                        if (err.response.status === 401 || err.response.status === 403) {
                            logout();
                        }
                    } else {
                        // Network error or other issue - do not logout immediately, maybe retry or just keep loading false
                        console.warn("Network or server error during token validation, keeping session for now.");
                    }
                }
            }
            setLoading(false);
        };
        validateToken();
    }, []);

    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (user && token) {
            const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
            const newSocket = io(URL, {
                auth: { token },
                transports: ['polling', 'websocket']
            });
            setSocket(newSocket);
            return () => {
                newSocket.disconnect();
            };
        } else {
            setSocket(null);
        }
    }, [user]);

    const login = (token: string, userData: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, socket }}>
            {children}
        </AuthContext.Provider>
    );
};
