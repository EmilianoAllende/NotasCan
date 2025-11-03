import React from 'react';
import { Users, Eye, Mail, Building, FilePenLine, Database, LogOut, ShieldCheck } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher'; // Importamos el toggle

const Sidebar = ({ activeView, setActiveView, selectedOrg, onLogout, currentUser }) => {
  
  const mainTabs = [
    { id: 'listado', label: 'Gestión', icon: Users },
    { id: 'detalle', label: 'Detalle', icon: Eye },
    { id: 'editor', label: 'Editor', icon: FilePenLine },
    { id: 'campanas', label: 'Campañas', icon: Mail },
    { id: 'dashboard', label: 'Panel', icon: Building }
  ];

  // --- ¡NUEVO! Pestaña de Admin ---
  const adminTab = { id: 'admin', label: 'Admin Usuarios', icon: ShieldCheck };
  
  // --- CAMBIO: Comprueba "currentUser.rol" (en español) ---
  const tabsToShow = currentUser?.rol === 'admin' ? [...mainTabs, adminTab] : mainTabs;
  // --------------------------------

  return (
    // Contenedor principal del Sidebar
    <aside className="w-64 flex-shrink-0 flex flex-col bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      {/* Logo/Título de la App */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-slate-200 dark:border-slate-700">
        <Database size={20} className="text-blue-600 dark:text-blue-400" />
        <h1 className="ml-2 text-xl font-bold text-slate-900 dark:text-slate-100">
          NotasCan
        </h1>
      </div>

      {/* Contenedor de Navegación (ocupa el espacio restante) */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {tabsToShow.map((tab) => {
          const isDisabled = (tab.id === 'detalle' || tab.id === 'editor') && !selectedOrg;
          const isActive = activeView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              disabled={isDisabled}
              className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out
                ${
                  isActive
                    ? 'bg-blue-600 text-white' // Estilo Activo
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700' // Estilo Inactivo
                }
                ${
                  isDisabled
                    ? 'opacity-40 cursor-not-allowed' // Estilo Deshabilitado
                    : ''
                }
              `}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer del Sidebar (para el ThemeSwitcher y Logout) */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <ThemeSwitcher />
        {/* --- ¡NUEVO! Botón de Cerrar Sesión --- */}
        <button
          onClick={onLogout}
          className="flex items-center justify-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                     text-slate-600 dark:text-slate-400 
                     hover:bg-red-100 dark:hover:bg-red-900/30
                     hover:text-red-700 dark:hover:text-red-400
                     transition-colors duration-150 ease-in-out"
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;