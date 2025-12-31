import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FaTrash, FaFileUpload, FaDownload } from 'react-icons/fa';
import { useModal } from '../../context/ModalContext';
import { io } from 'socket.io-client';

interface Note {
    id: number;
    title: string;
    description: string;
    file_path: string;
    uploaded_at: string;
    subject_name?: string;
}

const InstructorNotes: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const { showAlert, showConfirm } = useModal();
    const [notes, setNotes] = useState<Note[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [newNote, setNewNote] = useState({ title: '', description: '', subject_id: '' });
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotes();

        const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''));

        socket.on('global_sync', (payload) => {
            console.log('[InstructorNotes] Sync received:', payload);
            if (payload.type === 'notes') {
                fetchNotes();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const fetchNotes = async () => {
        try {
            const [notesRes, dashboardRes] = await Promise.all([
                api.get(`/api/notes/instructor/${user?.id}`),
                api.get('/api/instructor/dashboard')
            ]);
            setNotes(notesRes.data);
            const batchData = dashboardRes.data.batches;
            setBatches(batchData);
            if (batchData.length > 0 && !newNote.subject_id) {
                setNewNote(prev => ({ ...prev, subject_id: batchData[0].subject_id?.toString() || '' }));
            }
        } catch (err) {
            console.error('Failed to fetch initial data');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            showAlert('Please select a file', 'warning');
            return;
        }

        const formData = new FormData();
        formData.append('title', newNote.title);
        formData.append('description', newNote.description);
        formData.append('file', file);
        formData.append('instructor_id', user?.id?.toString() || '');
        formData.append('subject_id', newNote.subject_id);

        setLoading(true);
        try {
            await api.post('/api/notes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewNote({ title: '', description: '', subject_id: newNote.subject_id });
            setFile(null);
            (e.target as HTMLFormElement).reset();
            fetchNotes();
            showAlert('Material uploaded successfully!', 'success');
        } catch (err: any) {
            console.error('Upload failed', err);
            showAlert(err.response?.data?.message || 'Upload failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm('Are you sure you want to delete this resource?', 'error', 'Delete Resource');
        if (!confirmed) return;
        try {
            await api.delete(`/api/notes/${id}`);
            fetchNotes();
            showAlert('Resource deleted successfully', 'success');
        } catch (err: any) {
            showAlert(err.response?.data?.message || 'Failed to delete note. Please try again.', 'error');
        }
    };

    return (
        <div className="animate-in fade-in duration-700">
            <div className="mb-10">
                <h2 className="text-4xl font-black text-accent-white italic mb-2 tracking-tighter uppercase">STUDY <span className="text-primary">MATERIAL</span> & NOTES</h2>
                <p className="text-accent-gray uppercase tracking-[0.3em] text-[10px] font-black opacity-70">Academic Resource Management</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
                <div className="md:col-span-2 space-y-6">
                    <div className="premium-card p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-primary/10 rounded-2xl">
                                <FaFileUpload className="text-primary text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-accent-white italic leading-tight uppercase">UPLOAD</h3>
                                <p className="text-[10px] text-accent-gray font-black uppercase tracking-widest opacity-70">New Resource</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">Title</label>
                                <input
                                    type="text" placeholder="e.g. Calculus Basics" required
                                    className="w-full"
                                    value={newNote.title} onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">Subject Node</label>
                                <select
                                    required
                                    className="w-full"
                                    value={newNote.subject_id} onChange={e => setNewNote({ ...newNote, subject_id: e.target.value })}
                                >
                                    <option value="">Select Target Batch</option>
                                    {batches.map(b => (
                                        <option key={b.id} value={b.subject_id?.toString() || ''}>{b.subject_name} ({b.name})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">Description</label>
                                <textarea
                                    placeholder="Brief overview of content..."
                                    className="w-full h-32"
                                    value={newNote.description} onChange={e => setNewNote({ ...newNote, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-accent-gray uppercase tracking-widest ml-1">Binary File</label>
                                <input
                                    type="file" required
                                    className="w-full file:bg-primary/10 file:text-primary file:border-none file:px-4 file:py-2 file:rounded-xl file:mr-4 file:font-black file:text-[10px] file:uppercase file:tracking-widest"
                                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-4"
                            >
                                {loading ? 'INITIALIZING UPLOAD...' : 'UPLOAD RESOURCE'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="md:col-span-3 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-accent-white italic uppercase">UPLOADED <span className="text-primary">MATERIALS</span></h3>
                        <span className="bg-surface-light border border-surface-border px-4 py-1.5 rounded-full text-[10px] font-bold text-accent-gray uppercase tracking-widest">
                            {notes.length} Total Files
                        </span>
                    </div>

                    {notes.length === 0 ? (
                        <div className="premium-card p-12 text-center opacity-70">
                            <p className="text-accent-gray italic font-medium">No resources have been deployed yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {notes.map(note => (
                                <div key={note.id} className="premium-card p-6 flex justify-between items-center group">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-accent-blue/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                                            <FaDownload className="text-accent-blue text-xl" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-accent-white italic text-lg leading-tight uppercase">{note.title}</h4>
                                            <p className="text-[10px] text-accent-gray font-black uppercase tracking-widest opacity-70 mb-2">{note.subject_name || 'General'}</p>
                                            <p className="text-sm text-accent-gray italic font-medium max-w-md line-clamp-1">{note.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-[10px] text-accent-gray font-black mr-4 uppercase tracking-tighter opacity-50">{new Date(note.uploaded_at).toLocaleDateString()}</p>
                                        <a
                                            href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${note.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-surface-light hover:bg-accent-blue/20 text-accent-blue rounded-xl transition-all duration-300"
                                            title="Download"
                                        >
                                            <FaDownload size={18} />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(note.id)}
                                            className="p-3 bg-surface-light hover:bg-primary/20 text-primary rounded-xl transition-all duration-300 active:scale-90"
                                            title="Delete"
                                        >
                                            <FaTrash size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorNotes;
