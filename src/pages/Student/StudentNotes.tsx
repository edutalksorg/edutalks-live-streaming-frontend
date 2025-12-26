import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { FaDownload, FaBookOpen } from 'react-icons/fa';
import { io } from 'socket.io-client';

interface Note {
    id: number;
    title: string;
    description: string;
    file_path: string;
    uploaded_at: string;
}

const StudentNotes: React.FC = () => {
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
        const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''));

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

                        <a
                            href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${note.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-8 w-full btn-outline py-4 flex items-center justify-center gap-3 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 shadow-sm"
                        >
                            <FaDownload className="text-sm" />
                            <span className="tracking-[0.2em]">DOWNLOAD RESOURCE</span>
                        </a>
                    </div>
                ))}
            </div>

            {notes.length === 0 && (
                <div className="premium-card p-20 text-center opacity-70 border-dashed border-2">
                    <FaFilePdf className="mx-auto text-accent-gray/30 text-6xl mb-6" />
                    <h3 className="text-xl font-black text-accent-white italic uppercase">No materials available</h3>
                    <p className="text-accent-gray italic font-medium mt-2">Check back later for academic updates.</p>
                </div>
            )}
        </div>
    );
};

export default StudentNotes;
