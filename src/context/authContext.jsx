import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        const loadStoredData = () => {
            try {
                const storedToken = localStorage.getItem('authToken');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));

                    // Verify token with backend
                    api.get('/auth/me')
                        .then(res => {
                            setUser(res.data.user);
                            localStorage.setItem('user', JSON.stringify(res.data.user));
                        })
                        .catch(() => {
                            // Token expired or invalid
                            logout();
                        });
                }
            } catch (err) {
                console.error('Auth load error:', err);
            } finally {
                setLoading(false);
            }
        };

        loadStoredData();
    }, []);

    const login = async (email, password) => {
        try {
            setError(null);
            const res = await api.post('/auth/login', { email, password });

            const { token, user } = res.data;

            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);

            return { success: true, user };
        } catch (err) {
            const message = err.response?.data?.error || 'Login failed. Please try again.';
            setError(message);
            return { success: false, error: message };
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const res = await api.post('/auth/register', userData);

            const { token, user } = res.data;

            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);

            return { success: true, user };
        } catch (err) {
            const message = err.response?.data?.error || 'Registration failed. Please try again.';
            setError(message);
            return { success: false, error: message };
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const forgotPassword = async (email) => {
        try {
            setError(null);
            const res = await api.post('/auth/forgot-password', { email });
            return { success: true, message: res.data.message };
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to send reset link';
            setError(message);
            return { success: false, error: message };
        }
    };

    const updateProfile = async (data) => {
        try {
            const res = await api.put('/auth/profile', data);
            const updatedUser = res.data.user;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return { success: true, user: updatedUser };
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to update profile';
            setError(message);
            return { success: false, error: message };
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            await api.put('/auth/change-password', { currentPassword, newPassword });
            return { success: true, message: 'Password changed successfully' };
        } catch (err) {
            const message = err.response?.data?.error || 'Failed to change password';
            setError(message);
            return { success: false, error: message };
        }
    };

    const value = {
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        forgotPassword,
        updateProfile,
        changePassword,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isRider: user?.role === 'rider',
        isCustomer: user?.role === 'customer'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};