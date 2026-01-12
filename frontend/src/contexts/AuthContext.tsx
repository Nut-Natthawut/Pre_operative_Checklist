import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface User {
    id: string;
    username: string;
    role: 'admin' | 'user';
    fullName: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    isAdmin: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const refreshUser = async () => {
        const token = api.getToken();
        if (!token) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        const response = await api.getMe();
        if (response.success && response.data) {
            setUser(response.data as User);
        } else {
            api.setToken(null);
            setUser(null);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        refreshUser();
    }, []);

    const login = async (username: string, password: string) => {
        const response = await api.login(username, password);
        if (response.success && response.data) {
            setUser(response.data.user as User);
            return { success: true, message: response.message };
        }
        return { success: false, message: response.message };
    };

    const logout = () => {
        api.logout();
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isLoggedIn: !!user,
                isAdmin: user?.role === 'admin',
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
