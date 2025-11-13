import React, { useState } from "react";
import apiClient from "../../api/apiClient";
import { UserPlus, Eye, EyeOff, KeyRound } from "lucide-react";

const UserAdmin = ({
	currentUser,
	setNotification,
	setConfirmProps,
	closeConfirm,
}) => {
	const [usuario, setUsuario] = useState("");
	const [password, setPassword] = useState("");
	const [rol, setRol] = useState("user");
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const adminToken = currentUser?.token;

	const generateSecurePassword = () => {
		const charset =
			"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
		let newPass = "";
		for (let i = 0; i < 14; i++) {
			newPass += charset.charAt(Math.floor(Math.random() * charset.length));
		}
		setPassword(newPass);
		setShowPassword(true);
	};

	const _executeCreateUser = async () => {
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
				setUsuario("");
				setPassword("");
				setRol("user");
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
	};

	const handleCreateUser = (e) => {
		e.preventDefault();
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
	};

	return (
		<div className="flex justify-center items-center min-h-[80vh]">
			<div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8">
				<div className="flex flex-col items-center mb-8">
					<div className="p-3 bg-blue-600 rounded-full text-white shadow-md mb-4">
						<UserPlus size={26} />
					</div>
					<h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
						Crear Nuevo Usuario
					</h1>
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-center">
						Añade credenciales seguras para nuevos usuarios del sistema.
					</p>
				</div>

				{/* 🔒 Autocompletado desactivado */}
				<form
					onSubmit={handleCreateUser}
					autoComplete="off"
					autoCapitalize="off"
					autoCorrect="off"
					spellCheck="false"
					className="space-y-6">
					{/* Usuario */}
					<div>
						<label
							htmlFor="new-usuario"
							className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Nombre de Usuario
						</label>
						<input
							id="new-usuario"
							name="new-usuario"
							type="text"
							required
							value={usuario}
							onChange={(e) => setUsuario(e.target.value)}
							placeholder="ej. juan.perez"
							autoComplete="off"
							className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500"
						/>
					</div>

					{/* Contraseña */}
					<div>
						<label
							htmlFor="new-password"
							className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Contraseña
						</label>
						<div className="relative">
							<input
								id="new-password"
								name="new-password"
								type={showPassword ? "text" : "password"}
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="••••••••••••"
								autoComplete="new-password"
								className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-20"
							/>
							<button
								type="button"
								className="absolute inset-y-0 right-10 flex items-center text-slate-400 hover:text-blue-500 transition-colors"
								onClick={() => setShowPassword(!showPassword)}>
								{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
							<button
								type="button"
								onClick={generateSecurePassword}
								title="Generar contraseña segura"
								className="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
								<KeyRound size={18} />
							</button>
						</div>
					</div>

					{/* Rol */}
					<div>
						<label
							htmlFor="new-role"
							className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Rol del Usuario
						</label>
						<select
							id="new-role"
							name="new-role"
							value={rol}
							onChange={(e) => setRol(e.target.value)}
							autoComplete="off"
							className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
							<option value="user">Usuario (user)</option>
							<option value="admin">Administrador (admin)</option>
						</select>
					</div>

					{/* Botón */}
					<button
						type="submit"
						disabled={isLoading}
						className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg focus:ring-4 focus:ring-blue-400/30 focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
						{isLoading ? "Creando usuario..." : "Crear Usuario"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default UserAdmin;
