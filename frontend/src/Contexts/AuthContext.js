import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const isTokenExpired = (token) => {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    };

    useEffect(() => {
        try {
            const token = localStorage.getItem("authToken");
            const storedUser = localStorage.getItem("user");

            if (!token || isTokenExpired(token)) {
                logout();
                return;
            }

            setIsLoggedIn(true);

            if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Auth init failed", error);
            logout();
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
        localStorage.clear();
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