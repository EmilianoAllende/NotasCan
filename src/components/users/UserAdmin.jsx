// src/components/users/UserAdmin.jsx
import React from "react";
import { UserPlus, Eye, EyeOff, KeyRound } from "lucide-react";
import { useUserAdminForm } from "../../hooks/useUserAdminForm";
const UserAdmin = (props) => {
	const {
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
	} = useUserAdminForm(props); // Pasamos todas las props (currentUser, setNotification, etc.)

	// 2. El JSX se mantiene casi idéntico, solo conecta los handlers y el estado
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

				<form
					onSubmit={handleCreateUser} // Conectado al hook
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
							value={usuario} // Conectado al hook
							onChange={(e) => setUsuario(e.target.value)} // Conectado al hook
							placeholder="ej. juan.perez"
							autoComplete="off"
							className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500"
						/>
					</div>

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
								type={showPassword ? "text" : "password"} // Conectado al hook
								required
								value={password} // Conectado al hook
								onChange={(e) => setPassword(e.target.value)} // Conectado al hook
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
								onClick={handleGeneratePassword} // Conectado al hook
								title="Generar contraseña segura"
								className="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
								<KeyRound size={18} />
							</button>
						</div>
					</div>

					<div>
						<label
							htmlFor="new-role"
							className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
							Rol del Usuario
						</label>
						<select
							id="new-role"
							name="new-role"
							value={rol} // Conectado al hook
							onChange={(e) => setRol(e.target.value)} // Conectado al hook
							autoComplete="off"
							className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
							<option value="user">Usuario (user)</option>
							<option value="admin">Administrador (admin)</option>
						</select>
					</div>
					<button
						type="submit"
						disabled={isLoading} // Conectado al hook
						className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg focus:ring-4 focus:ring-blue-400/30 focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed">
						{isLoading ? "Creando usuario..." : "Crear Usuario"}
					</button>
				</form>
			</div>
		</div>
	);
};
export default UserAdmin;
