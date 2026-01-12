import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaImage, FaMicrophone, FaStop, FaCheckCircle, FaUndo, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import ImageMarkup from './ImageMarkup';

interface Message {
    id: number;
    doubt_id: number;
    sender_id: number;
    sender_name: string;
    message: string;
    message_type: 'text' | 'image' | 'audio';
    file_url: string;
    created_at: string;
}

interface DoubtChatProps {
    doubtId: number;
    currentUserId: number;
    role: string;
    onClose?: () => void;
}

const DoubtChat: React.FC<DoubtChatProps> = ({ doubtId, currentUserId, role, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [recording, setRecording] = useState(false);
    const [pendingImage, setPendingImage] = useState<string | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [imageBlob, setImageBlob] = useState<Blob | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [doubtTitle, setDoubtTitle] = useState<string>('');
    const [subjectName, setSubjectName] = useState<string>('');
    const [doubtStatus, setDoubtStatus] = useState<string>('pending');

    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/api/doubts/${doubtId}/messages`);
            setMessages(res.data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    const fetchDoubtDetails = async () => {
        try {
            const res = await api.get(`/api/doubts/${doubtId}`);
            setDoubtStatus(res.data.status);
            setDoubtTitle(res.data.title);
            setSubjectName(res.data.subject_name || 'General');
        } catch (err) {
            console.error('Error fetching doubt details:', err);
        }
    };

    useEffect(() => {
        fetchMessages();
        fetchDoubtDetails();
        const interval = setInterval(() => {
            fetchMessages();
            fetchDoubtDetails();
        }, 5000);
        return () => clearInterval(interval);
    }, [doubtId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() && !audioBlob && !imageBlob) return;

        try {
            setLoading(true);

            // 1. Send Image if exists
            if (imageBlob) {
                const formData = new FormData();
                formData.append('file', imageBlob, 'chat-image.jpg');
                const uploadRes = await api.post('/api/doubts/upload', formData);

                await api.post('/api/doubts/message', {
                    doubtId,
                    message: audioBlob ? '' : newMessage, // Text stays with the last attachment, or image if no audio
                    message_type: 'image',
                    file_url: uploadRes.data.fileUrl
                });

                setImageBlob(null);
                setImageUrl(null);
                if (!audioBlob) setNewMessage('');
            }

            // 2. Send Audio if exists
            if (audioBlob) {
                const formData = new FormData();
                formData.append('file', audioBlob, 'voice-note.webm');
                const uploadRes = await api.post('/api/doubts/upload', formData);

                await api.post('/api/doubts/message', {
                    doubtId,
                    message: newMessage, // Message text goes here if audio exists
                    message_type: 'audio',
                    file_url: uploadRes.data.fileUrl
                });

                setAudioBlob(null);
                setAudioUrl(null);
                setNewMessage('');
            } else if (!imageBlob && newMessage.trim()) {
                // 3. Send Text only if no files were sent above
                await api.post('/api/doubts/message', {
                    doubtId,
                    message: newMessage,
                    message_type: 'text'
                });
                setNewMessage('');
            }

            fetchMessages();
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setPendingImage(reader.result as string);
            setOriginalImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const startRecording = async () => {
        try {
            // Clear previous
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
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setRecording(true);
        } catch (err) {
            console.error('Microphone access denied', err);
        }
    };

    const stopRecording = () => {
        mediaRecorder?.stop();
        setRecording(false);
    };

    const getFileUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${baseUrl.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
    };

    return (
        <div className="flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] rounded-xl overflow-hidden shadow-2xl transition-all duration-300">
            {/* Header */}
            <div className="bg-[#075e54] dark:bg-[#202c33] p-3 px-4 flex justify-between items-center text-white shadow-md z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black text-lg border border-white/10 shrink-0">
                        {role === 'student' ? 'M' : 'S'}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-black text-xs uppercase tracking-wider truncate">{doubtTitle || 'Loading Doubt...'}</p>
                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">{subjectName}</span>
                        </div>
                        <p className="text-[9px] opacity-60 uppercase tracking-widest font-black mt-0.5">#DOUBT-{doubtId} • {role === 'student' ? 'Mentor' : 'Student Inquiry'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {doubtStatus === 'resolved' && (
                        <div className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded flex items-center gap-1">
                            <FaCheckCircle size={8} /> Resolved
                        </div>
                    )}
                    {onClose && (
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <FaUndo size={14} className="rotate-90" />
                        </button>
                    )}
                </div>
            </div>

            {/* Resolved Banner */}
            {doubtStatus === 'resolved' && (
                <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-2 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top duration-500">
                    <FaCheckCircle /> This inquiry has been marked as resolved
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-95">
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={`flex ${m.sender_id === currentUserId ? 'justify-end pr-2' : 'justify-start pl-2'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                        <div className={`max-w-[80%] p-1.5 rounded-xl shadow-md relative group transition-all hover:shadow-lg ${m.message_type === 'audio' ? 'min-w-[280px]' : 'min-w-[80px]'} ${m.sender_id === currentUserId
                            ? 'bg-[#dcf8c6] dark:bg-[#005c4b] rounded-tr-none text-[#111b21] dark:text-[#e9edef] chat-bubble-tail-right'
                            : 'bg-white dark:bg-[#202c33] rounded-tl-none text-[#111b21] dark:text-[#e9edef] chat-bubble-tail-left'
                            }`}>

                            {m.sender_id !== currentUserId && (
                                <p className="text-[9px] font-black text-primary dark:text-[#53bdeb] px-2 pt-0.5 mb-1 uppercase tracking-tighter">
                                    {m.sender_name}
                                </p>
                            )}

                            <div className="px-2 pb-1">
                                {m.message_type === 'text' && <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{m.message}</p>}

                                {m.message_type === 'image' && (
                                    <div className="mt-1 mb-1 rounded-lg overflow-hidden border border-black/5 dark:border-white/5">
                                        <a href={getFileUrl(m.file_url)} target="_blank" rel="noopener noreferrer" className="block relative group">
                                            <img
                                                src={getFileUrl(m.file_url)}
                                                alt="Doubt attachment"
                                                className="max-w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Image+Not+Found';
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                <FaImage className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" size={24} />
                                            </div>
                                        </a>
                                        {m.message && <p className="text-[13px] mt-2 px-1">{m.message}</p>}
                                    </div>
                                )}

                                {m.message_type === 'audio' && (
                                    <div className="mt-1 flex flex-col gap-2 bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-black/5 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm transition-transform hover:scale-110">
                                                <FaMicrophone size={14} />
                                            </div>
                                            <audio
                                                controls
                                                src={getFileUrl(m.file_url)}
                                                className="h-10 w-full custom-audio-player"
                                            />
                                        </div>
                                        {m.message && <p className="text-[12px] italic opacity-80 border-t border-black/5 dark:border-white/5 pt-2">{m.message}</p>}
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
                                    <span className="text-[9px] font-bold">
                                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {m.sender_id === currentUserId && (
                                        <div className="flex">
                                            <FaCheckCircle size={9} className="text-[#53bdeb]" />
                                            <FaCheckCircle size={9} className="text-[#53bdeb] -ml-1" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-3 flex flex-col gap-2 border-t border-surface-border">
                {/* Previews Row */}
                {(imageUrl || audioUrl) && (
                    <div className="flex gap-2 p-1 animate-in slide-in-from-bottom-2 duration-300">
                        {imageUrl && (
                            <div className="flex items-center gap-2 bg-white dark:bg-[#2a3942] p-1.5 rounded-xl border border-emerald-500 shadow-sm">
                                <img src={imageUrl} className="w-10 h-10 object-cover rounded-md" />
                                <div className="flex gap-1">
                                    <button onClick={() => setPendingImage(originalImage)} title="Edit" className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                                        <FaImage size={12} />
                                    </button>
                                    <button onClick={() => { setImageBlob(null); setImageUrl(null); }} title="Delete" className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                        {audioUrl && (
                            <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#2a3942] p-1.5 rounded-xl border border-emerald-500 shadow-sm min-w-0">
                                <audio controls src={audioUrl} className="h-7 flex-1 min-w-0" />
                                <div className="flex gap-1">
                                    <button onClick={startRecording} title="Re-record" className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                                        <FaMicrophone size={12} />
                                    </button>
                                    <button onClick={() => { setAudioBlob(null); setAudioUrl(null); }} title="Delete" className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <FaTrash size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="p-2 text-[#54656f] dark:text-[#aebac1] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all"
                    >
                        <FaImage size={20} />
                    </button>

                    <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                        <div className="flex-1">
                            <input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                disabled={loading || recording}
                                className="w-full bg-white dark:bg-[#2a3942] border-none rounded-full px-4 py-2 text-sm focus:ring-2 ring-emerald-500 dark:text-white outline-none transition-all"
                            />
                        </div>

                        {recording ? (
                            <button
                                type="button"
                                onClick={stopRecording}
                                className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg animate-pulse"
                            >
                                <FaStop size={16} />
                            </button>
                        ) : (
                            !newMessage.trim() && !audioBlob && !imageBlob ? (
                                <button
                                    type="button"
                                    onClick={startRecording}
                                    disabled={loading}
                                    className="w-10 h-10 text-[#54656f] dark:text-[#aebac1] hover:bg-black/5 dark:hover:bg-white/5 rounded-full flex items-center justify-center transition-all"
                                >
                                    <FaMicrophone size={20} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-10 h-10 bg-[#00a884] hover:bg-[#008f6f] text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:grayscale"
                                >
                                    <FaPaperPlane size={16} className="ml-0.5" />
                                </button>
                            )
                        )}
                    </form>
                </div>
            </div>

            {pendingImage && (
                <ImageMarkup
                    imageSrc={pendingImage}
                    onSave={(blob) => {
                        setImageBlob(blob);
                        setImageUrl(URL.createObjectURL(blob));
                        setPendingImage(null);
                    }}
                    onCancel={() => setPendingImage(null)}
                />
            )}
        </div>
    );
};

export default DoubtChat;
