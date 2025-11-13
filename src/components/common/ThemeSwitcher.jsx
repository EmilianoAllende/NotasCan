import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();

    return (
        <button
        onClick={toggleTheme}
        className="p-2 text-gray-800 bg-gray-200 rounded-full ml-auto dark:bg-gray-700 dark:text-gray-200"
        aria-label="Cambiar tema"
        >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
    );
};

export default ThemeSwitcher;