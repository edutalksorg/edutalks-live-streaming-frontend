import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaLock } from 'react-icons/fa';

interface SubscriptionPopupProps {
    isOpen: boolean;
    onClose: () => void;
    message?: string;
}

const SubscriptionPopup: React.FC<SubscriptionPopupProps> = ({ isOpen, onClose, message }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-surface rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-yellow-500/30 relative overflow-hidden text-center transform scale-100 transition-all">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -z-10"></div>

                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white mb-6 shadow-lg shadow-yellow-500/30 animate-pulse">
                    <FaCrown size={40} />
                </div>

                <h2 className="text-3xl font-black text-accent-white mb-2">Premium Access</h2>
                <p className="text-accent-gray mb-8 font-medium">
                    {message || "Unlock exams, live classes, and tournaments with EduTalks Pro."}
                </p>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl mb-8 flex items-center gap-3 text-left">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-lg text-yellow-600 dark:text-yellow-400">
                        <FaLock size={20} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-accent-white">Restricted Content</div>
                        <div className="text-xs text-accent-gray">Upgrade to view this content.</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/student/subscription')}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-yellow-500/20 hover:scale-105 transition-all"
                    >
                        Upgrade Now
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold transition-colors"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPopup;
