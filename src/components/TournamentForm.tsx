import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaTimes, FaSave } from 'react-icons/fa';

interface TournamentFormProps {
    tournament?: any;
    onClose: () => void;
    onSuccess: () => void;
}

interface Level {
    id: number;
    name: string;
    category: string;
}

interface Subject {
    id: number;
    name: string;
}

// Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm)
const formatForDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        // Adjust for local timezone to get the correct string
        const pad = (num: number) => num.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
        return '';
    }
};

const TournamentForm: React.FC<TournamentFormProps> = ({ tournament, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [levels, setLevels] = useState<Level[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        name: tournament?.name || '',
        description: tournament?.description || '',
        level_id: tournament?.level_id || '',
        subject_id: tournament?.subject_id || '',
        registration_start: formatForDateTimeLocal(tournament?.registration_start),
        registration_end: formatForDateTimeLocal(tournament?.registration_end),
        exam_start: formatForDateTimeLocal(tournament?.exam_start),
        exam_end: formatForDateTimeLocal(tournament?.exam_end),
        duration: tournament?.duration || 60,
        total_questions: tournament?.total_questions || 10,
        total_marks: tournament?.total_marks || 100,
        max_participants: tournament?.max_participants || '',
        is_free: tournament?.is_free !== undefined ? tournament.is_free : true,
        prize: tournament?.prize || '',
        grade: tournament?.grade || '',
        tab_switch_limit: tournament?.tab_switch_limit || 3,
        questions: tournament?.questions ? (typeof tournament.questions === 'string' ? JSON.parse(tournament.questions) : tournament.questions) : []
    });

    const [currentQuestion, setCurrentQuestion] = useState({
        id: '',
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        marks: 0
    });

    useEffect(() => {
        fetchLevels();
        fetchSubjects();
    }, []);

    const fetchLevels = async () => {
        try {
            const res = await api.get('/api/tournaments/levels/all');
            setLevels(res.data);
        } catch (err) {
            console.error('Error fetching levels:', err);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/api/subjects');
            setSubjects(res.data);
        } catch (err) {
            console.error('Error fetching subjects:', err);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addQuestion = () => {
        if (!currentQuestion.question || currentQuestion.options.some(opt => !opt)) {
            alert('Please fill all question fields');
            return;
        }

        const newQuestion = {
            ...currentQuestion,
            id: `q_${Date.now()}`,
            marks: currentQuestion.marks || Math.floor(formData.total_marks / formData.total_questions)
        };

        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }));

        setCurrentQuestion({
            id: '',
            question: '',
            options: ['', '', '', ''],
            correct_answer: 0,
            marks: 0
        });
    };

    const removeQuestion = (index: number) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter((_: any, i: number) => i !== index)
        }));
    };

    const validateForm = (): boolean => {
        // Step 1 validation
        if (step === 1) {
            if (!formData.name || !formData.description || !formData.level_id || !formData.grade) {
                alert('Please fill all required fields in Step 1');
                return false;
            }
        }

        // Step 2 validation
        if (step === 2) {
            const regStart = new Date(formData.registration_start);
            const regEnd = new Date(formData.registration_end);
            const examStart = new Date(formData.exam_start);
            const examEnd = new Date(formData.exam_end);

            if (regStart >= regEnd || regEnd >= examStart || examStart >= examEnd) {
                alert('Invalid date sequence. Check: registration_start < registration_end < exam_start < exam_end');
                return false;
            }

            if (formData.duration < 10 || formData.duration > 240) {
                alert('Duration must be between 10 and 240 minutes');
                return false;
            }
        }

        // Step 3 validation
        if (step === 3) {
            if (formData.questions.length !== formData.total_questions) {
                alert(`Please add exactly ${formData.total_questions} questions`);
                return false;
            }
        }

        return true;
    };

    const handleNext = () => {
        if (validateForm()) {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            if (tournament) {
                await api.put(`/api/tournaments/${tournament.id}`, formData);
                alert('Tournament updated successfully!');
            } else {
                await api.post('/api/tournaments', formData);
                alert('Tournament created successfully!');
            }
            onSuccess();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save tournament');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-surface-dark rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-t-lg flex justify-between items-center">
                    <h2 className="text-2xl font-bold">
                        {tournament ? 'Edit Tournament' : 'Create New Tournament'}
                    </h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition">
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    {['Basic Details', 'Schedule & Config', 'Questions', 'Review'].map((label, index) => (
                        <div key={index} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step > index + 1 ? 'bg-green-500 text-white' :
                                step === index + 1 ? 'bg-yellow-500 text-white' :
                                    'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                                }`}>
                                {step > index + 1 ? '✓' : index + 1}
                            </div>
                            <span className={`ml-2 text-sm font-semibold ${step >= index + 1 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                {label}
                            </span>
                            {index < 3 && <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 mx-2"></div>}
                        </div>
                    ))}
                </div>

                {/* Form Content */}
                <div className="p-6">
                    {/* Step 1: Basic Details */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                    Tournament Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                    placeholder="e.g., Weekly NEET Mock Test"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                    rows={4}
                                    placeholder="Describe the tournament..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        Tournament Level *
                                    </label>
                                    <select
                                        value={formData.level_id}
                                        onChange={(e) => handleInputChange('level_id', e.target.value)}
                                        className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select Level</option>
                                        {levels.map(level => (
                                            <option key={level.id} value={level.id}>
                                                {level.name} ({level.category})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        Class / Grade *
                                    </label>
                                    <select
                                        value={formData.grade}
                                        onChange={(e) => handleInputChange('grade', e.target.value)}
                                        className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select Class</option>
                                        <option value="6th">6th Class</option>
                                        <option value="7th">7th Class</option>
                                        <option value="8th">8th Class</option>
                                        <option value="9th">9th Class</option>
                                        <option value="10th">10th Class</option>
                                        <option value="11th">11th Class</option>
                                        <option value="12th">12th Class</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        Subject (Optional)
                                    </label>
                                    <select
                                        value={formData.subject_id}
                                        onChange={(e) => handleInputChange('subject_id', e.target.value)}
                                        className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">All Subjects</option>
                                        {subjects.map(subject => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        Prize (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.prize}
                                        onChange={(e) => handleInputChange('prize', e.target.value)}
                                        className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                        placeholder="e.g., ₹5000 Cash Prize"
                                    />
                                </div>

                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_free}
                                            onChange={(e) => handleInputChange('is_free', e.target.checked)}
                                            className="w-5 h-5"
                                        />
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Free Entry</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Schedule & Configuration */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        Registration Start *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.registration_start}
                                        onChange={(e) => handleInputChange('registration_start', e.target.value)}
                                        className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        Registration End *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.registration_end}
                                        onChange={(e) => handleInputChange('registration_end', e.target.value)}
                                        className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        Exam Start *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.exam_start}
                                        onChange={(e) => handleInputChange('exam_start', e.target.value)}
                                        className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        Exam End *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={formData.exam_end}
                                        onChange={(e) => handleInputChange('exam_end', e.target.value)}
                                        className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        Duration (minutes) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                                        className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                        min="10"
                                        max="240"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        Total Questions *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.total_questions}
                                        onChange={(e) => handleInputChange('total_questions', parseInt(e.target.value))}
                                        className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                        min="1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        Total Marks *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.total_marks}
                                        onChange={(e) => handleInputChange('total_marks', parseInt(e.target.value))}
                                        className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        Max Participants
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.max_participants}
                                        onChange={(e) => handleInputChange('max_participants', e.target.value ? parseInt(e.target.value) : '')}
                                        className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                        placeholder="Unlimited"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                        Tab Switch Limit
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.tab_switch_limit}
                                        onChange={(e) => handleInputChange('tab_switch_limit', parseInt(e.target.value))}
                                        className="w-full border dark:border-gray-600 rounded-lg p-3 dark:bg-gray-700 dark:text-white"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Questions - Simplified for length */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Add {formData.total_questions} questions. Current: {formData.questions.length}
                            </p>

                            {/* Question Builder */}
                            <div className="border dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Add Question</h3>
                                <input
                                    type="text"
                                    value={currentQuestion.question}
                                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                                    className="w-full border dark:border-gray-600 rounded-lg p-3 mb-3 dark:bg-gray-700 dark:text-white"
                                    placeholder="Question text..."
                                />

                                {currentQuestion.options.map((opt, index) => (
                                    <div key={index} className="flex items-center gap-2 mb-2">
                                        <input
                                            type="radio"
                                            name="correct"
                                            checked={currentQuestion.correct_answer === index}
                                            onChange={() => setCurrentQuestion(prev => ({ ...prev, correct_answer: index }))}
                                        />
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={(e) => {
                                                const newOptions = [...currentQuestion.options];
                                                newOptions[index] = e.target.value;
                                                setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                                            }}
                                            className="flex-1 border dark:border-gray-600 rounded-lg p-2 dark:bg-gray-700 dark:text-white"
                                            placeholder={`Option ${index + 1}`}
                                        />
                                    </div>
                                ))}

                                <button
                                    onClick={addQuestion}
                                    className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition mt-3"
                                >
                                    Add Question
                                </button>
                            </div>

                            {/* Questions List */}
                            <div className="space-y-2">
                                {formData.questions.map((q: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center border dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-surface-dark">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{index + 1}. {q.question}</span>
                                        <button
                                            onClick={() => removeQuestion(index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="space-y-4">
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                                <h3 className="font-bold text-green-800 dark:text-green-300 mb-2">Ready to Create!</h3>
                                <p className="text-sm text-green-700 dark:text-green-400">
                                    Review your tournament details and click "Create Tournament" to publish.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400">Tournament Name</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{formData.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400">Level</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {levels.find(l => l.id === parseInt(formData.level_id))?.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400">Duration</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{formData.duration} minutes</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400">Questions</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{formData.questions.length} / {formData.total_marks} marks</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-gray-100 dark:bg-gray-800 p-6 rounded-b-lg flex justify-between">
                    <button
                        onClick={step > 1 ? handleBack : onClose}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        {step > 1 ? 'Back' : 'Cancel'}
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition"
                        >
                            <FaSave /> {tournament ? 'Update Tournament' : 'Create Tournament'}
                        </button>
                    )}
                </div>
            </div>
        </div >
    );
};

export default TournamentForm;
