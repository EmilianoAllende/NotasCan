import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { UserPlus, Eye, EyeOff, KeyRound } from 'lucide-react'; // 🆕 Agregamos el ícono KeyRound

const UserAdmin = ({ currentUser, setNotification }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const adminToken = currentUser?.adminToken;

  // 🧠 Función para generar contraseña segura
  const generateSecurePassword = () => {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?';
    let newPass = '';
    for (let i = 0; i < 14; i++) {
      newPass += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPass);
    setShowPassword(true); // mostrarla automáticamente
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!adminToken) {
      setNotification({
        type: 'error',
        title: 'Error de Autenticación',
        message: 'No tienes el token de administrador para realizar esta acción.',
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.createUser(usuario, password, role, adminToken);

      if (response.data && response.data.status === 'success') {
        setNotification({
          type: 'success',
          title: 'Usuario Creado',
          message: response.data.message,
        });
        setUsuario('');
        setPassword('');
        setRole('user');
      } else {
        throw new Error(response.data.message || 'Respuesta inesperada del servidor');
      }
    } catch (err) {
      console.error('Error al crear usuario:', err);
      let message = 'No se pudo crear el usuario.';
      if (err.response) {
        message = err.response.data.message || message;
      } else if (err.code === 'ERR_NETWORK') {
        message = 'Error de red. No se pudo conectar al servidor.';
      }
      setNotification({ type: 'error', title: 'Error al Crear Usuario', message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <form
        onSubmit={handleCreateUser}
        autoComplete="off"
        className="bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-700 p-8 transition-all duration-300"
      >
        {/* Encabezado */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-600 rounded-full text-white shadow-md mb-4">
            <UserPlus size={26} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Crear Nuevo Usuario
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Añade credenciales seguras para nuevos usuarios.
          </p>
        </div>

        {/* Campo Usuario */}
        <div className="mb-5">
          <label
            htmlFor="new-usuario"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            Nuevo Usuario (ID)
          </label>
          <input
            id="new-usuario"
            name="nuevoUsuario"
            type="text"
            required
            autoComplete="new-username"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="ej. juan.perez"
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Campo Contraseña con botón de generar */}
        <div className="mb-5">
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            Nueva Contraseña
          </label>

          <div className="relative flex items-center">
            <input
              id="new-password"
              name="nuevaPassword"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 dark:placeholder-slate-500 pr-20"
            />

            {/* Toggle de visibilidad */}
            <button
              type="button"
              className="absolute inset-y-0 right-10 flex items-center text-slate-400 hover:text-blue-500 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            {/* Botón generar */}
            <button
              type="button"
              onClick={generateSecurePassword}
              title="Generar contraseña segura"
              className="absolute inset-y-0 right-0 px-3 flex items-center justify-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <KeyRound size={18} />
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="font-medium">Tip:</span> puedes generar una contraseña aleatoria segura.
          </p>
        </div>

        {/* Campo Rol */}
        <div className="mb-7">
          <label
            htmlFor="new-role"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            Rol del Usuario
          </label>
          <select
            id="new-role"
            name="nuevoRol"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="user">Usuario (user)</option>
            <option value="admin">Administrador (admin)</option>
          </select>
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-400/30 focus:outline-none transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creando...' : 'Crear Usuario'}
        </button>
      </form>
    </div>
  );
};

export default UserAdmin;
