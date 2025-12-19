import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaHandPaper } from 'react-icons/fa';

// Placeholder APP ID - User needs to provide this or I use a dummy one
const AGORA_APP_ID = "YOUR_AGORA_APP_ID_HERE";
const SOCKET_URL = "http://localhost:5000";

const LiveClassRoom: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Class ID
    const { user } = useContext(AuthContext)!;
    const navigate = useNavigate();

    // Agora State
    const [client, setClient] = useState<IAgoraRTCClient | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
    const [joined, setJoined] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);

    // Socket State
    const socketRef = useRef<Socket | null>(null);
    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
    const [chatMsg, setChatMsg] = useState('');
    const [handsRaised, setHandsRaised] = useState<string[]>([]); // List of student names

    // Class Details
    const [classDetails, setClassDetails] = useState<any>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/classes/${id}`);
                setClassDetails(res.data);
            } catch (err) {
                console.error("Error fetching class details");
            }
        };
        fetchDetails();

        // Socket Init
        socketRef.current = io(SOCKET_URL);
        socketRef.current.emit('join_class', id);

        socketRef.current.on('receive_message', (data: any) => {
            setMessages((prev) => [...prev, { sender: data.senderName, text: data.message }]);
        });

        socketRef.current.on('hand_raised', (data: any) => {
            setHandsRaised((prev) => [...prev, data.studentName]);
        });

        return () => {
            socketRef.current?.disconnect();
        }; // Cleanup socket
    }, [id]);

    // Initialize Agora
    useEffect(() => {
        if (!classDetails) return;

        const initAgora = async () => {
            const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            setClient(agoraClient);

            // Event Listeners for Remote Users (Students) - For now instructor just broadcasts
            // If we want two-way, we handle 'user-published' here.

            try {
                // Join Channel
                // For test mode, token can be null. For production, fetch from backend.
                await agoraClient.join(AGORA_APP_ID, classDetails.agora_channel, null, user?.id);

                if (user?.role === 'instructor' || user?.role === 'super_instructor') {
                    // Create Tracks
                    const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
                    setLocalAudioTrack(audioTrack);
                    setLocalVideoTrack(videoTrack);

                    // Publish
                    await agoraClient.publish([audioTrack, videoTrack]);
                    videoTrack.play('local-player');
                } else {
                    // Student Logic: Subscribe to remote users
                    agoraClient.on("user-published", async (user, mediaType) => {
                        await agoraClient.subscribe(user, mediaType);
                        if (mediaType === "video") {
                            user.videoTrack?.play("remote-player");
                        }
                        if (mediaType === "audio") {
                            user.audioTrack?.play();
                        }
                    });
                }

                setJoined(true);
            } catch (error) {
                console.error("Agora Join Error:", error);
            }
        };

        initAgora();

        return () => {
            localAudioTrack?.close();
            localVideoTrack?.close();
            client?.leave();
        };
    }, [classDetails, user]);

    const handleLeave = async () => {
        localAudioTrack?.close();
        localVideoTrack?.close();
        await client?.leave();
        navigate('/instructor');
    };

    const toggleMic = async () => {
        if (localAudioTrack) {
            await localAudioTrack.setEnabled(!micOn);
            setMicOn(!micOn);
        }
    };

    const toggleCamera = async () => {
        if (localVideoTrack) {
            await localVideoTrack.setEnabled(!cameraOn);
            setCameraOn(!cameraOn);
        }
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (chatMsg.trim() && socketRef.current) {
            const data = { classId: id, message: chatMsg, senderName: user?.name, role: user?.role };
            socketRef.current.emit('send_message', data);
            setChatMsg(''); // clear input
            setMessages(prev => [...prev, { sender: 'You', text: chatMsg }]); // Optimistic update
        }
    };

    if (!classDetails) return <div>Loading Class...</div>;

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Video Area (Main) */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 relative bg-black flex items-center justify-center">
                    {/* Instructor View */}
                    {(user?.role === 'instructor' || user?.role === 'super_instructor') ? (
                        <div id="local-player" className="w-full h-full"></div>
                    ) : (
                        <div id="remote-player" className="w-full h-full"></div>
                    )}

                    {/* Controls */}
                    <div className="absolute bottom-6 flex gap-4 bg-gray-800 p-3 rounded-full bg-opacity-70">
                        <button onClick={toggleMic} className={`p-3 rounded-full ${micOn ? 'bg-gray-600' : 'bg-red-600'}`}>
                            {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                        </button>
                        <button onClick={toggleCamera} className={`p-3 rounded-full ${cameraOn ? 'bg-gray-600' : 'bg-red-600'}`}>
                            {cameraOn ? <FaVideo /> : <FaVideoSlash />}
                        </button>
                        <button onClick={handleLeave} className="p-3 rounded-full bg-red-600 hover:bg-red-700">
                            <FaPhoneSlash />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar (Chat & Students) */}
            <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700 font-bold">
                    Class Chat
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((m, idx) => (
                        <div key={idx} className="bg-gray-700 p-2 rounded">
                            <span className="text-xs text-indigo-300 block">{m.sender}</span>
                            <span className="text-sm">{m.text}</span>
                        </div>
                    ))}
                </div>

                {/* Hand Raise Section (Instructor Only) */}
                {(user?.role === 'instructor' || 'super_instructor') && handsRaised.length > 0 && (
                    <div className="p-2 bg-yellow-900 text-yellow-100 text-xs">
                        {handsRaised.length} students raised hand!
                    </div>
                )}

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
                    <input
                        type="text"
                        className="w-full bg-gray-700 border-none rounded p-2 text-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="Type a message..."
                        value={chatMsg}
                        onChange={(e) => setChatMsg(e.target.value)}
                    />
                </form>
            </div>
        </div>
    );
};

export default LiveClassRoom;
