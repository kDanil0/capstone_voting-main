import React, { createContext, useContext, useEffect, useState } from 'react'
import { getUser } from './api';

export const AuthContext = createContext({
    user: null,
    token: null,
    setUser: () => {},
    setToken: () => {}
});

function AuthContextProvider({children}) {
    // Initialize states from localStorage
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // Combined effect for token and user management
    useEffect(() => {
        const handleAuth = async () => {
            if (token) {
                localStorage.setItem('token', token);
                try {
                    const userData = await getUser(token);
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } catch (error) {
                    console.error("Failed to fetch user:", error);
                    // Clear everything on error
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                }
            } else {
                // Clear everything when there's no token
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            }
        };

        handleAuth();
    }, [token]); // Only depend on token changes

    return (
        <AuthContext.Provider value={{ user, token, setUser, setToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContextProvider;
export const useAuthContext = () => useContext(AuthContext);
