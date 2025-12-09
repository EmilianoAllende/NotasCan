import React from 'react';
import { Users, Eye, Mail, Building, FilePenLine } from 'lucide-react';

const NavigationBar = ({ activeView, setActiveView, selectedOrg }) => {
  const tabs = [
    { id: 'listado', label: 'Gestión', icon: Users },
    { id: 'detalle', label: 'Detalle', icon: Eye },
    { id: 'editor', label: 'Editor', icon: FilePenLine },
    { id: 'campanas', label: 'Campañas', icon: Mail },
    { id: 'dashboard', label: 'Panel', icon: Building }
  ];

  return (
    <div className="bg-white dark:bg-gray-800">
      <nav className="flex justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            disabled={(tab.id === 'detalle' || tab.id === 'editor') && !selectedOrg}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed ${
              activeView === tab.id
                ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 hover:text-gray-700 dark:hover:bg-gray-700/50 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default NavigationBar;