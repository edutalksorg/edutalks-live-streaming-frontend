import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { FaLock, FaClock, FaExclamationCircle } from 'react-icons/fa';

const JoinClassHandler: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useContext(AuthContext)!;
    const [status, setStatus] = useState<'loading' | 'error' | 'ended' | 'scheduled'>('loading');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            // Not logged in -> Redirect to login with return path
            navigate(`/login?redirect=/join/class/${classId}`);
            return;
        }

        // User is logged in, check class status
        const checkClassStatus = async () => {
            try {
                // 1. Try fetching from regular live_classes first
                let classData;
                let isSI = false;

                try {
                    const res = await api.get(`/api/classes/${classId}`);
                    classData = res.data;
                } catch (err: any) {
                    if (err.response?.status === 404) {
                        // 2. If not found, try Super Instructor classes
                        const siRes = await api.get(`/api/super-instructor/classes/${classId}`);
                        classData = siRes.data;
                        isSI = true;
                    } else {
                        throw err;
                    }
                }

                if (classData.status === 'live') {
                    // Redirect to the appropriate classroom
                    if (isSI) {
                        if (user.role === 'super_instructor') {
                            navigate(`/super-instructor/classroom/${classId}`);
                        } else {
                            navigate(`/student/super-instructor-classroom/${classId}`);
                        }
                    } else {
                        if (user.role === 'instructor' || user.role === 'super_instructor') {
                            navigate(`/instructor/live/${classId}`);
                        } else {
                            navigate(`/student/live/${classId}`);
                        }
                    }
                } else if (classData.status === 'completed') {
                    setStatus('ended');
                } else if (classData.status === 'scheduled') {
                    setStatus('scheduled');
                }
            } catch (err: any) {
                console.error("Failed to fetch class details", err);
                setStatus('error');
                setErrorMsg(err.response?.data?.message || 'Class not found or access denied.');
            }
        };

        checkClassStatus();

    }, [classId, user, authLoading, navigate]);

    if (authLoading || status === 'loading') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (status === 'ended') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="premium-card max-w-md w-full p-8 text-center border-red-500/30">
                    <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaLock className="text-red-500 text-3xl" />
                    </div>
                    <h2 className="text-2xl font-black text-accent-white uppercase italic mb-2">Class Ended</h2>
                    <p className="text-accent-gray mb-8">This live session has concluded. Recording may be available in your dashboard later.</p>
                    <button onClick={() => navigate('/student')} className="btn-primary w-full py-4">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (status === 'scheduled') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="premium-card max-w-md w-full p-8 text-center border-accent-blue/30">
                    <div className="bg-accent-blue/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaClock className="text-accent-blue text-3xl" />
                    </div>
                    <h2 className="text-2xl font-black text-accent-white uppercase italic mb-2">Upcoming Class</h2>
                    <p className="text-accent-gray mb-8">This session is scheduled but has not started yet. Please check back at the scheduled time.</p>
                    <button onClick={() => navigate('/student')} className="btn-secondary w-full py-4">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="premium-card max-w-md w-full p-8 text-center border-surface-border">
                <div className="bg-surface-light w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaExclamationCircle className="text-accent-gray text-3xl" />
                </div>
                <h2 className="text-xl font-black text-accent-white uppercase italic mb-2">Unable to Join</h2>
                <p className="text-accent-gray mb-8">{errorMsg}</p>
                <button onClick={() => navigate('/student')} className="btn-ghost w-full py-4">
                    Go Home
                </button>
            </div>
        </div>
    );
};

export default JoinClassHandler;
