import React from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface LogoProps {
    className?: string;
    showIcon?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', showIcon = false, size = 'md' }) => {
    const sizeClasses = {
        sm: 'text-xl',
        md: 'text-2xl md:text-3xl',
        lg: 'text-4xl',
        xl: 'text-5xl md:text-6xl'
    };

    const iconSizes = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
        xl: 'w-12 h-12'
    };

    const textSize = sizeClasses[size];
    const iconSize = iconSizes[size];

    const { user } = React.useContext(AuthContext) || { user: null };

    // Determine redirect path
    let path = '/';
    if (user) {
        if (user.role === 'super_admin') path = '/super-admin';
        else if (user.role === 'admin') path = '/admin';
        else if (user.role === 'super_instructor') path = '/super-instructor';
        else if (user.role === 'instructor') path = '/instructor';
        else if (user.role === 'student') path = '/student';
    }

    return (
        <Link to={path} className={`flex items-center gap-2 select-none hover:opacity-90 transition-opacity ${className}`}>
            {showIcon && (
                <div className={`${iconSize} rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20`}>
                    <span className="text-white font-black text-lg">e</span>
                </div>
            )}
            <div className={`font-sans font-black tracking-tight leading-none ${textSize}`}>
                <span className="text-primary">edu</span>
                <span className="text-text-main">talks</span>
            </div>
        </Link>
    );
};

export default Logo;
