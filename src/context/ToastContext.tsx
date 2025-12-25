import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000); // Auto remove after 3s
    }, []);

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-4 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto min-w-[300px] max-w-md p-4 rounded-2xl shadow-2xl border flex items-center gap-4 animate-in slide-in-from-right duration-300 ${toast.type === 'success' ? 'bg-surface-dark border-emerald-500/20 text-emerald-500 shadow-emerald-500/10' :
                                toast.type === 'error' ? 'bg-surface-dark border-red-500/20 text-red-500 shadow-red-500/10' :
                                    'bg-surface-dark border-blue-500/20 text-blue-500 shadow-blue-500/10'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/10' :
                                toast.type === 'error' ? 'bg-red-500/10' : 'bg-blue-500/10'
                            }`}>
                            {toast.type === 'success' && <FaCheckCircle size={20} />}
                            {toast.type === 'error' && <FaExclamationCircle size={20} />}
                            {toast.type === 'info' && <FaInfoCircle size={20} />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-black uppercase text-[10px] tracking-widest opacity-70 mb-1 text-accent-gray">
                                {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Info'}
                            </h4>
                            <p className="text-sm font-bold text-accent-white leading-tight">{toast.message}</p>
                        </div>
                        <button onClick={() => removeToast(toast.id)} className="text-accent-gray hover:text-white transition-colors">
                            <FaTimes />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
