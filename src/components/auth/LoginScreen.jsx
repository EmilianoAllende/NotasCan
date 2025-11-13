import React, { useState } from "react";
import apiClient from "../../api/apiClient";
import { Database, Lock, AlertTriangle, Eye, EyeOff } from "lucide-react";

const LoginScreen = ({ onLoginSuccess }) => {
	const [usuario, setUsuario] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleLogin = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			// 1. Llama a la función de login del apiClient
			const response = await apiClient.login(usuario, password);

			// 2. Si el status es 'success', llama a la función onLoginSuccess
			//    (App.jsx recibirá el objeto { status: 'success', user: {...} })
			if (response.data && response.data.status === "success") {
				onLoginSuccess(response.data);
			} else {
				// Esto no debería pasar si el backend devuelve 401 en error
				setError("Respuesta inesperada del servidor.");
			}
		} catch (err) {
			// 3. Maneja los errores
			if (err.response && err.response.status === 401) {
				// Error 401 (Unauthorized) es el esperado para credenciales incorrectas
				setError("Usuario o contraseña incorrectos.");
			} else if (err.code === "ERR_NETWORK") {
				// Error de conexión con n8n
				setError("Error de red. No se pudo conectar al servidor.");
			} else {
				// Otro tipo de error
				console.error("Error de login:", err);
				setError("Ocurrió un error inesperado.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-900 p-4 w-full">
			<div className="w-full max-w-md">
				<form
					onSubmit={handleLogin}
					className="bg-white dark:bg-slate-800 shadow-xl rounded-xl border border-slate-200 dark:border-slate-700 p-8 pt-6">
					{/* Encabezado del formulario */}
					<div className="flex flex-col items-center mb-6">
						<div className="p-3 bg-blue-600 rounded-full text-white mb-3">
							<Database size={24} />
						</div>
						<h1 className="text-2xl font-bold text-slate-900 dark:text-white">
							Iniciar Sesión
						</h1>
						<p className="text-sm text-slate-500 dark:text-slate-400">
							Acceso al panel de NotasCan
						</p>
					</div>

					{/* Mensaje de Error */}
					{error && (
						<div className="mb-4 flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
							<AlertTriangle size={18} className="flex-shrink-0" />
							<p>{error}</p>
						</div>
					)}

					{/* Campo de Usuario */}
					<div className="mb-4">
						<label
							htmlFor="usuario"
							className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
							Usuario
						</label>
						<input
							id="usuario"
							name="usuario"
							type="text"
							autoComplete="username"
							required
							value={usuario}
							onChange={(e) => setUsuario(e.target.value)}
							className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="alex"
						/>
					</div>

					{/* Campo de Contraseña */}
					<div className="mb-6">
						<label
							htmlFor="password"
							className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
							Contraseña
						</label>
						<div className="relative">
							<input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								autoComplete="off"
								placeholder="••••••••"
								className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
								aria-label={
									showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
								}>
								{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						</div>
					</div>

					{/* Botón de Submit */}
					<button
						type="submit"
						disabled={isLoading}
						className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-70 disabled:cursor-not-allowed">
						{isLoading ? (
							<>
								<svg
									className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24">
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Ingresando...
							</>
						) : (
							<>
								<Lock size={16} />
								Ingresar
							</>
						)}
					</button>
				</form>
			</div>
		</div>
	);
};

export default LoginScreen;
