// src/hooks/useAuthHandlers.js
import { useCallback } from "react";

/**
 * Hook para manejar la lógica de autenticación (Login/Logout).
 */
export const useAuthHandlers = (
	setCurrentUser,
	setIsAuthenticated,
	setActiveView
) => {
	const handleLogout = useCallback(() => {
		localStorage.removeItem("currentUser");
		setCurrentUser(null);
		setIsAuthenticated(false);
		setActiveView("listado");
	}, [setCurrentUser, setIsAuthenticated, setActiveView]);

	const handleLoginSuccess = useCallback(
		(userData) => {
			localStorage.setItem("currentUser", JSON.stringify(userData.user));
			setCurrentUser(userData.user);
			setIsAuthenticated(true);
			setActiveView("listado");
		},
		[setCurrentUser, setIsAuthenticated, setActiveView]
	);

	return {
		handleLoginSuccess,
		handleLogout,
	};
};
