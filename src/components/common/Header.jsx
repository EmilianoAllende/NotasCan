import React from "react";
import ThemeSwitcher from "../common/ThemeSwitcher";

const Header = ({ metricas }) => {
	return (
		<div className="bg-white border-b border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative">
				<div className="text-center">
					<h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
						NotasCan - Centro de enriquecimiento automático
					</h1>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Transformando {metricas?.total_organizaciones || 0} organizaciones
						en la base de datos comercial más precisa de Canarias
					</p>
				</div>
				{/* Switcher */}
				<div className="absolute top-1/2 right-4 sm:right-6 lg:right-8 -translate-y-1/2">
					<ThemeSwitcher />
				</div>
			</div>
		</div>
	);
};

export default Header;