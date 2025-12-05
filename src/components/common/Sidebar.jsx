import React from "react";
import {
	Users,
	Eye,
	Mail,
	Building,
	FilePenLine,
	Database,
	LogOut,
	ShieldCheck,
	ChevronLeft,
	ChevronRight,
	History,
} from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

const Sidebar = ({
	activeView,
	setActiveView,
	selectedOrg,
	onLogout,
	currentUser,
	isCollapsed,
	onToggle,
}) => {
	const mainTabs = [
		{ id: "listado", label: "Gestión", icon: Users },
		{ id: "detalle", label: "Detalle", icon: Eye },
		{ id: "editor", label: "Editor", icon: FilePenLine },
		{ id: "campanas", label: "Campañas", icon: Mail },
		{ id: "historial", label: "Historial", icon: History }, // --- ¡NUEVA PESTAÑA! ---
		{ id: "dashboard", label: "Panel", icon: Building },
	];

	const adminTab = { id: "admin", label: "Admin Usuarios", icon: ShieldCheck };
	const tabsToShow =
		currentUser?.rol === "admin" ? [...mainTabs, adminTab] : mainTabs;

	return (
		<aside
			className={`relative flex-shrink-0 flex flex-col bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out ${
				isCollapsed ? "w-20" : "w-64"
			}`}>
			{/* --- Botón para colapsar --- */}
			<button
				onClick={onToggle}
				className="absolute top-16 -right-3 z-10 p-1 bg-slate-100 dark:bg-slate-700 rounded-full shadow-md border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
				aria-label={
					isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"
				}>
				{isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
			</button>

			{/* Logo/Título de la App */}
			<div className="h-16 flex items-center justify-center px-4 border-b border-slate-200 dark:border-slate-700">
				<Database
					size={20}
					className="text-blue-600 dark:text-blue-400 flex-shrink-0"
				/>
				{/* --- Título condicional --- */}
				{!isCollapsed && (
					<h1 className="ml-2 text-xl font-bold text-slate-900 dark:text-slate-100 overflow-hidden whitespace-nowrap">
						NotasCan
					</h1>
				)}
			</div>

			{/* Contenedor de Navegación */}
			<nav className="flex-1 p-4 space-y-2 overflow-y-auto">
				{tabsToShow.map((tab) => {
					const isDisabled =
						(tab.id === "detalle" || tab.id === "editor") && !selectedOrg;
					const isActive = activeView === tab.id;

					return (
						<button
							key={tab.id}
							onClick={() => setActiveView(tab.id)}
							disabled={isDisabled}
							className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out
							${isCollapsed && "justify-center"}
							${isActive
								? "bg-blue-600 text-white"
								: "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
							}
            				${isDisabled
								? "opacity-40 cursor-not-allowed"
								: ""
							}`}
							title={isCollapsed ? tab.label : undefined}>
							<tab.icon size={18} className="flex-shrink-0" />
							{!isCollapsed && (
								<span className="overflow-hidden whitespace-nowrap">
									{tab.label}
								</span>
							)}
						</button>
					);
				})}
			</nav>

			<div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
				<ThemeSwitcher isCollapsed={isCollapsed} />
				<button
					onClick={onLogout}
					className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400  hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400transition-colors duration-150 ease-in-out
                    ${isCollapsed && "justify-center"}`}
					title={isCollapsed ? "Cerrar Sesión" : undefined}>
					<LogOut size={16} className="flex-shrink-0" />
					{!isCollapsed && (
						<span className="overflow-hidden whitespace-nowrap">
							Cerrar Sesión
						</span>
					)}
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
