import React, { useEffect, useState, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, ILocalVideoTrack } from 'agora-rtc-sdk-ng';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { io, Socket } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import Whiteboard from '../../components/Whiteboard';
import { useModal } from '../../context/ModalContext';
import {
    FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash,
    FaPhoneSlash, FaHandPaper,
    FaDesktop, FaChalkboard,
    FaClock, FaExpand, FaCompress,
    FaTimesCircle, FaCheckCircle, FaExclamationTriangle, FaInfoCircle,
    FaShieldAlt, FaComments, FaUsers
} from 'react-icons/fa';

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const LiveClassRoom: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useModal();

    // --- State Management ---
    const [classDetails, setClassDetails] = useState<any>(null);
    const [isLive, setIsLive] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const isScreenSharingRef = useRef(isScreenSharing);
    useEffect(() => { isScreenSharingRef.current = isScreenSharing; }, [isScreenSharing]);
    const [localScreenTrack, setLocalScreenTrack] = useState<ILocalVideoTrack | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [layoutMode, setLayoutMode] = useState<'focus' | 'balanced' | 'discussion'>('balanced');
    const [pipPosition, setPipPosition] = useState({ x: 20, y: 20, corner: 'bottom-right' });
    const [activeSpeakerUid, setActiveSpeakerUid] = useState<number | null>(null);
    const [screenSharerUid, setScreenSharerUid] = useState<number | null>(null);

    // Agora State
    const [client, setClient] = useState<IAgoraRTCClient | null>(null);
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
    const [micOn, setMicOn] = useState(false);
    const micOnRef = useRef(micOn);
    useEffect(() => { micOnRef.current = micOn; }, [micOn]);
    const [cameraOn, setCameraOn] = useState(false);
    const cameraOnRef = useRef(cameraOn);
    useEffect(() => { cameraOnRef.current = cameraOn; }, [cameraOn]);

    // Track which students have permission to unmute (instructor-controlled)
    const [studentsWithUnmutePermission, setStudentsWithUnmutePermission] = useState<Set<string>>(new Set());
    const studentsWithUnmutePermissionRef = useRef(studentsWithUnmutePermission);
    useEffect(() => { studentsWithUnmutePermissionRef.current = studentsWithUnmutePermission; }, [studentsWithUnmutePermission]);

    // Track students who are explicitly blocked from unmuting
    const [blockedStudents, setBlockedStudents] = useState<Set<string>>(new Set());
    const blockedStudentsRef = useRef(blockedStudents);
    useEffect(() => { blockedStudentsRef.current = blockedStudents; }, [blockedStudents]);

    // Socket & Signaling
    const socketRef = useRef<Socket | null>(null);
    const clientRef = useRef<IAgoraRTCClient | null>(null); // To access client inside socket listeners
    const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null); // Ref to avoid stale closure for track access
    useEffect(() => { localAudioTrackRef.current = localAudioTrack; }, [localAudioTrack]);
    const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
    useEffect(() => { localVideoTrackRef.current = localVideoTrack; }, [localVideoTrack]);
    const localScreenTrackRef = useRef<ILocalVideoTrack | null>(null);
    useEffect(() => { localScreenTrackRef.current = localScreenTrack; }, [localScreenTrack]);
    const containerRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [unreadMsgCount, setUnreadMsgCount] = useState(0);
    const [chatMsg, setChatMsg] = useState('');
    const [handsRaised, setHandsRaised] = useState<any[]>([]);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const whiteboardRef = useRef<any>(null);
    const [reactions, setReactions] = useState<any[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

    // Control Locks (Unlocked by default for collaboration)
    const [chatLocked, setChatLocked] = useState(false);
    const [audioLocked, setAudioLocked] = useState(false);
    const audioLockedRef = useRef(audioLocked);
    useEffect(() => { audioLockedRef.current = audioLocked; }, [audioLocked]);
    const [videoLocked, setVideoLocked] = useState(false);
    const videoLockedRef = useRef(videoLocked);
    useEffect(() => { videoLockedRef.current = videoLocked; }, [videoLocked]);
    const [screenLocked, setScreenLocked] = useState(false);
    const screenLockedRef = useRef(screenLocked);
    useEffect(() => { screenLockedRef.current = screenLocked; }, [screenLocked]);

    const [recordingProtected, setRecordingProtected] = useState(false);
    const recordingProtectedRef = useRef(recordingProtected);
    useEffect(() => { recordingProtectedRef.current = recordingProtected; }, [recordingProtected]);

    const [watermarkPos, setWatermarkPos] = useState({ top: '10%', left: '10%' });
    const [isWindowBlurred, setIsWindowBlurred] = useState(false);

    // Notification State
    const [notification, setNotification] = useState<{ message: string, type: 'info' | 'success' | 'error' | 'warning' } | null>(null);

    // Toast Helper
    const showToast = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };


    const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
    const [showTray, setShowTray] = useState<'chat' | 'participants' | 'hands' | null>(null);
    const showTrayRef = useRef(showTray);
    const mainStageRef = useRef<HTMLDivElement>(null);

    const isInstructor = user?.role === 'instructor' || user?.role === 'super_instructor' || user?.role === 'admin' || user?.role === 'super_admin';
    const isInstructorRef = useRef(isInstructor);
    useEffect(() => { isInstructorRef.current = isInstructor; }, [isInstructor]);

    // --- Effects ---

    useEffect(() => { showTrayRef.current = showTray; }, [showTray]);

    // Ref to ignore blur events immediately after screen sharing stops (browser UI interaction causes false positive)
    const isLocalSharingEndingRef = useRef(false);

    // Ref to store pending "user left" timeouts
    const pendingLeftToastsRef = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/api/classes/${id}`);
                setClassDetails(res.data);
                setIsLive(res.data.status === 'live');
                if (isInstructor) {
                    setAudioLocked(false);
                    setVideoLocked(false);
                }
            } catch (err) {
                console.error("Error fetching class details");
            }
        };
        fetchDetails();

        socketRef.current = io(SOCKET_URL);
        const socket = socketRef.current;

        socket.on('connect', () => {
            socket.emit('join_class', { classId: id, userId: user?.id, userName: user?.name, role: user?.role, classType: 'regular' });
        });

        socket.on('receive_message', (data) => {
            setMessages(prev => [...prev, data]);
            if (showTrayRef.current !== 'chat' && data.senderName !== user?.name) {
                setUnreadMsgCount(prev => prev + 1);
            }
        });
        socket.on('current_users', (users) => setOnlineUsers(users));
        socket.on('chat_status', (data) => setChatLocked(data.locked));
        socket.on('audio_status', (data) => {
            setAudioLocked(data.locked);
            if (data.locked && !isInstructorRef.current && !studentsWithUnmutePermissionRef.current.has(String(user?.id))) {
                // Force mute and unpublish if not permitted
                (async () => {
                    if (micOnRef.current) {
                        await toggleMic(true, false);
                    }
                })();
            }
        });
        socket.on('video_status', (data) => {
            setVideoLocked(data.locked);
            if (data.locked && !isInstructorRef.current) {
                setCameraOn(false);
                localVideoTrackRef.current?.setEnabled(false);
            }
        });
        socket.on('screen_status', (data) => {
            setScreenLocked(data.locked);
            if (data.locked && !isInstructorRef.current && isScreenSharingRef.current) {
                toggleScreenShare(); // Logic handles stop and unpublish
            }
        });

        // --- NEW: Handle Remote Screen Share State ---
        socket.on('screen_share_status', (data) => {
            console.log("[Socket] Received screen_share_status:", data);
            if (data.allowed) {
                // Someone started sharing
                setScreenSharerUid(Number(data.studentId));
                setIsScreenSharing(true);
            } else {
                // Stopped sharing
                if (Number(data.studentId) === screenSharerUid) {
                    setScreenSharerUid(null);
                    setIsScreenSharing(false);
                }
            }
        });

        socket.on('recording_protection_status', (data) => {
            setRecordingProtected(data.active);
            if (!isInstructorRef.current) {
                if (data.active) {
                    showToast("Screen Recording Protection Enabled: Content will be blurred if you leave the tab.", "warning");
                } else {
                    showToast("Screen Recording Protection Disabled.", "info");
                    setIsWindowBlurred(false);
                }
            }
        });

        socket.on('student_violation', (data) => {
            showToast(`Security Alert: ${data.studentName} switched tabs/blurred window!`, 'error');
        });

        socket.on('whiteboard_visibility', (data) => {
            setShowWhiteboard(data.show);
            if (data.show) setIsScreenSharing(false);
        });
        socket.on('whiteboard_draw', (data) => {
            whiteboardRef.current?.drawRemote(data);
        });
        socket.on('whiteboard_clear', () => {
            whiteboardRef.current?.clearCanvas(false);
        });
        socket.on('screen_share_status', (data) => {
            setIsScreenSharing(data.allowed);
            setScreenSharerUid(data.allowed ? Number(data.studentId) : null);
            if (data.allowed) setShowWhiteboard(false);
            console.log("Sync: Screen share status updated", data);
        });

        socket.on('hand_raised', (data) => setHandsRaised(prev => {
            if (prev.find(h => h.id === data.studentId)) return prev;
            return [...prev, { id: data.studentId, name: data.studentName }];
        }));
        socket.on('hand_lowered', (data) => setHandsRaised(prev => prev.filter(h => h.id !== data.studentId)));
        socket.on('hand_approved', async (data) => {
            // Grant permission globally
            setStudentsWithUnmutePermission(prev => new Set(prev).add(String(data.studentId)));
            // Remove from raised hands list for everyone
            setHandsRaised(prev => prev.filter(h => h.id !== data.studentId));

            if (String(user?.id) === String(data.studentId)) {
                setIsHandRaised(false);
                setAudioLocked(false);
                setVideoLocked(false);
                setScreenLocked(false);

                // Auto-enable media as specified
                try {
                    if (!micOnRef.current) await toggleMic(true, true);
                    await toggleCamera(true); // Force camera ON (won't toggle if already on)
                } catch (e) { console.error(e); }

                showToast("Instructor approved your request. Microphone and Camera enabled.", 'success');
            }
        });

        socket.on('receive_screen_share_request', async (data) => {
            if (isInstructor) {
                const confirmed = await showConfirm(`${data.studentName} wants to share their screen. Allow?`, "info", "SCREEN REQUEST");
                if (confirmed) {
                    socket.emit('approve_screen_share', { classId: id, studentId: data.studentId });
                }
            }
        });

        socket.on('screen_share_approved', (data) => {
            if (String(user?.id) === String(data.studentId)) {
                setScreenLocked(false);
                toggleScreenShare();
            }
        });
        socket.on('all_hands_lowered', () => {
            setHandsRaised([]);
            setIsHandRaised(false);
        });

        socket.on('receive_reaction', (data) => {
            const reactionId = Date.now();
            setReactions(prev => [...prev, { ...data, id: reactionId }]);
            setTimeout(() => setReactions(prev => prev.filter(r => r.id !== reactionId)), 3000);
        });

        socket.on('user_joined', (data) => {
            // If this user was pending to leave, cancel it (it was just a refresh)
            if (pendingLeftToastsRef.current[data.userId]) {
                clearTimeout(pendingLeftToastsRef.current[data.userId]);
                delete pendingLeftToastsRef.current[data.userId];
                console.log(`[Socket] User ${data.userId} reconnected quickly (refresh detected). Cancelled leave toast.`);
            }

            setOnlineUsers(prev => {
                const filtered = prev.filter(u => u.userId !== data.userId);
                return [...filtered, data];
            });
        });

        socket.on('user_left', (data: { userId: string, username?: string, role?: string }) => {
            // Delay the "left" action to see if they reconnect quickly
            const timeoutId = setTimeout(() => {
                setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
                setStudentsWithUnmutePermission(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(String(data.userId));
                    return newSet;
                });

                const isLeavingInstructor = data.role === 'instructor' || data.role === 'super_instructor' || data.role === 'admin' || data.role === 'super_admin';
                if (isLeavingInstructor) {
                    showToast("Instructor ended the class", 'warning');
                } else {
                    showToast(`${data.username || 'A student'} left the meeting`, 'info');
                }

                // Cleanup ref entry
                delete pendingLeftToastsRef.current[data.userId];
            }, 15000); // 15 seconds delay

            pendingLeftToastsRef.current[data.userId] = timeoutId;
        });

        socket.on('class_ended', () => {
            if (!isInstructor) {
                showToast("The instructor has ended the live session.", 'warning');
                setTimeout(() => navigate('/student'), 2000);
            }
        });

        // --- NEW: Mute/Unmute Handlers ---
        socket.on('force_mute_student', async (data) => {
            // Update permission sets for everyone's UI
            const sid = String(data.studentId);
            setStudentsWithUnmutePermission(prev => {
                const newSet = new Set(prev);
                newSet.delete(sid);
                return newSet;
            });
            setBlockedStudents(prev => new Set(prev).add(sid));

            if (String(user?.id) === sid) {
                // Force toggle OFF
                if (micOnRef.current) {
                    await toggleMic(true, false); // Force OFF
                    showToast("Instructor has muted your microphone.", 'warning');
                }
            }
        });

        socket.on('force_mute_all', async () => {
            // Revoke all special permissions and block everyone for instructor UI
            setStudentsWithUnmutePermission(new Set());

            if (!isInstructorRef.current) {
                setAudioLocked(true);
                setBlockedStudents(prev => new Set(prev).add(String(user?.id)));

                if (micOnRef.current) {
                    await toggleMic(true, false); // Force OFF
                    showToast("Instructor has muted everyone.", 'warning');
                }
            }
        });

        socket.on('grant_unmute_permission', (data) => {
            // Grant permission and unblock for everyone's UI
            const sid = String(data.studentId);
            setStudentsWithUnmutePermission(prev => new Set(prev).add(sid));
            setBlockedStudents(prev => {
                const next = new Set(prev);
                next.delete(sid);
                return next;
            });
            setHandsRaised(prev => prev.filter(h => h.id !== data.studentId));

            if (String(user?.id) === sid) {
                setIsHandRaised(false);
                setAudioLocked(false);
                setVideoLocked(false);
                setScreenLocked(false);

                // Auto-enable media as specified (mimicking hand raise approval)
                (async () => {
                    try {
                        if (!micOnRef.current) await toggleMic(true);
                        await toggleCamera(true); // Force camera ON (won't toggle if already on)
                    } catch (e) { console.error(e); }
                })();

                showToast("Instructor granted you permission to unmute. Microphone and Camera enabled.", 'success');
            }
        });

        socket.on('request_unmute_student', async (data) => {
            if (String(user?.id) === String(data.studentId)) {
                const confirmed = await showConfirm("The instructor is requesting you to unmute your microphone. Allow?", "info", "UNMUTE REQUEST");
                if (confirmed) {
                    // Grant permission and unmute
                    setStudentsWithUnmutePermission(prev => new Set(prev).add(String(user?.id)));
                    if (!micOnRef.current) await toggleMic(true, true); // Force ON
                }
            }
        });

        socket.on('unlock_all_mics', () => {
            setBlockedStudents(new Set()); // Clear all blocks
            setAudioLocked(false);
            if (!isInstructor) {
                showToast("Instructor has unlocked all microphones.", 'success');
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [id, user?.id]);

    // Track reference to prevent unnecessary re-renders/plays
    const currentPlayingTrackRef = useRef<any>(null);

    // Main Stage Track Playback Effect
    useEffect(() => {
        const el = mainStageRef.current;
        if (!el || showWhiteboard) return;

        let targetTrack: any = null;

        if (isScreenSharing && screenSharerUid) {
            if (screenSharerUid === Number(user?.id)) {
                targetTrack = localScreenTrack;
            } else {
                const sharer = remoteUsers.find(u => String(u.uid) === String(screenSharerUid));
                targetTrack = sharer?.videoTrack;
            }
        }

        // If the track hasn't changed, do nothing (prevents flickering)
        if (currentPlayingTrackRef.current === targetTrack) {
            return;
        }

        console.log(`[Playback] Switching track. From: ${currentPlayingTrackRef.current?.getTrackId()} To: ${targetTrack?.getTrackId()}`);

        // Cleanup old track
        if (currentPlayingTrackRef.current) {
            try {
                currentPlayingTrackRef.current.stop();
            } catch (e) {
                console.warn("Failed to stop previous track:", e);
            }
        }

        // Play new track
        if (targetTrack) {
            try {
                targetTrack.play(el);
                currentPlayingTrackRef.current = targetTrack;
            } catch (e) {
                console.error("[Playback] Play error:", e);
            }
        } else {
            currentPlayingTrackRef.current = null;
        }

    }, [isScreenSharing, screenSharerUid, remoteUsers, localScreenTrack, showWhiteboard]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.key.toLowerCase()) {
                case 'm':
                    e.preventDefault();
                    toggleMic();
                    break;
                case 's':
                    if (isInstructor) {
                        e.preventDefault();
                        toggleScreenShare();
                    }
                    break;
                case 'r':
                    if (user?.role === 'student') {
                        e.preventDefault();
                        handleHandRaise();
                    }
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [micOn, isScreenSharing, isHandRaised]);

    useEffect(() => {
        if (!classDetails || isLive) return;

        const timer = setInterval(() => {
            const start = new Date(classDetails.start_time).getTime();
            const now = new Date().getTime();
            const diff = start - now;

            if (diff <= 0) {
                setTimeLeft('STARTING NOW');
                if (!isInstructor) {
                    api.get(`/api/classes/${id}`).then(res => {
                        if (res.data.status === 'live') setIsLive(true);
                    });
                } else {
                    // Instructors: Auto-activate if it's time
                    api.post(`/api/classes/${id}/start`).then(() => {
                        setIsLive(true);
                        showToast("Class sessions automatically activated.", "success");
                    }).catch(err => console.error("Auto-start failed:", err));
                }
            } else {
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${mins}m ${secs}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [classDetails, isLive]);

    // Watermark Movement & Focus Management (for student protection)
    useEffect(() => {
        if (!recordingProtected || isInstructor) return;

        const moveWatermark = () => {
            const top = Math.floor(Math.random() * 80) + 10 + '%';
            const left = Math.floor(Math.random() * 80) + 10 + '%';
            setWatermarkPos({ top, left });
        };

        const interval = setInterval(moveWatermark, 5000);
        return () => clearInterval(interval);
    }, [recordingProtected, isInstructor]);

    // Window Focus & Screen Recording Protection
    useEffect(() => {
        if (!recordingProtected || isInstructor) return;

        // Immediate Logic Check on State Change
        if (isScreenSharing) {
            // "Screen Recording" detected
            setIsWindowBlurred(true);
        } else if (document.visibilityState === 'visible') {
            // Safe state
            setIsWindowBlurred(false);
        }

        const handleBlur = () => {
            if (isLocalSharingEndingRef.current) return;
            setIsWindowBlurred(true);
            // If they leave indefinitely, we lock
            if (!isScreenSharing) {
                // Logic to potentially lock if they are just Alt-Tabbing
            }
        };
        const handleFocus = () => {
            // If still recording/sharing, keep blurred
            if (isScreenSharing) return;
            setIsWindowBlurred(false);
        };
        const handleVisibilityChange = () => {
            if (document.visibilityState !== 'visible') {
                if (isLocalSharingEndingRef.current) return;
                setIsWindowBlurred(true);
                // Violation Lock REMOVED to allow auto-resume
                // setIsViolationLocked(true); 
                socketRef.current?.emit('violation_report', {
                    classId: id,
                    studentId: user?.id,
                    studentName: user?.name,
                    type: 'TAB_SWITCH',
                    timestamp: new Date()
                });
            } else {
                if (isScreenSharing && !isInstructorRef.current && recordingProtectedRef.current) return;
                setIsWindowBlurred(false);
            }
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [recordingProtected, isInstructor, id, user?.id, user?.name, isScreenSharing]);

    useEffect(() => {
        if (!isLive) return;

        const initAgora = async () => {
            const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            agoraClient.enableAudioVolumeIndicator();
            setClient(agoraClient);
            clientRef.current = agoraClient; // Sync ref

            agoraClient.on("volume-indicator", (volumes) => {
                const highest = volumes.reduce((prev, current) => (prev.level > current.level) ? prev : current, { level: 0, uid: 0 as any });
                if (highest.level > 10) {
                    setActiveSpeakerUid(Number(highest.uid));
                } else if (highest.level < 5) {
                    setActiveSpeakerUid(null);
                }
            });

            try {
                const tokenRes = await api.get(`/api/classes/${id}/token`);
                const { token, channelName, uid } = tokenRes.data;

                const syncRemoteUsers = () => {
                    setRemoteUsers(agoraClient.remoteUsers.map(u => ({
                        uid: u.uid,
                        hasAudio: u.hasAudio,
                        hasVideo: u.hasVideo,
                        audioTrack: u.audioTrack,
                        videoTrack: u.videoTrack,
                    })));
                };

                const handleUserPublished = async (remoteUser: any, mediaType: "audio" | "video") => {
                    console.log(`[Agora] User ${remoteUser.uid} published ${mediaType}`);
                    try {
                        await agoraClient.subscribe(remoteUser, mediaType);
                        if (mediaType === "audio") remoteUser.audioTrack?.play();
                        syncRemoteUsers();
                    } catch (e) {
                        console.error("[Agora] Subscribe error:", e);
                    }
                };

                const handleUserUnpublished = (remoteUser: any, mediaType: "audio" | "video") => {
                    console.log(`[Agora] User ${remoteUser.uid} unpublished ${mediaType}`);
                    if (remoteUser.uid === activeSpeakerUid && mediaType === "audio") setActiveSpeakerUid(null);
                    syncRemoteUsers();
                };

                const handleUserLeft = (remoteUser: any) => {
                    console.log(`[Agora] User ${remoteUser.uid} left`);
                    syncRemoteUsers();
                };

                agoraClient.on("user-published", handleUserPublished);
                agoraClient.on("user-unpublished", handleUserUnpublished);
                agoraClient.on("user-left", handleUserLeft);

                await agoraClient.join(AGORA_APP_ID, channelName, token, Number(uid));
                console.log("Agora: Joined channel", channelName, "as UID", uid);

                // Handle users already in the channel AFTER joining
                agoraClient.remoteUsers.forEach(async (remoteUser) => {
                    console.log("Agora: Found existing user", remoteUser.uid);
                    if (remoteUser.hasAudio) await handleUserPublished(remoteUser, "audio");
                    if (remoteUser.hasVideo) await handleUserPublished(remoteUser, "video");
                });

                // Auto-enable media logic
                try {
                    const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
                    setLocalAudioTrack(audioTrack);
                    localAudioTrackRef.current = audioTrack; // Sync ref
                    setLocalVideoTrack(videoTrack);
                    localVideoTrackRef.current = videoTrack; // Sync ref
                    setMicOn(true);
                    setCameraOn(true);
                    await agoraClient.publish([audioTrack, videoTrack]);
                    // videoTrack.play('local-player'); // Rely on ref in JSX
                } catch (e) {
                    console.warn("Failed to auto-enable media:", e);
                }

                if (isInstructor) {
                    await api.post(`/api/classes/${id}/start`);
                }

            } catch (error) {
                console.error("Agora Init Error:", error);
            }
        };

        initAgora();

        return () => {
            const trackA = localAudioTrackRef.current;
            const trackV = localVideoTrackRef.current;
            const trackS = localScreenTrackRef.current;
            const c = clientRef.current;

            console.log("Agora: Cleaning up tracks and leaving channel...");
            if (trackA) { trackA.stop(); trackA.close(); }
            if (trackV) { trackV.stop(); trackV.close(); }
            if (trackS) { trackS.stop(); trackS.close(); }
            if (c) { c.leave(); }
        };
    }, [isLive, user?.id]); // Added user?.id dependency to ensure correct user context in listeners

    const toggleMic = async (bypassChecks: boolean = false, forceState?: boolean) => {
        // Check if student has permission to unmute
        const isLocked = audioLockedRef.current;
        const isBlocked = blockedStudentsRef.current.has(String(user?.id));
        const hasPermission = studentsWithUnmutePermissionRef.current.has(String(user?.id));

        // If explicitly blocked by instructor, cannot unmute even if room is unlocked
        if (!bypassChecks && !isInstructorRef.current && (isBlocked || (isLocked && !hasPermission))) {
            showToast("You don't have permission to unmute. Please raise your hand or wait for the instructor to grant permission.", 'error');
            return;
        }

        const currentTrack = localAudioTrackRef.current;
        const currentMicOn = micOnRef.current;
        const newMicState = forceState !== undefined ? forceState : !currentMicOn;

        // If we are already in the target state, do nothing
        if (currentTrack && forceState !== undefined && currentMicOn === forceState) return;

        if (currentTrack) {
            await currentTrack.setEnabled(newMicState);
            setMicOn(newMicState);

            if (newMicState && clientRef.current) {
                try {
                    await clientRef.current.publish(currentTrack);
                } catch (e: any) {
                    if (e.code !== 'TRACK_IS_ALREADY_PUBLISHED') console.warn(e);
                }
            } else if (!newMicState && clientRef.current) {
                try {
                    await clientRef.current.unpublish(currentTrack);
                } catch (e) {
                    console.warn(e);
                }
            }
        } else if (newMicState) {
            // Only create if we think it's off (to prevent double creation)
            try {
                const track = await AgoraRTC.createMicrophoneAudioTrack();
                setLocalAudioTrack(track);
                localAudioTrackRef.current = track; // Sync ref immediately
                await clientRef.current?.publish(track);
                setMicOn(true);
            } catch (e) {
                console.error("Error creating audio track:", e);
                showToast("Could not access microphone.", 'error');
            }
        }
    };

    const toggleCamera = async (forceOn = false) => {
        if (!isInstructor && videoLockedRef.current && !forceOn) {
            showToast("Camera is locked by the instructor.", 'error');
            return;
        }

        // If forceOn is true and camera is already on, do nothing
        if (forceOn && cameraOnRef.current) return;

        const currentTrack = localVideoTrackRef.current;
        const currentCameraOn = cameraOnRef.current;

        if (currentTrack) {
            const newCameraState = forceOn ? true : !currentCameraOn;
            await currentTrack.setEnabled(newCameraState);
            setCameraOn(newCameraState);
            if (newCameraState && clientRef.current) {
                try { await clientRef.current.publish(currentTrack); } catch (e) { console.warn(e); }
            } else if (!newCameraState && clientRef.current) {
                try { await clientRef.current.unpublish(currentTrack); } catch (e) { console.warn(e); }
            }
        } else if (!currentCameraOn || forceOn) {
            try {
                const track = await AgoraRTC.createCameraVideoTrack();
                setLocalVideoTrack(track);
                localVideoTrackRef.current = track; // Sync ref immediately
                await clientRef.current?.publish(track);
                setCameraOn(true);
            } catch (e) {
                console.error("Error creating video track:", e);
                showToast("Could not access camera.", 'error');
            }
        }
    };

    const toggleScreenShare = async () => {
        if (!isInstructor) {
            // if (recordingProtected) {
            //    showAlert("Screen Sharing is restricted during Protected Sessions.", "error", "RESTRICTED ACCESS");
            //    return;
            // }
            if (screenLockedRef.current) return;
        }
        if (isScreenSharingRef.current) {
            // Stopping Screen Share
            try {
                if (localScreenTrackRef.current) {
                    await client?.unpublish(localScreenTrackRef.current);
                    localScreenTrackRef.current.stop();
                    localScreenTrackRef.current.close();
                }
                setLocalScreenTrack(null);
                setIsScreenSharing(false);
                setScreenSharerUid(null);

                if (localVideoTrack && cameraOn) {
                    await client?.publish(localVideoTrack);
                }

                // Set grace period
                isLocalSharingEndingRef.current = true;
                setTimeout(() => { isLocalSharingEndingRef.current = false; }, 2000);

                socketRef.current?.emit('share_screen', { classId: id, studentId: user?.id, allowed: false });
            } catch (err) {
                console.error("Error stopping screen share:", err);
            }
        } else {
            // Check for whiteboard conflict
            if (showWhiteboard) {
                showAlert("First stop the whiteboard then share the screen", "warning", "CONFLICT DETECTED");
                return;
            }

            // Starting Screen Share
            try {
                // Grace period for picker
                isLocalSharingEndingRef.current = true;
                setTimeout(() => { isLocalSharingEndingRef.current = false; }, 3000);

                const screenTrack = await AgoraRTC.createScreenVideoTrack({}, "auto");
                const track = Array.isArray(screenTrack) ? screenTrack[0] : screenTrack;

                // 1. Unpublish Camera if it's currently on
                if (localVideoTrack && cameraOn) {
                    await client?.unpublish(localVideoTrack);
                    localVideoTrack.stop(); // Stop local preview
                }

                // Publish Screen
                setLocalScreenTrack(track);
                setIsScreenSharing(true);
                setScreenSharerUid(Number(user?.id));
                // setShowWhiteboard(false); // Removed auto-hide

                await client?.publish(track);
                socketRef.current?.emit('share_screen', { classId: id, studentId: user?.id, allowed: true });

                track.on("track-ended", async () => {
                    isLocalSharingEndingRef.current = true;
                    setTimeout(() => { isLocalSharingEndingRef.current = false; }, 2000);

                    setIsScreenSharing(false);
                    setScreenSharerUid(null);
                    setLocalScreenTrack(null);
                    await client?.unpublish(track);
                    socketRef.current?.emit('share_screen', { classId: id, studentId: user?.id, allowed: false });
                    track.close();
                    if (localVideoTrack && cameraOn) {
                        await client?.publish(localVideoTrack);
                    }
                });

            } catch (err) {
                console.error("Screen share error:", err);
                setIsScreenSharing(false);
                setScreenSharerUid(null);
            }
        }
    };

    const handleHandRaise = () => {
        if (isHandRaised) {
            socketRef.current?.emit('lower_hand', { classId: id, studentName: user?.name, studentId: user?.id });
        } else {
            socketRef.current?.emit('raise_hand', { classId: id, studentName: user?.name, studentId: user?.id });
        }
        setIsHandRaised(!isHandRaised);
    };

    const handleReaction = (emoji: string) => {
        socketRef.current?.emit('send_reaction', { classId: id, reaction: emoji, studentName: user?.name });
    };

    const handleEndClass = async () => {
        if (!isInstructor) return;
        const confirmed = await showConfirm("Are you sure you want to end this class for everyone?", "warning", "TERMINATE SESSION");
        if (confirmed) {
            try {
                await api.post(`/api/classes/${id}/end`);
                navigate('/instructor');
            } catch (err) {
                console.error("Error ending class:", err);
            }
        }
    };

    const handleWhiteboardDraw = (data: any) => {
        socketRef.current?.emit('whiteboard_draw', { classId: id, ...data });
    };

    const handleWhiteboardClear = () => {
        socketRef.current?.emit('whiteboard_clear', { classId: id });
    };

    const approveStudent = (studentId: string) => {
        socketRef.current?.emit('approve_hand', { classId: id, studentId });
        // Also grant unmute permission explicitly
        socketRef.current?.emit('admin_grant_unmute', { classId: id, studentId });
        // Remove from local list immediately for better UX
        setHandsRaised(prev => prev.filter(h => h.id !== studentId));
    };

    // --- Admin Audio Controls ---
    const handleMuteStudent = (studentId: string) => {
        socketRef.current?.emit('admin_mute_student', { classId: id, studentId });
    };

    const handleGrantUnmutePermission = (studentId: string) => {
        // Grant unmute permission to a specific student
        socketRef.current?.emit('admin_grant_unmute', { classId: id, studentId });
    };

    const handleMuteAll = async () => {
        const confirmed = await showConfirm("Mute all students?", "warning", "MUTE ALL");
        if (confirmed) {
            socketRef.current?.emit('admin_mute_all', { classId: id });
        }
    };

    const handleUnlockAll = async () => {
        const confirmed = await showConfirm("Unlock all student microphones?", "info", "UNLOCK ALL");
        if (confirmed) {
            socketRef.current?.emit('admin_unlock_all', { classId: id });
        }
    };

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (chatLocked && !isInstructor) return;
        if (chatMsg.trim() && socketRef.current) {
            const data = { classId: id, message: chatMsg, senderName: user?.name, role: user?.role, timestamp: new Date() };
            socketRef.current.emit('send_message', data);
            setChatMsg('');
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const getPipClasses = () => {
        switch (pipPosition.corner) {
            case 'bottom-right': return 'bottom-4 right-4';
            case 'bottom-left': return 'bottom-4 left-4';
            case 'top-right': return 'top-24 right-4';
            case 'top-left': return 'top-24 left-4';
            default: return 'bottom-4 right-4';
        }
    };

    const cyclePipPosition = () => {
        const corners: ('bottom-right' | 'bottom-left' | 'top-right' | 'top-left')[] = ['bottom-right', 'bottom-left', 'top-left', 'top-right'];
        const nextIndex = (corners.indexOf(pipPosition.corner as any) + 1) % corners.length;
        setPipPosition(prev => ({ ...prev, corner: corners[nextIndex] }));
    };





    const requestScreenShare = () => {
        if (isInstructor) {
            toggleScreenShare();
        } else {
            socketRef.current?.emit('request_screen_share', { classId: id, studentId: user?.id, studentName: user?.name });
            showAlert("Request sent to instructor...", "info", "STREAM REQUEST");
        }
    };

    if (!classDetails) return (
        <div className="h-screen w-screen bg-[#0A0A10] flex flex-col items-center justify-center p-8 text-center space-y-8">
            <div className="w-24 h-24 border-8 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_50px_rgba(238,29,35,0.3)]"></div>
            <div className="space-y-2">
                <h1 className="text-3xl font-black text-white italic tracking-[0.2em] uppercase">Initializing Nexus</h1>
                <p className="text-accent-gray italic font-bold tracking-widest opacity-70 uppercase text-xs">Synchronizing Neural Frequencies...</p>
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="h-screen w-screen bg-[#0A0A10] text-[#F8FAFC] font-sans flex overflow-hidden selection:bg-primary/20 relative">
            {/* Recording Protection: Blur Overlay */}
            {!isInstructor && recordingProtected && isWindowBlurred && (
                <div className="absolute inset-0 z-[9999] bg-slate-900/80 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-8 pointer-events-auto">
                    <div className="flex flex-col items-center">
                        <FaShieldAlt size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-2 italic">
                        Content Protected
                    </h2>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-md">
                        Live stream is blurred because protection is active and you have left the focal area.
                    </p>
                    <p className="mt-8 text-[10px] font-black text-red-500/50 uppercase tracking-[0.3em] animate-bounce">
                        Return to focal tab to resume
                    </p>
                </div>
            )}

            {/* Recording Protection: Watermark */}
            {!isInstructor && recordingProtected && (
                <div
                    className="absolute z-[9998] pointer-events-none transition-all duration-[3000ms] opacity-20 select-none whitespace-nowrap"
                    style={{
                        top: watermarkPos.top,
                        left: watermarkPos.left,
                        transform: 'rotate(-25deg)'
                    }}
                >
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-1 italic">{user?.name}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest opacity-50 italic">{user?.id} • {new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            )}
            {/* Main Stage */}
            <div className="flex-1 flex flex-col relative overflow-hidden h-full">
                {/* Minimal Tactical Header */}
                <header className="absolute top-0 left-0 w-full z-30 p-4 flex justify-between items-start pointer-events-none transition-all duration-700">
                    <div className="flex flex-col gap-2 pointer-events-auto">
                        {/* Status indicators can go here if needed */}
                    </div>

                    <div className="flex items-start gap-4 pointer-events-auto">
                        {!isLive && (
                            <div className="bg-white/90 backdrop-blur-xl border border-blue-200 p-3 px-5 rounded-2xl flex items-center gap-4 animate-pulse shadow-lg shadow-blue-500/5">
                                <FaClock className="text-blue-600 text-lg" />
                                <div className="text-right">
                                    <p className="text-[8px] font-bold text-blue-600 uppercase tracking-[0.2em] leading-none mb-1 italic">T-Minus</p>
                                    <p className="text-lg font-black italic text-blue-600 leading-none tabular-nums tracking-tighter">{timeLeft}</p>
                                </div>
                                {isInstructor && (
                                    <button
                                        onClick={() => setIsLive(true)}
                                        className="ml-2 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                                    >
                                        Initiate Live
                                    </button>
                                )}
                            </div>
                        )}

                        {isLive && (
                            <div className="flex flex-col gap-2 items-end">
                                <button
                                    onClick={toggleFullscreen}
                                    className="bg-white/90 backdrop-blur-xl border border-slate-200 p-2.5 rounded-lg text-slate-500 hover:text-slate-900 transition-all shadow-md hover:bg-slate-50"
                                    title="Toggle Immersive Mode"
                                >
                                    {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Viewport */}
                <main className={`flex-1 bg-slate-100 relative flex flex-col overflow-hidden h-full transition-all duration-700 ${layoutMode === 'focus' ? 'p-0' : 'p-4'}`}>
                    {/* 70/30 Stage + Sidebar Layout (When Screen Sharing) */}
                    {(isScreenSharing || showWhiteboard) && (
                        <div className="flex-1 flex overflow-hidden">
                            {/* Main Stage (70%) */}
                            <div className={`transition-all duration-700 h-full ${layoutMode === 'focus' ? 'w-full' : 'p-4 w-[70%]'}`}>
                                <div className={`relative h-full flex items-center justify-center bg-slate-900 overflow-hidden ${layoutMode === 'focus' ? '' : 'rounded-3xl border border-slate-700 shadow-2xl'}`}>
                                    <div
                                        id="main-video-stream"
                                        ref={mainStageRef}
                                        className={`w-full h-full ${isScreenSharing ? 'object-contain' : 'object-cover'}`}
                                    />

                                    {isScreenSharing && !showWhiteboard && (
                                        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest italic">
                                                {screenSharerUid === Number(user?.id) ? 'Sharing your screen' : `${onlineUsers.find(u => String(u.userId) === String(screenSharerUid))?.userName || 'User'}'s Screen`}
                                            </span>
                                        </div>
                                    )}

                                    {/* Focus View Toggle */}
                                    <button
                                        onClick={() => setLayoutMode(layoutMode === 'focus' ? 'balanced' : 'focus')}
                                        className="absolute top-4 right-4 z-30 bg-black/40 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white transition-all hover:scale-110 active:scale-95 group shadow-2xl"
                                        title={layoutMode === 'focus' ? "Show Sidebar" : "Hide Sidebar (Focus)"}
                                    >
                                        {layoutMode === 'focus' ? <FaCompress size={16} /> : <FaExpand size={16} />}
                                    </button>

                                    {/* Fallback for Screen Share if track hasn't arrived */}
                                    {isScreenSharing && !showWhiteboard && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 pointer-events-none -z-10">
                                            <div className="w-20 h-20 rounded-3xl bg-slate-800 flex items-center justify-center animate-pulse border border-slate-700">
                                                <FaDesktop size={30} className="text-slate-600" />
                                            </div>
                                            <p className="mt-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse italic">Synchronizing Stream...</p>
                                        </div>
                                    )}
                                    {showWhiteboard && (
                                        <div className="absolute inset-0 z-10">
                                            <Whiteboard
                                                ref={whiteboardRef}
                                                isInstructor={isInstructor}
                                                className="w-full h-full"
                                                onDraw={handleWhiteboardDraw}
                                                onClear={handleWhiteboardClear}
                                            />
                                        </div>
                                    )}

                                    {/* Draggable PiP (Instructor only) */}
                                    {isInstructor && (
                                        <div
                                            onClick={cyclePipPosition}
                                            className={`absolute ${getPipClasses()} w-48 aspect-video bg-slate-900 rounded-2xl overflow-hidden border-2 border-blue-600 shadow-2xl z-50 cursor-pointer group transition-all duration-500 hover:scale-110`}
                                        >
                                            <div id="local-player-pip" className="w-full h-full" ref={(el) => { if (el && cameraOn) localVideoTrack?.play(el) }} />
                                            {!cameraOn && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-lg font-black italic border border-blue-500/20">{user?.name?.slice(0, 2).toUpperCase()}</div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-bold text-white uppercase font-black italic">Me</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Participant Sidebar (30%) */}
                            {layoutMode !== 'focus' && (
                                <div className="w-[30%] h-full bg-slate-50 border-l border-slate-200 flex flex-col p-4 overflow-y-auto gap-4 scrollbar-minimal animate-in slide-in-from-right duration-500 relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Nexus Matrix</p>
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[8px] font-bold text-slate-500 uppercase">{onlineUsers.length} ONLINE</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 auto-rows-max">
                                        {/* Local Student View if sharing */}
                                        {!isInstructor && (
                                            <div className={`relative aspect-square bg-slate-900 rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-lg ${activeSpeakerUid === Number(user?.id) ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-slate-200'}`}>
                                                <div id="local-sidebar" className="w-full h-full" ref={(el) => { if (el && cameraOn) localVideoTrack?.play(el) }} />
                                                {!cameraOn && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-[10px] font-black italic border border-blue-500/20">{user?.name?.slice(0, 2).toUpperCase()}</div>
                                                    </div>
                                                )}
                                                <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[7px] font-black text-white uppercase italic">You</div>
                                            </div>
                                        )}

                                        {/* Online Participants (Remote) - Exclude Sharer to avoid double playback conflict */}
                                        {onlineUsers.filter(u => String(u.userId) !== String(user?.id) && String(u.userId) !== String(screenSharerUid)).map((u) => {
                                            const rUser = remoteUsers.find(ru => String(ru.uid) === String(u.userId));
                                            return (
                                                <div key={u.userId} className={`relative aspect-square bg-slate-900 rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-md ${activeSpeakerUid === Number(u.userId) ? 'border-emerald-500 ring-4 ring-emerald-500/10 scale-95' : 'border-slate-200'}`}>
                                                    <div id={`sidebar-video-${u.userId}`} className="w-full h-full" ref={(el) => { if (el && rUser?.hasVideo) rUser.videoTrack?.play(el) }} />
                                                    {(!rUser || !rUser.hasVideo) && (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
                                                            <div className="w-8 h-8 rounded-full bg-slate-700/50 border border-white/10 flex items-center justify-center text-white text-[10px] font-black uppercase italic">{u.userName?.slice(0, 2).toUpperCase() || '??'}</div>
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[7px] font-black text-white uppercase italic flex items-center gap-1">
                                                        <div className={`w-1 h-1 rounded-full ${rUser?.hasAudio ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                        {u.userName?.split(' ')[0] || `User ${u.userId}`}
                                                    </div>
                                                    {activeSpeakerUid === Number(u.userId) && <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[5px] font-black px-1 py-0.5 rounded animate-bounce uppercase">Live</div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Video Grid (Shown if no active content OR in Discussion Mode) */}
                    {!(showWhiteboard || isScreenSharing) || layoutMode === 'discussion' ? (
                        <div className={`p-4 transition-all duration-500 overflow-y-auto flex-1 ${layoutMode === 'discussion' && (showWhiteboard || isScreenSharing) ? 'mt-4 h-1/5 shrink-0 border-t border-slate-200' : 'h-full'}`}>
                            <div className={`grid gap-3 auto-rows-max h-full ${layoutMode === 'discussion' && (showWhiteboard || isScreenSharing) ? 'grid-flow-col overflow-x-auto overflow-y-hidden scrollbar-minimal' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'}`}>
                                {/* Local Participant */}
                                <div className={`relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border-2 shadow-xl group transition-all duration-300 ${activeSpeakerUid === Number(user?.id) ? 'border-emerald-500 scale-[1.02] z-10' : 'border-slate-200'}`}>
                                    <div id="local-player" className="w-full h-full" ref={(el) => { if (el && cameraOn) localVideoTrack?.play(el) }} />
                                    {!cameraOn && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-lg md:text-xl font-black italic border border-blue-500/20">{user?.name?.slice(0, 2).toUpperCase()}</div>
                                        </div>
                                    )}
                                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase italic flex items-center gap-2 border border-white/10">
                                        <div className={`w-1.5 h-1.5 rounded-full ${micOn ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        You (Self)
                                    </div>
                                    {activeSpeakerUid === Number(user?.id) && <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded animate-bounce uppercase italic">Speaking</div>}
                                </div>

                                {/* online Participants (Remote) - Exclude Sharer to avoid double playback conflict */}
                                {onlineUsers.filter(u => String(u.userId) !== String(user?.id) && String(u.userId) !== String(screenSharerUid)).map((u) => {
                                    const rUser = remoteUsers.find(ru => String(ru.uid) === String(u.userId));
                                    return (
                                        <div key={u.userId} className={`relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border-2 shadow-xl group transition-all duration-300 ${activeSpeakerUid === Number(u.userId) ? 'border-emerald-500 scale-[1.02] z-10' : 'border-slate-200'}`}>
                                            <div id={`video-${u.userId}`} className="w-full h-full" ref={(el) => { if (el && rUser?.hasVideo) rUser.videoTrack?.play(el) }} />
                                            {(!rUser || !rUser.hasVideo) && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
                                                    <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 text-xl font-black italic border border-white/5">
                                                        {u.userName?.slice(0, 2).toUpperCase() || '??'}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase italic flex items-center gap-2 border border-white/10">
                                                <div className={`w-1.5 h-1.5 rounded-full ${rUser?.hasAudio ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                {u.userName || `User ${u.userId}`}
                                            </div>
                                            {activeSpeakerUid === Number(u.userId) && <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded animate-bounce uppercase italic">Speaking</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}


                    {/* Reactions Float Plane */}
                    <div className="absolute inset-0 pointer-events-none z-40">
                        {reactions.map(r => (
                            <div
                                key={r.id}
                                className="absolute bottom-20 flex flex-col items-center gap-2 animate-reaction-float"
                                style={{ left: `${20 + Math.random() * 60}%` }}
                            >
                                <div className="text-6xl drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">{r.reaction}</div>
                                <p className="text-[9px] font-black italic uppercase text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">{r.studentName}</p>
                            </div>
                        ))}
                    </div>
                </main>

                {/* Tactical Command Bar */}
                <footer className="h-20 bg-white border-t border-slate-200 px-4 md:px-8 flex justify-between items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] overflow-x-auto scrollbar-hide gap-4">
                    <div className="flex items-center gap-4 md:gap-6 shrink-0">
                        <div className="flex flex-col">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none whitespace-nowrap">{classDetails.title}</h2>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] whitespace-nowrap">Session Active</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-100 hidden md:block" />
                        <div className="flex gap-2 md:gap-3">
                            <button
                                onClick={() => toggleMic()}
                                disabled={!isInstructor && audioLocked}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-90 border shadow-md group ${micOn ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-blue-600 border-blue-700 text-white animate-pulse shadow-blue-500/20'}`}
                                title={micOn ? "Disable Microphone" : "Enable Microphone"}
                            >
                                {micOn ? <FaMicrophone size={16} /> : <FaMicrophoneSlash size={16} />}
                            </button>
                            <button
                                onClick={() => toggleCamera()}
                                disabled={!isInstructor && videoLocked}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-90 border shadow-md ${cameraOn ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-blue-600 border-blue-700 text-white shadow-blue-500/20'}`}
                                title={cameraOn ? "Disable Visuals" : "Enable Visuals"}
                            >
                                {cameraOn ? <FaVideo size={16} /> : <FaVideoSlash size={16} />}
                            </button>
                            {isInstructor && (
                                <button
                                    onClick={requestScreenShare}
                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-90 border shadow-md ${isScreenSharing ? 'bg-blue-600 border-blue-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                                    title="Share Screen"
                                >
                                    <FaDesktop size={16} />
                                </button>
                            )}
                            {isInstructor && (
                                <button
                                    onClick={() => {
                                        if (isScreenSharing) {
                                            showAlert("First stop the screen share then start sharing whiteboard", "warning", "CONFLICT DETECTED");
                                            return;
                                        }
                                        const next = !showWhiteboard;
                                        setShowWhiteboard(next);
                                        // Auto-switch removed logic
                                        socketRef.current?.emit('toggle_whiteboard_visibility', { classId: id, show: next });
                                    }}
                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-90 border shadow-md ${showWhiteboard ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                                    title="Open Whiteboard"
                                >
                                    <FaChalkboard size={16} />
                                </button>
                            )}
                            {isInstructor && (
                                <button
                                    onClick={() => {
                                        const next = !recordingProtected;
                                        setRecordingProtected(next);
                                        socketRef.current?.emit('toggle_recording_protection', { classId: id, active: next });
                                        showToast(next ? "Screen Recording Protection ENABLED" : "Screen Recording Protection DISABLED", next ? "warning" : "info");
                                    }}
                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-90 border shadow-md ${recordingProtected ? 'bg-orange-600 border-orange-700 text-white animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                                    title={recordingProtected ? "Disable Screen Recording Protection" : "Enable Screen Recording Protection"}
                                >
                                    <FaShieldAlt size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2 md:gap-4 items-center shrink-0">
                        {isInstructor ? (
                            <button
                                onClick={handleEndClass}
                                className="flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-12 rounded-xl bg-red-600 text-white font-bold uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-red-700 transition-all shadow-lg active:scale-95 whitespace-nowrap"
                                title="End Session for All"
                            >
                                <FaPhoneSlash size={14} />
                                <span>End Session</span>
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleHandRaise}
                                    className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-12 rounded-xl font-bold uppercase tracking-widest text-[9px] md:text-[10px] transition-all border shadow-md transform active:scale-95 whitespace-nowrap ${isHandRaised ? 'bg-blue-600 text-white border-blue-700 shadow-blue-500/30 animate-bounce' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                                >
                                    <FaHandPaper className={isHandRaised ? 'rotate-12' : ''} size={14} />
                                    {isHandRaised ? 'Waiting...' : 'Raise Hand'}
                                </button>
                                <button
                                    onClick={() => navigate('/student')}
                                    className="flex items-center gap-2 md:gap-3 px-4 md:px-6 h-10 md:h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-slate-200 transition-all shadow-md active:scale-95 whitespace-nowrap"
                                    title="Leave Class"
                                >
                                    <FaPhoneSlash size={14} />
                                    <span>Leave</span>
                                </button>
                            </>
                        )}
                        <div className="hidden md:flex gap-1.5 bg-slate-100 rounded-xl p-1.5 border border-slate-200">
                            {['👍', '👏', '❓', '❤️', '🔥'].map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReaction(emoji)}
                                    className="w-9 h-9 rounded-lg hover:bg-white text-xl transition-all transform hover:scale-125 active:scale-90"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        <div className="h-8 w-px bg-slate-100 mx-1 md:mx-2 hidden md:block" />

                        <div className="flex gap-2">
                            {[
                                { id: 'chat', icon: FaComments, title: 'Chat', count: unreadMsgCount },
                                { id: 'participants', icon: FaUsers, title: 'Participants', count: onlineUsers.length },
                                { id: 'hands', icon: FaHandPaper, title: 'Alerts', count: handsRaised.length }
                            ].map(tray => (
                                <button
                                    key={tray.id}
                                    onClick={() => {
                                        if (showTray === tray.id) {
                                            setShowTray(null);
                                        } else {
                                            setShowTray(tray.id as any);
                                            if (tray.id === 'chat') setUnreadMsgCount(0);
                                        }
                                    }}
                                    className={`relative w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all border shadow-md ${showTray === tray.id ? 'bg-blue-600 border-blue-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                    title={tray.title}
                                >
                                    <tray.icon size={16} />
                                    {tray.count > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                            {tray.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                </footer>

                {/* Pop-up Tray Overlay */}
                {showTray && (
                    <div className="absolute inset-0 z-[60] flex items-end justify-end p-8 pointer-events-none">
                        <div className="w-full max-w-sm h-3/4 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-right duration-500">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">{showTray} Panel</h3>
                                <button onClick={() => setShowTray(null)} className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-300">×</button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {showTray === 'chat' && (
                                    <div className="flex flex-col h-full">
                                        <div className="flex-1 p-4 space-y-4">
                                            {messages.map((m, i) => (
                                                <div key={i} className={`flex flex-col ${m.senderName === user?.name ? 'items-end' : 'items-start'}`}>
                                                    <span className="text-[8px] font-bold text-slate-500 uppercase mb-1">{m.senderName}</span>
                                                    <div className={`p-3 rounded-2xl text-xs max-w-[80%] ${m.senderName === user?.name ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                                                        {m.message}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-2">
                                            <input
                                                value={chatMsg}
                                                onChange={(e) => setChatMsg(e.target.value)}
                                                placeholder="Type message..."
                                                className="flex-1 bg-slate-100 px-4 py-2 rounded-xl text-xs focus:ring-2 ring-blue-500 outline-none"
                                            />
                                            <button className="bg-blue-600 text-white p-2 px-4 rounded-xl text-[10px] font-bold uppercase">Send</button>
                                        </form>
                                    </div>
                                )}

                                {showTray === 'participants' && (
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-2xl border border-blue-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold uppercase">ME</div>
                                                <span className="text-xs font-bold text-slate-900">{user?.name} (You)</span>
                                            </div>
                                            <div className="flex gap-2 text-slate-400 items-center">
                                                {micOn ? <FaMicrophone size={12} className="text-emerald-500" /> : <FaMicrophoneSlash size={12} />}
                                                {cameraOn ? <FaVideo size={12} className="text-emerald-500" /> : <FaVideoSlash size={12} />}
                                            </div>
                                        </div>

                                        {/* Instructor Controls */}
                                        {isInstructor && (
                                            <div className="flex gap-2 pb-2 border-b border-slate-100">
                                                <button
                                                    onClick={handleMuteAll}
                                                    className="flex-1 bg-red-100 text-red-600 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-red-200 transition-colors"
                                                >
                                                    Mute All
                                                </button>
                                                <button
                                                    onClick={handleUnlockAll}
                                                    className="flex-1 bg-emerald-100 text-emerald-600 py-2 rounded-xl text-[10px] font-bold uppercase hover:bg-emerald-200 transition-colors"
                                                >
                                                    Unlock All
                                                </button>
                                            </div>
                                        )}
                                        {onlineUsers.filter(u => String(u.userId) !== String(user?.id)).map(u => {
                                            const rUser = remoteUsers.find(ru => String(ru.uid) === String(u.userId) || Number(ru.uid) === Number(u.userId));
                                            const isBlocked = blockedStudents.has(String(u.userId));
                                            const hasPermission = !isBlocked && (!audioLocked || studentsWithUnmutePermission.has(String(u.userId)));
                                            const isHandRaisedByU = handsRaised.some(h => String(h.id) === String(u.userId));

                                            return (
                                                <div key={u.userId} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-bold uppercase">{u.userName?.charAt(0)}</div>
                                                            {isHandRaisedByU && (
                                                                <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full animate-bounce">
                                                                    <FaHandPaper size={8} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600">{u.userName}</span>
                                                    </div>
                                                    <div className="flex gap-2 items-center">
                                                        {rUser?.hasAudio ? (
                                                            <FaMicrophone size={12} className="text-emerald-500" title="Speaking" />
                                                        ) : hasPermission ? (
                                                            <FaMicrophone size={12} className="text-slate-400 opacity-50" title="Allowed but muted" />
                                                        ) : (
                                                            <FaMicrophoneSlash size={12} className="text-rose-400/50" title="Muted by instructor" />
                                                        )}

                                                        {isInstructor && (
                                                            <div className="flex gap-1 ml-2">
                                                                {rUser?.hasAudio || hasPermission ? (
                                                                    <button
                                                                        onClick={() => handleMuteStudent(u.userId)}
                                                                        className="text-[8px] bg-red-100 text-red-600 px-2 py-1 rounded font-black uppercase hover:bg-red-200"
                                                                        title="Force Mute & Revoke Permission"
                                                                    >
                                                                        Mute
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleGrantUnmutePermission(u.userId)}
                                                                        className="text-[8px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-black uppercase hover:bg-blue-200"
                                                                        title="Allow to Speak"
                                                                    >
                                                                        Allow
                                                                    </button>
                                                                )}
                                                                {isHandRaisedByU && (
                                                                    <button
                                                                        onClick={() => approveStudent(u.userId)}
                                                                        className="text-[8px] bg-amber-100 text-amber-600 px-2 py-1 rounded font-black uppercase hover:bg-amber-200"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {showTray === 'hands' && (
                                    <div className="p-4 space-y-3">
                                        {handsRaised.length === 0 ? (
                                            <div className="h-40 flex flex-col items-center justify-center text-slate-300">
                                                <FaHandPaper size={24} className="mb-2 opacity-20" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest italic">No active requests</p>
                                            </div>
                                        ) : (
                                            handsRaised.map(student => (
                                                <div key={student.id} className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-amber-900">{student.name}</span>
                                                        <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest">Question Pending</span>
                                                    </div>
                                                    {isInstructor && (
                                                        <button
                                                            onClick={() => approveStudent(student.id)}
                                                            className="bg-amber-600 text-white px-4 py-2 rounded-xl text-[8px] font-bold uppercase hover:bg-amber-700 transition-all"
                                                        >
                                                            Grant Access
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {/* Global CSS for unique animations */}
            <style>{`
                @keyframes reaction-float {
                    0% { transform: translateY(0) scale(0.5); opacity: 0; }
                    20% { opacity: 1; transform: translateY(-30px) scale(1.1); }
                    80% { opacity: 1; transform: translateY(-200px) scale(1.3); }
                    100% { transform: translateY(-300px) scale(1.5); opacity: 0; }
                }
                .animate-reaction-float {
                    animation: reaction-float 3s ease-out forwards;
                }
                .scrollbar-minimal::-webkit-scrollbar {
                    width: 4px;
                }
                .scrollbar-minimal::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-minimal::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .scrollbar-minimal::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>

            {/* Toast Notification */}
            {
                notification && (
                    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                        <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 backdrop-blur-md border ${notification.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
                            notification.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' :
                                notification.type === 'warning' ? 'bg-amber-500/90 border-amber-400 text-white' :
                                    'bg-blue-600/90 border-blue-400 text-white'
                            }`}>
                            {notification.type === 'error' && <FaTimesCircle size={20} />}
                            {notification.type === 'success' && <FaCheckCircle size={20} />}
                            {notification.type === 'warning' && <FaExclamationTriangle size={20} />}
                            {notification.type === 'info' && <FaInfoCircle size={20} />}
                            <span className="font-bold text-sm tracking-wide">{notification.message}</span>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default LiveClassRoom;
