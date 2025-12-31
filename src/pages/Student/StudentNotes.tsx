import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import SubscriptionPopup from '../../components/SubscriptionPopup';
import api from '../../services/api';
import { FaDownload, FaBookOpen, FaFilePdf, FaCrown, FaEye } from 'react-icons/fa';
import { io } from 'socket.io-client';

interface Note {
    id: number;
    title: string;
    description: string;
    file_path: string;
    uploaded_at: string;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL.replace('/api', '');

const StudentNotes: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotes = useCallback(async () => {
        try {
            const res = await api.get('/api/notes/student');
            setNotes(res.data);
        } catch (err) {
            console.error("Failed to fetch notes");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotes();

        // Setup real-time sync
        const socket = io(SOCKET_URL);

        socket.on('global_sync', (payload) => {
            console.log('[StudentNotes] Sync received:', payload);
            if (payload.type === 'notes') {
                fetchNotes();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [fetchNotes]);

    if (loading) return <div>Loading materials...</div>;

    return (
        <div className="animate-in fade-in duration-700">
            <div className="mb-10">
                <h2 className="text-4xl font-black text-accent-white italic mb-2 tracking-tighter">ACADEMIC <span className="text-primary">RESOURCES</span></h2>
                <p className="text-accent-gray uppercase tracking-[0.3em] text-[10px] font-black opacity-70">Study Guides & Repository</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {notes.map(note => (
                    <div key={note.id} className="premium-card p-8 flex flex-col min-h-[320px] group transition-all duration-500 hover:shadow-primary-glow">
                        <div className="flex-grow">
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-4 bg-primary/5 rounded-2xl group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500">
                                    <FaBookOpen className="text-primary text-xl" />
                                </div>
                                <span className="text-[10px] font-black text-accent-gray bg-surface-light border border-surface-border px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                                    {new Date(note.uploaded_at).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-accent-white italic leading-tight uppercase mb-3 line-clamp-2 tracking-tighter">
                                {note.title}
                            </h3>
                            <p className="text-sm text-accent-gray italic font-medium leading-relaxed opacity-80 line-clamp-3">
                                {note.description}
                            </p>
                        </div>

                        <div className="w-full mt-8 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    const isFree = !user?.plan_name || user.plan_name === 'Free';
                                    if (isFree) {
                                        setShowSubscriptionPopup(true);
                                    } else {
                                        window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}${note.file_path}`, '_blank');
                                    }
                                }}
                                className="flex-1 btn-outline py-3 px-2 flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 shadow-sm"
                            >
                                <FaEye className="text-sm" />
                                <span className="tracking-[0.1em] text-xs font-bold">VIEW</span>
                            </button>
                            <button
                                onClick={async (e) => {
                                    e.preventDefault();
                                    const isFree = !user?.plan_name || user.plan_name === 'Free';
                                    if (isFree) {
                                        setShowSubscriptionPopup(true);
                                    } else {
                                        try {
                                            const fileUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}${note.file_path}`;
                                            const response = await fetch(fileUrl);
                                            const blob = await response.blob();
                                            const blobUrl = window.URL.createObjectURL(blob);
                                            const link = document.createElement('a');
                                            link.href = blobUrl;

                                            // Extract extension from file_path
                                            const extension = note.file_path.split('.').pop();
                                            let filename = note.title || 'resource';
                                            if (extension && !filename.endsWith(`.${extension}`)) {
                                                filename += `.${extension}`;
                                            }

                                            link.download = filename;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                            window.URL.revokeObjectURL(blobUrl);
                                        } catch (error) {
                                            console.error("Download failed:", error);
                                            window.open(`${import.meta.env.VITE_API_URL.replace('/api', '')}${note.file_path}`, '_blank');
                                        }
                                    }
                                }}
                                className="flex-1 btn-outline py-3 px-2 flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 shadow-sm"
                            >
                                <FaDownload className="text-sm" />
                                <span className="tracking-[0.1em] text-xs font-bold">DOWNLOAD</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {notes.length === 0 && (
                <>
                    {(!user?.plan_name || user.plan_name === 'Free') ? (
                        <div className="premium-card p-12 text-center border-l-4 border-yellow-500 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-500">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
                            <FaCrown className="mx-auto text-yellow-500 text-6xl mb-6 animate-pulse drop-shadow-lg" />
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white italic uppercase tracking-tight mb-4">
                                Unlock <span className="text-yellow-500">Premium Notes</span>
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
                                Get access to exclusive study materials, detailed guides, and premium resources with EduTalks Pro.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link
                                    to="/student/subscription"
                                    className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl font-black uppercase tracking-widest shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:-translate-y-1 transition-all flex items-center gap-2"
                                >
                                    Upgrade Now
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="premium-card p-20 text-center opacity-70 border-dashed border-2">
                            <FaFilePdf className="mx-auto text-accent-gray/30 text-6xl mb-6" />
                            <h3 className="text-xl font-black text-accent-white italic uppercase">No materials available</h3>
                            <p className="text-accent-gray italic font-medium mt-2">Check back later for academic updates.</p>
                        </div>
                    )}
                </>
            )}
            <SubscriptionPopup isOpen={showSubscriptionPopup} onClose={() => setShowSubscriptionPopup(false)} />
        </div>
    );
};

export default StudentNotes;
