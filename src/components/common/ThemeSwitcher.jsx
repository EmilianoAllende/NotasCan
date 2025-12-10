import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const ThemeSwitcher = ({ isCollapsed }) => {
	const { theme, toggleTheme } = useTheme();

	return (
		<div className={`flex w-full ${isCollapsed ? "justify-center" : "justify-end"}`}>
			<button
				onClick={toggleTheme}
				className="p-2 rounded-full text-slate-600 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
				aria-label="Cambiar tema">
				{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
			</button>
		</div>
	);
};

export default ThemeSwitcher;