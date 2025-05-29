import React, { createContext, useState, useEffect, useMemo } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
            setIsLoggedIn(true);
            const storedUser = localStorage.getItem('user');
            if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser) {
                setUser(parsedUser);
                }
            }
            }
        } catch (error) {
            console.error('Failed to parse user from localStorage', error);
        }
    }, []);


    const login = (user, token) => {
        setUser(user);
        setIsLoggedIn(true);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
    };

    const logout = () => {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    };

    const value = {
        isLoggedIn,
        user,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};