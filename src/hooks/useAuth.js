// src/hooks/useAuth.js
import { useState, useCallback } from "react";

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const item = localStorage.getItem("currentUser");
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error("Error reading currentUser from localStorage:", e);
            return null;
        }
    });
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!currentUser);

    const handleLogout = useCallback(() => {
        localStorage.removeItem("currentUser");
        setCurrentUser(null);
        setIsAuthenticated(false);
    }, []);

    const handleLoginSuccess = useCallback((userData) => {
        // userData is assumed to be { user: { ... } }
        localStorage.setItem("currentUser", JSON.stringify(userData.user));
        setCurrentUser(userData.user);
        setIsAuthenticated(true);
    }, []);

    return {
        currentUser,
        isAuthenticated,
        handleLoginSuccess,
        handleLogout,
    };
};