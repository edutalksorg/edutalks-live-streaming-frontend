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
    FaShieldAlt, FaComments, FaUsers,
    FaTimesCircle, FaCheckCircle, FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa';

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const StudentSuperInstructorClassRoom: React.FC = () => {
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
    const [localScreenTrack, setLocalScreenTrack] = useState<ILocalVideoTrack | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [layoutMode, setLayoutMode] = useState<'focus' | 'balanced' | 'discussion'>('balanced');
    const [pipPosition, setPipPosition] = useState({ x: 20, y: 20, corner: 'bottom-right' });
    const [activeSpeakerUid, setActiveSpeakerUid] = useState<number | null>(null);
    const [screenSharerUid, setScreenSharerUid] = useState<number | null>(null);

    // Agora State
    const [client, setClient] = useState<IAgoraRTCClient | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
    const [micOn, setMicOn] = useState(false);
    const [cameraOn, setCameraOn] = useState(false);
    const cameraOnRef = useRef(cameraOn);
    useEffect(() => { cameraOnRef.current = cameraOn; }, [cameraOn]);

    const localVideoTrackRef = useRef(localVideoTrack);
    useEffect(() => { localVideoTrackRef.current = localVideoTrack; }, [localVideoTrack]);

    // Socket & Signaling
    const socketRef = useRef<Socket | null>(null);
    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null); // Ref to avoid stale closure for track access
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
    const [screenLocked, setScreenLocked] = useState(true); // Locked by default - instructor must grant permission

    const [recordingProtected, setRecordingProtected] = useState(false);
    const [watermarkPos, setWatermarkPos] = useState({ top: '10%', left: '10%' });
    const [isWindowBlurred, setIsWindowBlurred] = useState(false);

    // Track which students have permission to unmute (instructor-controlled)
    const [studentsWithUnmutePermission, setStudentsWithUnmutePermission] = useState<Set<string>>(new Set());
    const studentsWithUnmutePermissionRef = useRef(studentsWithUnmutePermission);
    useEffect(() => { studentsWithUnmutePermissionRef.current = studentsWithUnmutePermission; }, [studentsWithUnmutePermission]);

    // Track students who are explicitly blocked from unmuting
    const [blockedStudents, setBlockedStudents] = useState<Set<string>>(new Set());
    const blockedStudentsRef = useRef(blockedStudents);
    useEffect(() => { blockedStudentsRef.current = blockedStudents; }, [blockedStudents]);

    // Track which students have permission to share screen
    const [studentsWithScreenSharePermission, setStudentsWithScreenSharePermission] = useState<Set<string>>(new Set());
    const studentsWithScreenSharePermissionRef = useRef(studentsWithScreenSharePermission);
    useEffect(() => { studentsWithScreenSharePermissionRef.current = studentsWithScreenSharePermission; }, [studentsWithScreenSharePermission]);

    // Track students who are explicitly blocked from screen sharing
    const [blockedScreenShareStudents, setBlockedScreenShareStudents] = useState<Set<string>>(new Set());
    const blockedScreenShareStudentsRef = useRef(blockedScreenShareStudents);
    useEffect(() => { blockedScreenShareStudentsRef.current = blockedScreenShareStudents; }, [blockedScreenShareStudents]);

    const micOnRef = useRef(micOn);
    useEffect(() => { micOnRef.current = micOn; }, [micOn]);

    const isScreenSharingRef = useRef(isScreenSharing);
    useEffect(() => { isScreenSharingRef.current = isScreenSharing; }, [isScreenSharing]);

    // Notification State
    const [notification, setNotification] = useState<{ message: string, type: 'info' | 'success' | 'error' | 'warning' } | null>(null);

    // Toast Helper
    const showToast = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const localScreenTrackRef = useRef(localScreenTrack);
    useEffect(() => { localScreenTrackRef.current = localScreenTrack; }, [localScreenTrack]);


    const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
    const [showTray, setShowTray] = useState<'chat' | 'participants' | 'hands' | null>(null);
    const showTrayRef = useRef(showTray);
    const mainStageRef = useRef<HTMLDivElement>(null);

    const isInstructor = user?.role === 'instructor' || user?.role === 'super_instructor' || user?.role === 'admin' || user?.role === 'super_admin';
    const isInstructorRef = useRef(isInstructor);
    useEffect(() => { isInstructorRef.current = isInstructor; }, [isInstructor]);

    // Ref to store pending "user left" timeouts
    const pendingLeftToastsRef = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>({});

    // --- Effects ---

    useEffect(() => { showTrayRef.current = showTray; }, [showTray]);

    // Ref to ignore blur events immediately after screen sharing stops (browser UI interaction causes false positive)
    const isLocalSharingEndingRef = useRef(false);


    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/api/super-instructor/classes/${id}`);
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
            socket.emit('join_class', { classId: id, userId: user?.id, userName: user?.name, role: user?.role, classType: 'super' });
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
            if (data.locked && !isInstructor && !studentsWithUnmutePermissionRef.current.has(String(user?.id))) {
                setMicOn(false);
                localAudioTrackRef.current?.setEnabled(false);
            }
        });
        socket.on('video_status', (data) => {
            setVideoLocked(data.locked);
            if (data.locked && !isInstructor) {
                setCameraOn(false);
                localVideoTrack?.setEnabled(false);
            }
        });
        socket.on('screen_status', (data) => {
            setScreenLocked(data.locked);
            // If locked and I am not instructor and I don't have special permission, stop sharing
            if (data.locked && !isInstructorRef.current && !studentsWithScreenSharePermissionRef.current.has(String(user?.id)) && isScreenSharing) {
                toggleScreenShare(); // Logic handles stop and unpublish
            }
        });

        socket.on('recording_protection_status', (data) => {
            setRecordingProtected(data.active);
            if (!isInstructorRef.current) {
                if (data.active) {
                    showAlert("Instructor has enabled 'Screen Recording Protection'. Content will be blurred if you leave the tab, and a security watermark is active.", "info", "SECURITY ENABLED");
                } else {
                    showAlert("Screen Recording Protection has been disabled.", "info", "SECURITY DISABLED");
                    setIsWindowBlurred(false);
                }
            }
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
            // Remove from raised hands list for everyone
            setHandsRaised(prev => prev.filter(h => h.id !== data.studentId));

            if (String(user?.id) === String(data.studentId)) {
                setIsHandRaised(false);
                setAudioLocked(false);
                setVideoLocked(false);
                setScreenLocked(false);

                // Auto-enable media as specified
                try {
                    if (!micOnRef.current) await toggleMic(true);
                    await toggleCamera(true); // Force camera ON (won't toggle if already on)
                } catch (e) { console.error(e); }

                showAlert("Instructor approved your request. Microphone and Camera enabled.", "success");
            }
        });

        socket.on('receive_screen_share_request', async (data) => {
            if (isInstructor) {
                const confirmed = await showConfirm(`${data.studentName} wants to share their screen. Allow?`, "info", "STREAM REQUEST");
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

                // Cleanup ref entry
                delete pendingLeftToastsRef.current[data.userId];
            }, 15000); // 15 seconds delay

            pendingLeftToastsRef.current[data.userId] = timeoutId;
        });

        // --- Screen Share Permission Handlers ---
        socket.on('force_stop_screen_share', async (data) => {
            console.log('[Socket] force_stop_screen_share received', data);
            const sid = String(data.studentId);

            // Remove permission for this student
            setStudentsWithScreenSharePermission(prev => {
                const newSet = new Set(prev);
                newSet.delete(sid);
                console.log('[Permission State] Removed permission for student:', sid);
                return newSet;
            });
            setBlockedScreenShareStudents(prev => new Set(prev).add(sid));

            if (String(user?.id) === sid) {
                // Check if currently sharing using Reft to avoid stale closures
                if (isScreenSharingRef.current) {
                    console.log('[Screen Share] Force stopping (individual)...');
                    try {
                        const track = localScreenTrackRef.current;
                        if (track) {
                            await client?.unpublish(track);
                            track.stop();
                            track.close();
                        }
                    } catch (err) {
                        console.error("Error force stopping screen share:", err);
                    }
                    setLocalScreenTrack(null);
                    setIsScreenSharing(false);
                    setScreenSharerUid(null);

                    // Republish camera if needed
                    if (localVideoTrack && cameraOn) {
                        await client?.publish(localVideoTrack);
                    }

                    socketRef.current?.emit('share_screen', { classId: id, studentId: user?.id, allowed: false });
                    showAlert("Super Instructor has stopped your screen share.", 'warning');
                }
            }
        });

        socket.on('force_stop_all_screen_share', async () => {
            console.log('[Socket] force_stop_all_screen_share received');
            // Clear all permissions
            setStudentsWithScreenSharePermission(new Set());
            console.log('[Permission State] Cleared all screen share permissions');

            if (!isInstructorRef.current) {
                // Students only: lock screen sharing and stop if currently sharing
                setScreenLocked(true);
                setBlockedScreenShareStudents(prev => new Set(prev).add(String(user?.id)));

                if (isScreenSharingRef.current) {
                    console.log('[Screen Share] Force stopping (all)...');
                    try {
                        const track = localScreenTrackRef.current;
                        if (track) {
                            await client?.unpublish(track);
                            track.stop();
                            track.close();
                        }
                    } catch (err) {
                        console.error("Error force stopping all screen shares:", err);
                    }
                    setLocalScreenTrack(null);
                    setIsScreenSharing(false);
                    setScreenSharerUid(null);

                    // Republish camera if needed
                    if (localVideoTrack && cameraOn) {
                        await client?.publish(localVideoTrack);
                    }

                    socketRef.current?.emit('share_screen', { classId: id, studentId: user?.id, allowed: false });
                    showAlert("Super Instructor has stopped all screen sharing.", 'warning');
                }
            }
        });

        socket.on('grant_screen_share_permission', (data) => {
            console.log('[Socket] grant_screen_share_permission received', data);
            const sid = String(data.studentId);

            setStudentsWithScreenSharePermission(prev => {
                const newSet = new Set(prev).add(sid);
                console.log('[Permission Update] Granted permission to:', sid);
                return newSet;
            });
            setBlockedScreenShareStudents(prev => {
                const next = new Set(prev);
                next.delete(sid);
                return next;
            });

            if (String(user?.id) === sid) {
                setScreenLocked(false);
                console.log('[Permission Granted] Screen unlocked for current user');
                showAlert("Super Instructor granted you permission to share screen.", 'success');
            }
        });

        socket.on('unlock_all_screen_shares', () => {
            console.log('[Socket] unlock_all_screen_shares received');

            // Grant permission to ALL online students
            const allStudentIds = onlineUsers.map(u => String(u.userId));
            setStudentsWithScreenSharePermission(new Set(allStudentIds));
            console.log('[Permission State] Granted screen share permission to all students:', allStudentIds);

            setBlockedScreenShareStudents(new Set());
            setScreenLocked(false);

            if (!isInstructor) {
                showAlert("Super Instructor has unlocked screen sharing.", 'success');
            }
        });

        socket.on('si_class_ended', () => {
            if (!isInstructor) {
                showAlert("The Super Instructor has ended the live session.", "info").then(() => {
                    navigate('/student');
                });
            }
        });

        socket.on('grant_unmute_permission', (data) => {
            // Grant permission in local state for everyone so UI updates
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

                showAlert("Instructor granted you permission to unmute. Microphone and Camera enabled.", "success");
            }
        });

        socket.on('force_mute_student', async (data) => {
            const sid = String(data.studentId);
            setStudentsWithUnmutePermission(prev => {
                const newSet = new Set(prev);
                newSet.delete(sid);
                return newSet;
            });
            setBlockedStudents(prev => new Set(prev).add(sid));

            if (String(user?.id) === sid) {
                if (localAudioTrackRef.current) {
                    await localAudioTrackRef.current.setEnabled(false);
                    if (clientRef.current) await clientRef.current.unpublish(localAudioTrackRef.current);
                    setMicOn(false);
                    showAlert("You have been muted by the instructor.", "warning");
                }
            }
        });

        socket.on('force_mute_all', async () => {
            setStudentsWithUnmutePermission(new Set());
            if (!isInstructor) {
                setAudioLocked(true);
                setBlockedStudents(prev => new Set(prev).add(String(user?.id)));
                if (localAudioTrackRef.current) {
                    await localAudioTrackRef.current.setEnabled(false);
                    if (clientRef.current) await clientRef.current.unpublish(localAudioTrackRef.current);
                    setMicOn(false);
                    showAlert("Instructor muted everyone.", "warning");
                }
            }
        });

        socket.on('unlock_all_mics', () => {
            setBlockedStudents(new Set()); // Clear all blocks
            setAudioLocked(false);
            if (!isInstructor) {
                showAlert("Instructor has unlocked all microphones.", "success");
            }
        });

        // --- NEW: Screen Share Permission Handlers ---
        socket.on('force_stop_screen_share', async (data) => {
            const sid = String(data.studentId);
            setStudentsWithScreenSharePermission(prev => {
                const newSet = new Set(prev);
                newSet.delete(sid);
                return newSet;
            });
            setBlockedScreenShareStudents(prev => new Set(prev).add(sid));

            if (String(user?.id) === sid && isScreenSharing) {
                await toggleScreenShare(); // Stop sharing
                showAlert("Instructor has stopped your screen share.", "warning");
            }
        });

        socket.on('force_stop_all_screen_share', async () => {
            setStudentsWithScreenSharePermission(new Set());

            if (!isInstructorRef.current) {
                setScreenLocked(true);
                setBlockedScreenShareStudents(prev => new Set(prev).add(String(user?.id)));

                if (isScreenSharing) {
                    await toggleScreenShare(); // Stop sharing
                    showAlert("Instructor has stopped all screen sharing.", "warning");
                }
            }
        });

        socket.on('grant_screen_share_permission', (data) => {
            const sid = String(data.studentId);
            setStudentsWithScreenSharePermission(prev => new Set(prev).add(sid));
            setBlockedScreenShareStudents(prev => {
                const next = new Set(prev);
                next.delete(sid);
                return next;
            });

            if (String(user?.id) === sid) {
                setScreenLocked(false);
                showAlert("Instructor granted you permission to share screen.", "success");
            }
        });

        socket.on('unlock_all_screen_shares', () => {
            setBlockedScreenShareStudents(new Set());
            setScreenLocked(false);
            if (!isInstructor) {
                showAlert("Instructor has unlocked screen sharing.", "success");
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [id]);

    // Watermark Movement & Focus Management
    useEffect(() => {
        if (!recordingProtected) return;

        // Immediate Logic Check on State Change
        if (isScreenSharing) {
            // "Screen Recording" (sharing) detected -> Force Blur
            setIsWindowBlurred(true);
        } else if (document.visibilityState === 'visible') {
            // Sharing stopped and we are visible -> Unblur
            setIsWindowBlurred(false);
        }

        const moveWatermark = () => {
            const top = Math.floor(Math.random() * 80) + 10 + '%';
            const left = Math.floor(Math.random() * 80) + 10 + '%';
            setWatermarkPos({ top, left });
        };
        const interval = setInterval(moveWatermark, 5000);

        const handleBlur = () => {
            if (isLocalSharingEndingRef.current) return;
            setIsWindowBlurred(true);
            // If strictly locking on blur:
            if (!isInstructorRef.current) {
                // setIsViolationLocked(true); // Maybe too strict if just a brief switch?
            }
        };

        const handleFocus = () => {
            if (isScreenSharing) return; // Keep blurred if sharing
            setIsWindowBlurred(false);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState !== 'visible') {
                if (isLocalSharingEndingRef.current) return;
                if (!isInstructorRef.current) {
                    setIsWindowBlurred(true);
                    // Permanent Lockout REMOVED to allow auto-resume
                    // Report violation if recording protection is on and they switch away
                    socketRef.current?.emit('violation_report', {
                        classId: id,
                        studentId: user?.id,
                        studentName: user?.name,
                        type: 'TAB_SWITCH',
                        timestamp: new Date()
                    });
                }
            } else {
                if (isScreenSharing) return;
                setIsWindowBlurred(false);
            }
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [recordingProtected, id, user?.id, user?.name, isScreenSharing]);

    // Main Stage Track Playback Effect
    useEffect(() => {
        const el = mainStageRef.current;
        if (!el || showWhiteboard) return;

        console.log(`[Playback] Syncing stage. sharing: ${isScreenSharing}, sharer: ${screenSharerUid}`);

        const playTrack = (track: any) => {
            try {
                // track.stop(); // Reset local preview state - confusing if multiple plays?
                // Agora SDK handles re-playing on same element usually, but stop() is safe.
                // IMPORTANT: Use 'contain' for screen share to avoid zooming/cropping
                track.play(el, { fit: 'contain' });

                // MANUAL OVERRIDE: Force constraints to ensure visibility
                setTimeout(() => {
                    const video = el.querySelector('video');
                    if (video) {
                        video.style.objectFit = 'contain';
                        video.style.width = '100%';
                        video.style.height = '100%';
                    }
                }, 200);
            } catch (e) {
                console.error("[Playback] Play error:", e);
            }
        };

        if (isScreenSharing && screenSharerUid) {
            // Force a slight delay to ensure DOM is ready and any old tracks are cleared
            setTimeout(() => {
                if (screenSharerUid === Number(user?.id)) {
                    if (localScreenTrack) {
                        console.log("[Playback] Playing LOCAL screen track");
                        playTrack(localScreenTrack);
                    } else {
                        console.warn("[Playback] LOCAL screen track missing");
                    }
                } else {
                    const sharer = remoteUsers.find(u => String(u.uid) === String(screenSharerUid));
                    if (sharer?.videoTrack) {
                        console.log("[Playback] Playing REMOTE screen track from", sharer.uid);
                        playTrack(sharer.videoTrack);
                    } else {
                        console.warn("[Playback] REMOTE screen track for sharer missing in remoteUsers", remoteUsers.map(u => u.uid));
                    }
                }
                window.dispatchEvent(new Event('resize'));
            }, 100);
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
                    api.get(`/api/super-instructor/classes/${id}`).then(res => {
                        if (res.data.status === 'live') setIsLive(true);
                    });
                }
            } else {
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${mins}m ${secs}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [classDetails, isLive]);

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
                const tokenRes = await api.get(`/api/super-instructor/classes/${id}/token`);
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
                    localAudioTrackRef.current = audioTrack; // Sync ref
                    setLocalVideoTrack(videoTrack);
                    setMicOn(true);
                    setCameraOn(true);
                    await agoraClient.publish([audioTrack, videoTrack]);
                } catch (e) {
                    console.warn("Failed to auto-enable media:", e);
                }

                if (isInstructor) {
                    await api.post(`/api/super-instructor/classes/${id}/start`);
                }

            } catch (error) {
                console.error("Agora Init Error:", error);
            }
        };

        initAgora();

        return () => {
            const trackA = localAudioTrackRef.current;
            const trackV = localVideoTrack;
            const trackS = localScreenTrack;
            const c = clientRef.current;

            if (trackA) { trackA.stop(); trackA.close(); }
            if (trackV) { trackV.stop(); trackV.close(); }
            if (trackS) { trackS.stop(); trackS.close(); }
            if (c) { c.leave(); }
        };
    }, [isLive]);

    const toggleMic = async (bypassLock = false) => {
        const isLocked = audioLockedRef.current;
        const isBlocked = blockedStudentsRef.current.has(String(user?.id));
        const hasPermission = studentsWithUnmutePermissionRef.current.has(String(user?.id));

        if (!isInstructor && !bypassLock && (isBlocked || (isLocked && !hasPermission))) {
            showAlert("You don't have permission to unmute. Please raise your hand or wait for the instructor to grant permission.", "warning", "MIC LOCKED");
            return;
        }

        try {
            const currentMicOn = micOnRef.current;
            if (localAudioTrackRef.current) {
                const newMicState = !currentMicOn;
                await localAudioTrackRef.current.setEnabled(newMicState);
                setMicOn(newMicState);

                // Ensure published if turning on, Unpublish if turning off
                if (newMicState && client) {
                    try {
                        await client.publish(localAudioTrackRef.current);
                    } catch (err: any) {
                        if (err.code !== 'TRACK_IS_ALREADY_PUBLISHED' && err.message !== 'track is already published') {
                            console.warn("Microphone republish warning:", err);
                        }
                    }
                } else if (!newMicState && client) {
                    try {
                        await client.unpublish(localAudioTrackRef.current);
                    } catch (err) {
                        console.warn("Microphone unpublish warning:", err);
                    }
                }
            } else if (!currentMicOn) {
                const track = await AgoraRTC.createMicrophoneAudioTrack();
                localAudioTrackRef.current = track; // Sync Ref
                await client?.publish(track);
                setMicOn(true);
            }
        } catch (err) {
            console.error("Toggle Mic Error:", err);
            showAlert("Failed to toggle microphone. Please check permissions.", "error");
        }
    };

    const toggleCamera = async (forceOn = false) => {
        if (!isInstructor && videoLocked && !forceOn) return;

        // If forceOn is true and camera is already on, do nothing
        if (forceOn && cameraOn) return;

        if (localVideoTrack) {
            const newCameraState = forceOn ? true : !cameraOn;
            await localVideoTrack.setEnabled(newCameraState);
            setCameraOn(newCameraState);

            // Ensure published if turning on, Unpublish if turning off
            if (newCameraState && client) {
                try {
                    await client.publish(localVideoTrack);
                } catch (err: any) {
                    if (err.code !== 'TRACK_IS_ALREADY_PUBLISHED' && err.message !== 'track is already published') {
                        console.warn("Camera republish warning:", err);
                    }
                }
            } else if (!newCameraState && client) {
                try {
                    await client.unpublish(localVideoTrack);
                } catch (err) {
                    console.warn("Camera unpublish warning:", err);
                }
            }
        } else {
            const track = await AgoraRTC.createCameraVideoTrack();
            setLocalVideoTrack(track);
            await client?.publish(track);
            setCameraOn(true);
        }
    };

    const toggleScreenShare = async () => {
        if (!isInstructor) {
            // Check permissions
            const isLocked = screenLocked;
            const isBlocked = blockedScreenShareStudentsRef.current.has(String(user?.id));
            const hasPermission = studentsWithScreenSharePermissionRef.current.has(String(user?.id));

            if (isBlocked || (isLocked && !hasPermission)) {
                showAlert("You don't have permission to share screen.", "error");
                return;
            }
        }
        if (isScreenSharing) {
            // Stopping Screen Share
            try {
                if (localScreenTrack) {
                    await client?.unpublish(localScreenTrack);
                    localScreenTrack.stop();
                    localScreenTrack.close();
                }
                setLocalScreenTrack(null);
                setIsScreenSharing(false);
                setScreenSharerUid(null);

                // Set grace period flag
                isLocalSharingEndingRef.current = true;
                setTimeout(() => { isLocalSharingEndingRef.current = false; }, 2000);

                if (localVideoTrack && cameraOn) {
                    await client?.publish(localVideoTrack);
                }

                socketRef.current?.emit('share_screen', { classId: id, studentId: user?.id, allowed: false });
            } catch (err) {
                console.error("Error stopping screen share:", err);
            }
        } else {
            // Starting Screen Share
            try {
                // 1. CRITICAL: Unpublish ALL video tracks before screen share
                console.log('[Student Screen Share] Checking for published video tracks...');
                const publishedTracks = client?.localTracks || [];
                console.log('[Student Screen Share] Currently published tracks:', publishedTracks.map(t => ({ type: t.trackMediaType, id: t.getTrackId() })));

                for (const track of publishedTracks) {
                    if (track.trackMediaType === 'video') {
                        console.log('[Student Screen Share] Unpublishing video track:', track.getTrackId());
                        await client?.unpublish(track);
                        console.log('[Student Screen Share] Video track unpublished successfully');
                    }
                }

                // 2. Set grace period for picker dialog
                isLocalSharingEndingRef.current = true;
                setTimeout(() => { isLocalSharingEndingRef.current = false; }, 3000); // 3s for picker interaction

                // 3. Create screen track
                const screenTrack = await AgoraRTC.createScreenVideoTrack({}, "auto");
                const track = Array.isArray(screenTrack) ? screenTrack[0] : screenTrack;
                console.log('[Student Screen Share] Screen track created:', track.getTrackId());

                // 4. Publish Screen
                setLocalScreenTrack(track);
                setIsScreenSharing(true);
                setScreenSharerUid(Number(user?.id));
                setShowWhiteboard(false);

                console.log('[Student Screen Share] Publishing screen track...');
                await client?.publish(track);
                console.log('[Student Screen Share] Screen track published successfully');
                socketRef.current?.emit('share_screen', { classId: id, studentId: user?.id, allowed: true });

                track.on("track-ended", async () => {
                    // Set grace period flag FIRST
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
                await api.post(`/api/super-instructor/classes/${id}/end`);
                navigate('/super-instructor/live-classes');
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



    const approveStudent = (studentId: string) => {
        socketRef.current?.emit('approve_hand', { classId: id, studentId });
        setHandsRaised(prev => prev.filter(h => h.id !== studentId));
        // Auto-enable permissions for the approved student is handled by the socket listener 'hand_approved'
    };

    // requestScreenShare removed to fix unused variable error

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
        <div ref={containerRef} className="h-screen w-full bg-[#0A0A10] text-[#F8FAFC] font-sans flex overflow-hidden selection:bg-primary/20 relative">
            {/* Recording Protection: Blur Overlay */}
            {/* SMART LOGIC: Don't blur if instructor is screen sharing (students need to see it!) */}
            {!isInstructor && recordingProtected && (
                (isScreenSharing && screenSharerUid === Number(user?.id)) ||
                (isWindowBlurred && !(isScreenSharing && screenSharerUid && screenSharerUid !== Number(user?.id)))
            ) && (
                    <div className="absolute inset-0 z-[9999] bg-slate-900/80 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-8 pointer-events-auto">
                        <div className="w-24 h-24 mb-6 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-pulse">
                            <FaShieldAlt size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-2 italic">
                            Content Protected
                        </h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-md">
                            {screenSharerUid === Number(user?.id)
                                ? "Screen recording is not allowed during protected sessions."
                                : "Live stream is blurred because protection is active and you have left the focal area."}
                        </p>
                        <p className="mt-8 text-[10px] font-black text-red-500/50 uppercase tracking-[0.3em] animate-bounce">
                            {screenSharerUid === Number(user?.id)
                                ? "Stop screen share to resume"
                                : "Return to focal tab to resume"}
                        </p>
                    </div>
                )}

            {/* Recording Protection: Watermark */}
            {
                !isInstructor && recordingProtected && (
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
                )
            }
            {/* Main Stage */}
            <div className="flex-1 flex flex-col relative overflow-hidden h-full">
                {/* Minimal Tactical Header */}
                <header className="absolute top-0 left-0 w-full z-30 p-4 flex justify-between items-start pointer-events-none transition-all duration-700">
                    <div className="flex flex-col gap-2 pointer-events-auto">
                        {/* Removed: 3 screen size option buttons - now using Focus View toggle on main stage */}
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
                <main className={`flex-1 bg-slate-100 relative flex flex-col overflow-hidden h-full transition-all duration-700 ${layoutMode === 'focus' ? 'p-0' : 'p-2 lg:p-4'}`}>
                    {/* 70/30 Stage + Sidebar Layout (When Screen Sharing) */}
                    {(isScreenSharing || showWhiteboard) && (
                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            {/* Main Stage (70% or 100% in focus mode) */}
                            <div className={`transition-all duration-700 h-full ${layoutMode === 'focus' ? 'w-full' : 'p-2 lg:p-4 w-full lg:w-[70%]'}`}>
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

                            {/* Participant Sidebar (30%) - Hidden in focus mode */}
                            {layoutMode !== 'focus' && (
                                <div className="hidden lg:flex w-[30%] h-full bg-slate-50 border-l border-slate-200 flex-col p-4 overflow-y-auto gap-4 scrollbar-minimal animate-in slide-in-from-right duration-500 relative">
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
                                            const rUser = remoteUsers.find(ru => String(ru.uid) === String(u.userId) || Number(ru.uid) === Number(u.userId));
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

                    {/* Video Grid (Shown if no active content) */}
                    {!(showWhiteboard || isScreenSharing) && (
                        <div className="p-2 lg:p-4 transition-all duration-500 overflow-y-auto flex-1 h-full">
                            <div className="grid gap-3 auto-rows-max h-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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
                                    const rUser = remoteUsers.find(ru => String(ru.uid) === String(u.userId) || Number(ru.uid) === Number(u.userId));
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
                    )}


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

                {/* Floating Tactical Command Bar */}
                <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] sm:w-auto min-w-[320px] max-w-[95%] bg-white/90 backdrop-blur-md border border-slate-200 p-1 md:p-1.5 rounded-2xl sm:rounded-full flex items-center justify-between z-50 shadow-2xl gap-2 md:gap-4 shrink-0 transition-all duration-500 hover:shadow-blue-500/10 h-auto">
                    {/* Compact Title & Status */}
                    <div className="flex items-center gap-2 md:gap-4 pl-2 shrink-0 max-w-[80px] md:max-w-xs">
                        <div className="flex flex-col">
                            <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none truncate">{classDetails.title}</h2>
                            <div className="hidden md:flex items-center gap-1.5 mt-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] whitespace-nowrap">Active</p>
                            </div>
                        </div>
                    </div>

                    {/* Consolidated Interaction Icons (Single Row) */}
                    <div className="flex items-center justify-center gap-1 md:gap-3 flex-1 flex-wrap">
                        {/* Media Controls */}
                        <div className="flex items-center gap-1 md:gap-2">
                            <button
                                onClick={() => toggleMic()}
                                disabled={!isInstructor && audioLocked}
                                className={`w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-90 border shadow-sm ${micOn ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-blue-600 border-blue-700 text-white animate-pulse'}`}
                                title={micOn ? "Disable Microphone" : "Enable Microphone"}
                            >
                                {micOn ? <FaMicrophone size={12} /> : <FaMicrophoneSlash size={12} />}
                            </button>
                            <button
                                onClick={() => toggleCamera()}
                                disabled={!isInstructor && videoLocked}
                                className={`w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-90 border shadow-sm ${cameraOn ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-blue-600 border-blue-700 text-white'}`}
                                title={cameraOn ? "Disable Visuals" : "Enable Visuals"}
                            >
                                {cameraOn ? <FaVideo size={12} /> : <FaVideoSlash size={12} />}
                            </button>
                            <button
                                onClick={toggleScreenShare}
                                className={`w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-90 border shadow-sm ${isScreenSharing ? 'bg-blue-600 border-blue-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                title="Share Screen"
                            >
                                <FaDesktop size={12} />
                            </button>
                            {isInstructor && (
                                <>
                                    <button
                                        onClick={() => {
                                            if (isScreenSharing) {
                                                showAlert("First stop the screen share then start sharing whiteboard", "warning", "CONFLICT DETECTED");
                                                return;
                                            }
                                            const next = !showWhiteboard;
                                            setShowWhiteboard(next);
                                            socketRef.current?.emit('toggle_whiteboard_visibility', { classId: id, show: next });
                                        }}
                                        className={`w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-90 border shadow-sm ${showWhiteboard ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                        title="Open Whiteboard"
                                    >
                                        <FaChalkboard size={12} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const next = !recordingProtected;
                                            setRecordingProtected(next);
                                            socketRef.current?.emit('toggle_recording_protection', { classId: id, active: next });
                                            showToast(next ? "Screen Recording Protection ENABLED" : "Screen Recording Protection DISABLED", next ? "warning" : "info");
                                        }}
                                        className={`hidden sm:flex w-8 h-8 md:w-11 md:h-11 rounded-full items-center justify-center transition-all duration-300 transform active:scale-90 border shadow-sm ${recordingProtected ? 'bg-orange-600 border-orange-700 text-white animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                                        title={recordingProtected ? "Disable Screen Recording Protection" : "Enable Screen Recording Protection"}
                                    >
                                        <FaShieldAlt size={12} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Tray Icons and Hands */}
                        <div className="flex items-center gap-1 md:gap-2">
                            {!isInstructor && (
                                <button
                                    onClick={handleHandRaise}
                                    className={`w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all border shadow-sm transform active:scale-95 ${isHandRaised ? 'bg-blue-600 text-white border-blue-700 animate-bounce' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                                >
                                    <FaHandPaper size={12} className={isHandRaised ? 'rotate-12' : ''} />
                                </button>
                            )}
                            {[
                                { id: 'chat', icon: FaComments, title: 'Chat', count: unreadMsgCount },
                                { id: 'participants', icon: FaUsers, title: 'Participants', count: onlineUsers.length },
                                { id: 'hands', icon: FaHandPaper, title: 'Alerts', count: handsRaised.length }
                            ].map(tray => (
                                (tray.id !== 'hands' || isInstructor) && (
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
                                        className={`relative w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all border shadow-sm ${showTray === tray.id ? 'bg-blue-600 border-blue-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                                        title={tray.title}
                                    >
                                        <tray.icon size={12} />
                                        {tray.count > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] font-black px-1 py-0.5 rounded-full min-w-[14px] text-center">
                                                {tray.count}
                                            </span>
                                        )}
                                    </button>
                                )
                            ))}
                        </div>
                    </div>

                    {/* End/Leave Session Button */}
                    <div className="pr-1">
                        {isInstructor ? (
                            <button
                                onClick={handleEndClass}
                                className="flex items-center justify-center gap-2 px-2 md:px-5 w-8 h-8 md:w-auto h-8 md:h-11 rounded-full bg-red-600 text-white font-black uppercase tracking-widest text-[9px] hover:bg-red-700 transition-all shadow-lg active:scale-95 whitespace-nowrap"
                                title="End Session"
                            >
                                <FaPhoneSlash size={12} />
                                <span className="hidden md:inline">End Session</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/student')}
                                className="flex items-center justify-center gap-2 px-2 md:px-5 w-8 h-8 md:w-auto h-8 md:h-11 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[9px] hover:bg-slate-200 transition-all shadow-md active:scale-95 whitespace-nowrap"
                                title="Leave Class"
                            >
                                <FaPhoneSlash size={12} />
                                <span className="hidden md:inline">Leave</span>
                            </button>
                        )}
                    </div>
                </footer>

                {/* Pop-up Tray Overlay */}
                {showTray && (
                    <div className="absolute inset-0 z-[60] flex items-end justify-end p-2 md:p-8 pointer-events-none">
                        <div className="w-full max-w-sm h-3/4 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden pointer-events-auto animate-in slide-in-from-right duration-500">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">{showTray} Panel</h3>
                                <button onClick={() => setShowTray(null)} className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-300">×</button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {showTray === 'chat' && (
                                    <div className="flex flex-col h-full">
                                        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                                            {messages.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                                    <FaComments size={32} className="mb-3 opacity-20" />
                                                    <p className="text-xs font-bold">No messages yet</p>
                                                    <p className="text-[10px] mt-1">Start the conversation!</p>
                                                </div>
                                            ) : (
                                                messages.map((m, i) => (
                                                    <div key={i} className={`flex flex-col ${m.senderName === user?.name ? 'items-end' : 'items-start'}`}>
                                                        <span className="text-[8px] font-bold text-slate-500 uppercase mb-1 px-1">{m.senderName}</span>
                                                        <div className={`p-3 rounded-2xl text-sm font-medium max-w-[80%] shadow-sm ${m.senderName === user?.name ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200'}`}>
                                                            {m.message}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-2 bg-slate-50">
                                            <input
                                                value={chatMsg}
                                                onChange={(e) => setChatMsg(e.target.value)}
                                                placeholder="Type message..."
                                                disabled={chatLocked && !isInstructor}
                                                className="flex-1 bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 ring-blue-500 outline-none disabled:opacity-50"
                                            />
                                            <button
                                                type="submit"
                                                disabled={chatLocked && !isInstructor}
                                                className="bg-blue-600 text-white p-3 px-5 rounded-xl text-xs font-bold uppercase hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Send
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {showTray === 'participants' && (
                                    <div className="p-4 space-y-3">
                                        <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                                            <p className="text-xs font-bold text-blue-900">Total: {onlineUsers.length} participant{onlineUsers.length !== 1 ? 's' : ''}</p>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-black uppercase shadow-md">
                                                    {user?.name?.slice(0, 2)}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold text-slate-900 block">{user?.name}</span>
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase">(You)</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 text-slate-400">
                                                {micOn ? <FaMicrophone size={14} className="text-emerald-500" /> : <FaMicrophoneSlash size={14} className="text-rose-500" />}
                                                {cameraOn ? <FaVideo size={14} className="text-emerald-500" /> : <FaVideoSlash size={14} className="text-rose-500" />}
                                            </div>
                                        </div>
                                        {onlineUsers.filter(u => String(u.userId) !== String(user?.id)).length === 0 ? (
                                            <div className="h-32 flex flex-col items-center justify-center text-slate-400">
                                                <FaUsers size={28} className="mb-2 opacity-20" />
                                                <p className="text-xs font-bold">Waiting for others...</p>
                                            </div>
                                        ) : (
                                            onlineUsers.filter(u => String(u.userId) !== String(user?.id)).map(u => {
                                                const rUser = remoteUsers.find(ru => String(ru.uid) === String(u.userId));
                                                return (
                                                    <div key={u.userId} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 text-xs font-black uppercase shadow-sm">
                                                                {u.userName?.slice(0, 2) || '??'}
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-bold text-slate-900 block">{u.userName || 'Unknown'}</span>
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase">{u.role || 'Student'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {rUser?.hasAudio ? (
                                                                <FaMicrophone size={14} className="text-emerald-500" />
                                                            ) : (!audioLocked || studentsWithUnmutePermission.has(String(u.userId))) ? (
                                                                <FaMicrophone size={14} className="text-slate-400 opacity-50" />
                                                            ) : (
                                                                <FaMicrophoneSlash size={14} className="text-rose-400/50" />
                                                            )}
                                                            {rUser?.hasVideo ? <FaVideo size={14} className="text-emerald-500" /> : <FaVideoSlash size={14} className="text-slate-300" />}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
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
                    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce cursor-pointer" onClick={() => setNotification(null)}>
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

export default StudentSuperInstructorClassRoom;
