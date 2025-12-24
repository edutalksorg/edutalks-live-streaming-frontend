import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-3 rounded-xl bg-surface-light text-accent-white hover:text-primary transition-all border border-surface-border shadow-lg active:scale-95 flex items-center justify-center ${className}`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
            {theme === 'dark' ? <FaSun size={14} /> : <FaMoon size={14} />}
        </button>
    );
};

export default ThemeToggle;
