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
        <div>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Study Materials</h2>
                    <p className="text-gray-500 mt-1">Access notes, pyqs, and assignments uploaded by your instructors.</p>
                </div>
                {/* <div className="relative">
                    <input type="text" placeholder="Search notes..." className="pl-10 pr-4 py-2 border rounded-full focus:ring-2 focus:ring-indigo-500 outline-none" />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div> */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.map(note => (
                    <div key={note.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-6 flex flex-col justify-between h-48">
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="bg-red-50 p-2.5 rounded-lg text-red-600">
                                    <FaFilePdf size={24} />
                                </div>
                                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">{new Date(note.uploaded_at).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 line-clamp-2">{note.title}</h3>
                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{note.description}</p>
                        </div>

                        <a
                            href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${note.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition font-medium text-sm"
                        >
                            <FaDownload /> Download PDF
                        </a>
                    </div>
                ))}
            </div>

            {notes.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                    <FaFilePdf className="mx-auto text-gray-300 text-5xl mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No materials available</h3>
                    <p className="text-gray-500">Check back later for updates.</p>
                </div>
            )}
        </div>
    );
};

export default StudentNotes;
