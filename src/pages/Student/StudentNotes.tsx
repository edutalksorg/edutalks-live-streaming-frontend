import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaFilePdf, FaDownload } from 'react-icons/fa';

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

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await api.get('/api/notes/student');
                setNotes(res.data);
            } catch (err) {
                console.error("Failed to fetch notes");
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);

    if (loading) return <div>Loading materials...</div>;

    return (
        <div className="animate-in fade-in duration-700">
            <div className="mb-10">
                <h2 className="text-4xl font-black text-accent-white italic mb-2 tracking-tighter">ACADEMIC <span className="text-primary">RESOURCES</span></h2>
                <p className="text-accent-gray uppercase tracking-[0.3em] text-[10px] font-black opacity-70">Study Guides & Repository</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {notes.map(note => (
                    <div key={note.id} className="premium-card p-8 flex flex-col justify-between h-56 group">
                        <div>
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                                    <FaFilePdf size={28} className="text-primary" />
                                </div>
                                <span className="text-[10px] font-black text-accent-gray bg-surface-light border border-surface-border px-3 py-1 rounded-full uppercase tracking-widest">{new Date(note.uploaded_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-lg font-black text-accent-white italic leading-tight uppercase line-clamp-2">{note.title}</h3>
                            <p className="text-sm text-accent-gray italic font-medium mt-3 line-clamp-2">{note.description}</p>
                        </div>

                        <a
                            href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${note.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-6 w-full btn-outline py-3 flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white transition-all duration-300"
                        >
                            <FaDownload /> DOWNLOAD RESOURCE
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
