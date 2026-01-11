import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full bg-surface-light border border-surface-border flex items-center px-1 transition-all duration-500 hover:border-primary/50 shadow-premium group"
            aria-label="Toggle Theme"
        >
            <div
                className={`absolute w-5 h-5 rounded-full shadow-lg transform transition-all duration-500 flex items-center justify-center ${theme === 'dark'
                        ? 'translate-x-7 bg-background text-primary'
                        : 'translate-x-0 bg-primary text-white'
                    }`}
            >
                {theme === 'dark' ? (
                    <FaMoon size={10} className="animate-in fade-in zoom-in duration-500" />
                ) : (
                    <FaSun size={10} className="animate-in fade-in zoom-in duration-500" />
                )}
            </div>

            <div className="flex justify-between w-full px-1 opacity-20 group-hover:opacity-40 transition-opacity">
                <FaSun size={10} className={theme === 'light' ? 'text-primary' : 'text-accent-gray'} />
                <FaMoon size={10} className={theme === 'dark' ? 'text-primary' : 'text-accent-gray'} />
            </div>
        </button>
    );
};

export default ThemeToggle;
