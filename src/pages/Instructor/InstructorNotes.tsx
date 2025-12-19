import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FaFileUpload, FaTrash, FaDownload } from 'react-icons/fa';

interface Note {
    id: number;
    title: string;
    description: string;
    file_path: string;
    uploaded_at: string;
}

const InstructorNotes: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState({ title: '', description: '' });
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await api.get(`/notes/instructor/${user?.id}`);
            setNotes(res.data);
        } catch (err) {
            console.error('Failed to fetch notes');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return alert('Please select a file');

        const formData = new FormData();
        formData.append('title', newNote.title);
        formData.append('description', newNote.description);
        formData.append('file', file);
        formData.append('instructor_id', user?.id?.toString() || '');

        setLoading(true);
        try {
            await api.post('/notes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewNote({ title: '', description: '' });
            setFile(null);
            fetchNotes();
        } catch (err: any) {
            console.error('Upload failed', err);
            alert(err.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/notes/${id}`);
            fetchNotes();
        } catch (err) {
            console.error('Failed to delete note');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Study Material & Notes</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaFileUpload /> Upload New Material</h3>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <input
                            type="text" placeholder="Title" required
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newNote.title} onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                        />
                        <textarea
                            placeholder="Description (optional)"
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newNote.description} onChange={e => setNewNote({ ...newNote, description: e.target.value })}
                        />
                        <input
                            type="file" required
                            className="w-full p-2 border rounded bg-gray-50"
                            onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 rounded text-white font-bold transition ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {loading ? 'Uploading...' : 'Upload Material'}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-700">Uploaded Materials</h3>
                    {notes.length === 0 ? (
                        <p className="text-gray-500 italic">No notes uploaded yet.</p>
                    ) : (
                        notes.map(note => (
                            <div key={note.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-400 flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-800">{note.title}</h4>
                                    <p className="text-sm text-gray-600 mb-1">{note.description}</p>
                                    <p className="text-xs text-gray-400">{new Date(note.uploaded_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <a
                                        href={`http://localhost:5000/${note.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800"
                                        title="Download"
                                    >
                                        <FaDownload />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(note.id)}
                                        className="text-red-500 hover:text-red-700"
                                        title="Delete"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorNotes;
