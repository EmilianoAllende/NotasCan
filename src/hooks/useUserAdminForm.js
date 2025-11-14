// src/hooks/useUserAdminForm.js
import { useState, useCallback } from "react";
import apiClient from "../api/apiClient"; // Ajusta la ruta si es necesario

// Función helper pura (fuera del hook para que no se recree)
const generateSecurePassword = () => {
	const charset =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
	let newPass = "";
	for (let i = 0; i < 14; i++) {
		newPass += charset.charAt(Math.floor(Math.random() * charset.length));
	}
	return newPass;
};

export const useUserAdminForm = ({
	currentUser,
	setNotification,
	setConfirmProps,
	closeConfirm,
}) => {
	// --- ESTADO DEL FORMULARIO ---
	const [usuario, setUsuario] = useState("");
	const [password, setPassword] = useState("");
	const [rol, setRol] = useState("user");
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const adminToken = currentUser?.token;

	// --- HANDLER: Generar contraseña ---
	const handleGeneratePassword = () => {
		const newPass = generateSecurePassword();
		setPassword(newPass);
		setShowPassword(true);
	};

	// --- LÓGICA: Ejecutar la creación (privada) ---
	const _executeCreateUser = useCallback(async () => {
		setIsLoading(true);

		if (!adminToken) {
			setNotification({
				type: "error",
				title: "Error de Autenticación",
				message:
					"No tienes el token de administrador para realizar esta acción.",
			});
			setIsLoading(false);
			return;
		}

		try {
			const response = await apiClient.createUser(
				usuario,
				password,
				rol,
				adminToken
			);
			if (response.data && response.data.status === "success") {
				setNotification({
					type: "success",
					title: "Usuario Creado",
					message: response.data.message,
				});
				// Limpiar formulario
				setUsuario("");
				setPassword("");
				setRol("user");
				setShowPassword(false);
			} else {
				throw new Error(
					response.data.message || "Respuesta inesperada del servidor"
				);
			}
		} catch (err) {
			console.error("Error al crear usuario:", err);
			let message = "No se pudo crear el usuario.";
			if (err.response) {
				message = err.response.data.message || message;
			} else if (err.code === "ERR_NETWORK") {
				message = "Error de red. No se pudo conectar al servidor.";
			}
			setNotification({
				type: "error",
				title: "Error al Crear Usuario",
				message,
			});
		} finally {
			setIsLoading(false);
		}
	}, [
		adminToken,
		usuario,
		password,
		rol,
		setNotification,
		setIsLoading,
		setUsuario,
		setPassword,
		setRol,
	]);

	// --- HANDLER: Submit del formulario (público) ---
	const handleCreateUser = useCallback(
		(e) => {
			e.preventDefault();

			if (!usuario.trim() || !password.trim()) {
				setNotification({
					type: "warning",
					title: "Campos Requeridos",
					message:
						"El nombre de usuario y la contraseña no pueden estar vacíos.",
				});
				return;
			}

			setConfirmProps({
				show: true,
				title: "Confirmar Creación",
				message: `¿Estás seguro de que quieres crear el usuario "${usuario}" con el rol "${rol}"?`,
				confirmText: "Sí, crear usuario",
				cancelText: "Cancelar",
				type: "info",
				onConfirm: () => {
					_executeCreateUser();
					closeConfirm();
				},
			});
		},
		[
			usuario,
			password,
			rol,
			_executeCreateUser,
			setConfirmProps,
			closeConfirm,
			setNotification,
		]
	);

	// --- RETORNO: Estado y Handlers para el JSX ---
	return {
		usuario,
		setUsuario,
		password,
		setPassword,
		rol,
		setRol,
		isLoading,
		showPassword,
		setShowPassword,
		handleGeneratePassword,
		handleCreateUser,
	};
};
