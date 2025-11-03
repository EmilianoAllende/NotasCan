import React, { useState } from 'react';
import { Users, Eye, Mail, Building, FilePenLine, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

const Sidebar = ({ activeView, setActiveView, selectedOrg }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    { id: 'listado', label: 'Gestión', icon: Users },
    { id: 'detalle', label: 'Detalle', icon: Eye },
    { id: 'editor', label: 'Editor', icon: FilePenLine },
    { id: 'campanas', label: 'Campañas', icon: Mail },
    { id: 'dashboard', label: 'Panel', icon: Building },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } flex-shrink-0 flex flex-col bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300`}
    >
      {/* Header del Sidebar */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center">
          <Database size={20} className="text-blue-600 dark:text-blue-400" />
          {!isCollapsed && (
            <h1 className="ml-2 text-xl font-bold text-slate-900 dark:text-slate-100">
              NotasCan
            </h1>
          )}
        </div>

        {/* Botón para colapsar/expandir */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          {isCollapsed ? (
            <ChevronRight size={18} className="text-slate-600 dark:text-slate-300" />
          ) : (
            <ChevronLeft size={18} className="text-slate-600 dark:text-slate-300" />
          )}
        </button>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {tabs.map((tab) => {
          const isDisabled = (tab.id === 'detalle' || tab.id === 'editor') && !selectedOrg;
          const isActive = activeView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              disabled={isDisabled}
              className={`flex items-center w-full ${
                isCollapsed ? 'justify-center' : 'gap-3 px-3'
              } py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out
                ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }
                ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
              `}
            >
              <tab.icon size={18} />
              {!isCollapsed && <span>{tab.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className={`p-4 border-t border-slate-200 dark:border-slate-700 ${
          isCollapsed ? 'flex justify-center' : ''
        }`}
      >
        <ThemeSwitcher />
      </div>
    </aside>
  );
};

export default Sidebar;
