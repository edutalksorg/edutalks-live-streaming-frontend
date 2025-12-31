import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaQuestionCircle } from 'react-icons/fa';

type ModalType = 'alert' | 'confirm';
type Severity = 'info' | 'warning' | 'success' | 'error';

interface ModalOptions {
    title?: string;
    message: string;
    type?: ModalType;
    severity?: Severity;
    confirmText?: string;
    cancelText?: string;
}

interface ModalContextType {
    showAlert: (message: string, severity?: Severity, title?: string) => Promise<void>;
    showConfirm: (message: string, severity?: Severity, title?: string) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ModalOptions | null>(null);
    const [resolver, setResolver] = useState<((value: any) => void) | null>(null);

    const showModal = useCallback((opts: ModalOptions) => {
        setOptions(opts);
        setIsOpen(true);
        return new Promise<any>((resolve) => {
            setResolver(() => resolve);
        });
    }, []);

    const showAlert = useCallback((message: string, severity: Severity = 'info', title?: string) => {
        return showModal({
            message,
            severity,
            title: title || (severity === 'success' ? 'SUCCESS!' : severity === 'error' ? 'ERROR' : severity === 'warning' ? 'WARNING' : 'ALERT'),
            type: 'alert',
            confirmText: 'ACKNOWLEDGE'
        });
    }, [showModal]);

    const showConfirm = useCallback((message: string, severity: Severity = 'warning', title?: string) => {
        return showModal({
            message,
            severity,
            title: title || 'CONFIRM ACTION',
            type: 'confirm',
            confirmText: 'CONFIRM',
            cancelText: 'CANCEL'
        });
    }, [showModal]);

    const handleConfirm = () => {
        setIsOpen(false);
        if (resolver) resolver(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        if (resolver) resolver(false);
    };

    const getIcon = (severity: Severity = 'info') => {
        switch (severity) {
            case 'success': return <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 mx-auto animate-in zoom-in duration-500"><FaCheckCircle className="text-emerald-500" size={40} /></div>;
            case 'warning': return <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 mx-auto animate-in zoom-in duration-500"><FaExclamationTriangle className="text-amber-500" size={40} /></div>;
            case 'error': return <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-4 mx-auto animate-in zoom-in duration-500"><FaExclamationTriangle className="text-red-500" size={40} /></div>;
            case 'info':
            default: return <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 mx-auto animate-in zoom-in duration-500"><FaInfoCircle className="text-blue-500" size={40} /></div>;
        }
    };

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            {isOpen && options && (
                <div className="fixed inset-0 z-[10000] flex items-start justify-center p-4 bg-black/40 backdrop-blur-xl animate-in fade-in duration-300 pt-20">
                    <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-10 max-w-sm w-full shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-surface-border animate-in slide-in-from-top-12 duration-500 ease-out">

                        <div className="flex flex-col items-center text-center">
                            {options.type === 'confirm' && options.severity === 'warning' ?
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto animate-in zoom-in duration-500"><FaQuestionCircle className="text-primary" size={40} /></div> :
                                getIcon(options.severity)
                            }

                            <h3 className="text-2xl font-black text-accent-white tracking-tight uppercase mb-2">
                                {options.title}
                            </h3>
                            <p className="text-accent-gray font-medium mb-10 leading-relaxed text-sm">
                                {options.message}
                            </p>

                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    onClick={handleConfirm}
                                    className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white shadow-xl transition-all transform active:scale-95 ${options.severity === 'error' ? 'bg-red-500 shadow-red-500/20' :
                                            options.severity === 'warning' ? 'bg-amber-500 shadow-amber-500/20' :
                                                'bg-primary shadow-primary/20'
                                        }`}
                                >
                                    {options.confirmText || 'OK'}
                                </button>
                                {options.type === 'confirm' && (
                                    <button
                                        onClick={handleCancel}
                                        className="w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-accent-gray hover:text-accent-white hover:bg-surface-light transition-all"
                                    >
                                        {options.cancelText || 'Cancel'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
