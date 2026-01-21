import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full bg-surface-dark border border-surface-border shadow-inner transition-colors duration-300 focus:outline-none flex items-center flex-shrink-0"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center z-10 ${theme === 'dark' ? 'translate-x-[1.75rem] bg-primary text-white' : 'translate-x-0 bg-white text-yellow-500'}`}>
                {theme === 'dark' ? <FaMoon size={12} /> : <FaSun size={12} />}
            </div>

            <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
                <FaSun size={10} className={`${theme === 'dark' ? 'text-accent-gray' : 'opacity-0'}`} />
                <FaMoon size={10} className={`${theme !== 'dark' ? 'text-accent-gray' : 'opacity-0'}`} />
            </div>
        </button>
    );
};

export default ThemeToggle;
