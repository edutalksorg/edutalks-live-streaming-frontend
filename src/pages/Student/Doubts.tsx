import React, { useState, useEffect, useContext, useRef } from 'react';
import { FaPlus, FaQuestionCircle, FaClock, FaCheckCircle, FaImage, FaMicrophone, FaStop, FaArrowRight, FaTrash } from 'react-icons/fa';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DoubtChat from '../../components/DoubtChat';
import ImageMarkup from '../../components/ImageMarkup';

const StudentDoubts: React.FC = () => {
    const { user } = useContext(AuthContext)!;
    const { showToast } = useToast();
    const [doubts, setDoubts] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedDoubt, setSelectedDoubt] = useState<any>(null);
    const [showRaiseModal, setShowRaiseModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [subjectId, setSubjectId] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [rawImage, setRawImage] = useState<string | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [markedImageBlob, setMarkedImageBlob] = useState<Blob | null>(null);
    const [markedImageUrl, setMarkedImageUrl] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchDoubts();
        fetchSubjects();
    }, []);

    const fetchDoubts = async () => {
        try {
            const res = await api.get('/api/doubts/student');
            setDoubts(res.data);
        } catch (err) {
            console.error('Error fetching doubts:', err);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/api/student/subjects');
            setSubjects(res.data);
        } catch (err) {
            console.error('Error fetching subjects:', err);
        }
    };

    const handleRaiseDoubt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subjectId || !title || (!message && !markedImageBlob && !audioBlob)) {
            showToast('Please fill in all details and provide some context (text, image, or audio)', 'info');
            return;
        }

        try {
            setLoading(true);
            let imageFileUrl = null;
            let audioFileUrl = null;

            // 1. Upload Image if exists
            if (markedImageBlob) {
                const formData = new FormData();
                formData.append('file', markedImageBlob, 'doubt-image.jpg');
                const uploadRes = await api.post('/api/doubts/upload', formData);
                imageFileUrl = uploadRes.data.fileUrl;
            }

            // 2. Upload Audio if exists
            if (audioBlob) {
                const formData = new FormData();
                formData.append('file', audioBlob, 'doubt-voice.webm');
                const uploadRes = await api.post('/api/doubts/upload', formData);
                audioFileUrl = uploadRes.data.fileUrl;
            }

            // 3. Raise Doubt with Image and Audio in one go
            await api.post('/api/doubts/raise', {
                subject_id: parseInt(subjectId),
                title,
                message,
                message_type: imageFileUrl ? 'image' : 'text',
                file_url: imageFileUrl,
                audio_url: audioFileUrl
            });

            showToast('Doubt raised successfully!', 'success');
            setShowRaiseModal(false);
            resetForm();
            fetchDoubts();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Error raising doubt', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSubjectId('');
        setTitle('');
        setMessage('');
        setRawImage(null);
        setOriginalImage(null);
        setMarkedImageBlob(null);
        setMarkedImageUrl(null);
        setAudioBlob(null);
        setAudioUrl(null);
        setRecording(false);
        setMediaRecorder(null);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setRawImage(reader.result as string);
                setOriginalImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const startRecording = async () => {
        try {
            // Clear previous if any
            setAudioBlob(null);
            setAudioUrl(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach(t => t.stop());
            };
            recorder.start();
            setMediaRecorder(recorder);
            setRecording(true);
        } catch (err) { showToast('Microphone access denied', 'error'); }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface p-6 rounded-3xl border border-surface-border shadow-2xl">
                <div>
                    <h1 className="text-3xl font-black italic text-accent-white tracking-widest uppercase flex items-center gap-3">
                        <FaQuestionCircle className="text-primary animate-pulse" /> My Doubts Hub
                    </h1>
                    <p className="text-accent-gray text-xs mt-2 uppercase font-black tracking-[0.2em] italic opacity-70">Get answers from your assigned mentors</p>
                </div>
                <button
                    onClick={() => setShowRaiseModal(true)}
                    className="flex items-center gap-3 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <FaPlus /> Raise a Doubt
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px]">
                {/* Doubt List */}
                <div className="lg:col-span-4 bg-surface rounded-3xl border border-surface-border shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-surface-border bg-surface-dark/30">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gray italic">Recent Inquiries</p>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {doubts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-accent-gray p-8 text-center opacity-40">
                                <FaQuestionCircle size={48} className="mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">No doubts raised yet</p>
                            </div>
                        ) : (
                            doubts.map(d => (
                                <button
                                    key={d.id}
                                    onClick={() => setSelectedDoubt(d)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border flex flex-col gap-2 ${selectedDoubt?.id === d.id
                                        ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5'
                                        : 'border-transparent hover:bg-surface-light hover:border-surface-border'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">{d.subject_name}</span>
                                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${d.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {d.status === 'resolved' ? (
                                                <><FaCheckCircle size={8} /> Resolved</>
                                            ) : (
                                                <><FaClock size={8} className="animate-pulse" /> Pending</>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-black text-accent-white line-clamp-1">{d.title}</h3>
                                    <p className="text-[10px] text-accent-gray line-clamp-1 italic">{d.last_message || 'Waiting for first response...'}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[8px] font-black uppercase text-accent-gray/60">{d.instructor_name}</span>
                                        <span className="text-[8px] text-accent-gray/40">{new Date(d.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-8 bg-surface rounded-3xl border border-surface-border shadow-2xl overflow-hidden flex flex-col relative">
                    {selectedDoubt ? (
                        <DoubtChat
                            doubtId={selectedDoubt.id}
                            currentUserId={user!.id}
                            role="student"
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-accent-gray bg-surface-dark/10">
                            <div className="w-24 h-24 bg-surface-light rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <FaQuestionCircle size={40} className="opacity-20 translate-y-1" />
                            </div>
                            <h2 className="text-xl font-black text-accent-white uppercase tracking-widest italic">Select an Inquiry</h2>
                            <p className="text-xs mt-3 uppercase tracking-widest opacity-60 leading-relaxed max-w-xs">Pick a doubt from the left panel to engage with your mentor and view solutions.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Raise Doubt Modal */}
            {showRaiseModal && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-surface w-full max-w-2xl rounded-[2.5rem] border border-surface-border shadow-[0_0_100px_rgba(238,29,35,0.1)] overflow-hidden">
                        <div className="p-8 md:p-12">
                            <h2 className="text-3xl font-black italic text-accent-white tracking-widest uppercase mb-2">New Brainstorm</h2>
                            <p className="text-accent-gray text-[10px] uppercase font-bold tracking-[0.2em] italic mb-8 opacity-70">Detail your query for accurate resolution</p>

                            <form onSubmit={handleRaiseDoubt} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-2 italic">Subject Domain</label>
                                        <select
                                            value={subjectId}
                                            onChange={(e) => setSubjectId(e.target.value)}
                                            className="w-full bg-surface-dark/50 border border-surface-border rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-primary outline-none transition-all appearance-none"
                                        >
                                            <option value="">Select Domain</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-2 italic">Short Heading</label>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. Calculus Integration Issue"
                                            className="w-full bg-surface-dark/50 border border-surface-border rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-2 italic">Context & Details</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={4}
                                        placeholder="Explain what's confusing you..."
                                        className="w-full bg-surface-dark/50 border border-surface-border rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 ring-primary outline-none transition-all resize-none"
                                    />
                                </div>

                                {/* Image Preview */}
                                {markedImageUrl && (
                                    <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-emerald-500/20 shrink-0 shadow-sm">
                                            <img src={markedImageUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-accent-gray mb-1">Marked Image Preview</p>
                                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Annotation saved</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setRawImage(originalImage)}
                                                title="Re-edit image"
                                                className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <FaImage size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setMarkedImageBlob(null); setMarkedImageUrl(null); }}
                                                title="Delete image"
                                                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Audio Preview */}
                                {audioUrl && (
                                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500 min-w-[300px]">
                                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0 transition-transform hover:scale-110">
                                            <FaMicrophone size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-accent-gray mb-1">Voice Note Preview</p>
                                            <audio controls src={audioUrl} className="h-10 w-full" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={startRecording}
                                                title="Record again"
                                                className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                                            >
                                                <FaMicrophone size={14} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setAudioBlob(null); setAudioUrl(null); }}
                                                title="Delete recording"
                                                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Attachments row */}
                                <div className="flex flex-wrap gap-4 items-center">
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed transition-all ${markedImageBlob ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-surface-dark/50 border-surface-border text-accent-gray hover:border-primary hover:text-primary'}`}
                                    >
                                        <FaImage /> <span className="text-[10px] font-black uppercase tracking-widest">{markedImageBlob ? 'Replace Photo' : 'Attach Photo'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={recording ? () => mediaRecorder?.stop() : startRecording}
                                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed transition-all ${audioBlob ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : recording ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-surface-dark/50 border-surface-border text-accent-gray hover:border-primary hover:text-primary'}`}
                                    >
                                        {recording ? <FaStop className="animate-pulse" /> : audioBlob ? <FaCheckCircle /> : <FaMicrophone />}
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {audioBlob ? 'Replace Voice' : recording ? 'Stop Recording' : 'Voice Note'}
                                        </span>
                                    </button>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setShowRaiseModal(false); resetForm(); }}
                                        className="flex-1 px-8 py-5 rounded-3xl bg-surface-dark hover:bg-surface-light text-accent-gray font-black uppercase tracking-widest text-xs transition-all border border-surface-border"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] bg-primary hover:bg-primary-dark text-white px-8 py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <><FaPlus /> Submit Doubt</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {rawImage && (
                <ImageMarkup
                    imageSrc={rawImage}
                    onSave={(blob) => {
                        setMarkedImageBlob(blob);
                        setMarkedImageUrl(URL.createObjectURL(blob));
                        setRawImage(null);
                    }}
                    onCancel={() => setRawImage(null)}
                />
            )}
        </div>
    );
};

export default StudentDoubts;
