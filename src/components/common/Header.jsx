import React from 'react';
import ThemeSwitcher from '../common/ThemeSwitcher'; // Asegúrate que la ruta sea correcta

const Header = ({ metricas }) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
      {/* Contenedor con Posición Relativa */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
        {/* Contenido Centrado */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            NotasCan - Centro de enriquecimiento automático
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {/* Añadido fallback '|| 0' por si metricas no está cargado */}
            Transformando {metricas?.total_organizaciones || 0} organizaciones en la base de datos comercial más precisa de Canarias
          </p>
        </div>
        {/* Switcher posicionado a la derecha */}
        <div className="absolute top-1/2 right-4 sm:right-6 lg:right-8 -translate-y-1/2">
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
};

export default Header;
