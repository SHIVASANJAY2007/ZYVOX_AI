import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { signup, login, checkEmail } from '../services/auth';
import { SIGNUP_ENABLED } from '../config';

const SignUp = () => {
    const navigate = useNavigate();
    const [isLoginMode, setIsLoginMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('zyvox_user');
        if (storedUser) {
            navigate('/get-plan');
            return;
        }

        if (!SIGNUP_ENABLED) {
            navigate('/get-plan');
        }
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        setError('');
        setSuccess('');

        // Common validations
        if (!formData.email || !formData.password) {
            setError('Please fill in all required fields.');
            return;
        }

        if (!validateEmail(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setIsLoading(true);

        try {
            if (isLoginMode) {
                // LOGIN FLOW
                const result = await login({
                    email: formData.email,
                    password: formData.password
                });

                if (result.success && result.user) {
                    setSuccess('Login successful! Redirecting...');
                    localStorage.setItem('zyvox_user', JSON.stringify({
                        personNo: result.user.personNo || result.user['Person No'],
                        name: result.user.name || result.user['Name'],
                        phone: result.user.phone || result.user['Phone'],
                        email: result.user.email || result.user['Email']
                    }));
                    
                    setTimeout(() => {
                        navigate('/get-plan');
                    }, 1000);
                } else {
                    setError(result.message || 'Invalid email or password.');
                }
            } else {
                // SIGNUP FLOW
                if (!formData.name || !formData.phone || !formData.confirmPassword) {
                    setError('Please fill in all fields.');
                    setIsLoading(false);
                    return;
                }

                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match.');
                    setIsLoading(false);
                    return;
                }

                // Check for duplicate email first
                const emailCheck = await checkEmail(formData.email);
                if (emailCheck.success && emailCheck.exists) {
                    setError('An account with this email already exists.');
                    setIsLoading(false);
                    return;
                }

                const result = await signup({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    password: formData.password
                });

                if (result.success) {
                    setSuccess('Registration successful! You can now log in.');
                    setTimeout(() => {
                        setIsLoginMode(true);
                        setSuccess('Please log in with your credentials.');
                        setFormData(prev => ({
                            ...prev,
                            password: '',
                            confirmPassword: ''
                        }));
                    }, 2000);
                } else {
                    setError(result.message || 'Registration failed. Please try again.');
                }
            }
        } catch (err) {
            console.error('Authentication Error:', err);
            setError(err.message || 'A network error occurred. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!SIGNUP_ENABLED) {
        return (
            <div className="flex min-h-screen w-full bg-[#050505] items-center justify-center p-4">
                <div className="flex w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
                    <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#ff6d38]/10 rounded-full blur-[100px] pointer-events-none" />
                    
                    {/* Left Side - Image */}
                    <div className="hidden md:flex w-1/2 p-4 items-center justify-center z-10">
                        <div className="relative w-full h-[600px] rounded-[40px] overflow-hidden bg-black border border-white/10 flex items-center justify-center">
                            <div className="absolute w-48 h-48 bg-[#ff6d38]/10 rounded-full blur-[60px]" />
                            <img
                                src="/assets/logo/logo.png"
                                alt="Zyvox AI"
                                className="w-3/4 h-auto object-contain z-10"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none"></div>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12 text-center md:text-left z-10">
                        <div className="mb-10">
                            <h1 className="text-6xl font-black text-white leading-[0.9] tracking-tighter mb-4 uppercase">
                                Sign Up is<br />Closed
                            </h1>
                            <p className="text-lg font-bold text-neutral-400">
                                Signups are temporarily disabled. We are preparing for our next launch phase.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[#ff6d38]/10 border-2 border-[#ff6d38]/20 text-[#ff6d38] px-6 py-4 rounded-2xl font-bold text-center text-sm uppercase tracking-wider">
                                New user registration is currently paused. Please check back later!
                            </div>
                            <button
                                onClick={() => navigate('/')}
                                className="w-full bg-white text-black font-bold text-xs uppercase tracking-widest py-4.5 rounded-full border-2 border-white flex items-center justify-center gap-3 active:scale-95 hover:bg-neutral-200 transition-all shadow-lg"
                            >
                                Go Back to Home
                            </button>
                        </div>

                        <p className="text-[10px] text-neutral-500 mt-10 text-center font-medium leading-relaxed uppercase tracking-wider">
                            For support or inquiries, please contact our community channel.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full bg-[#050505] items-center justify-center p-4 overflow-y-auto relative">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ff6d38]/5 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="flex w-full max-w-5xl bg-[#0a0a0a] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative z-10">
                {/* Left Side - Image */}
                <div className="hidden md:flex w-1/2 p-6 items-center justify-center">
                    <div className="relative w-full h-[580px] rounded-[32px] overflow-hidden bg-black border border-white/10 flex items-center justify-center">
                        <div className="absolute w-56 h-56 bg-[#ff6d38]/10 rounded-full blur-[70px] pointer-events-none" />
                        <img
                            src="/assets/logo/logo.png"
                            alt="Zyvox AI"
                            className="w-2/3 h-auto object-contain z-10"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none"></div>
                    </div>
                </div>

                {/* Right Side - Content */}
                <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12 text-center md:text-left">
                    <div className="mb-8">
                        <h1 className="text-5xl font-black text-white leading-[0.9] tracking-tighter mb-3 uppercase">
                            {isLoginMode ? <>Log In to<br />Zyvox AI</> : <>Sign Up to<br />Zyvox AI</>}
                        </h1>
                        <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
                            {isLoginMode ? 'Welcome back, explorer.' : 'Join the community of explorers.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-red-500/10 border-2 border-red-500/20 text-red-400 px-4 py-3 rounded-2xl font-bold text-[11px] text-center uppercase tracking-wider"
                                >
                                    {error}
                                </motion.div>
                            )}
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-green-500/10 border-2 border-green-500/20 text-green-400 px-4 py-3 rounded-2xl font-bold text-[11px] text-center uppercase tracking-wider"
                                >
                                    {success}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-3">
                            <AnimatePresence initial={false}>
                                {!isLoginMode && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-3 overflow-hidden"
                                    >
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="FULL NAME"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className="w-full bg-white/5 border-2 border-white/5 focus:border-[#ff6d38] focus:bg-white/10 text-white rounded-2xl px-6 py-4 font-bold text-xs uppercase tracking-wider outline-none transition-all placeholder:text-neutral-500"
                                            required={!isLoginMode}
                                        />
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="PHONE NUMBER"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className="w-full bg-white/5 border-2 border-white/5 focus:border-[#ff6d38] focus:bg-white/10 text-white rounded-2xl px-6 py-4 font-bold text-xs uppercase tracking-wider outline-none transition-all placeholder:text-neutral-500"
                                            required={!isLoginMode}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <input
                                type="email"
                                name="email"
                                placeholder="EMAIL ADDRESS"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full bg-white/5 border-2 border-white/5 focus:border-[#ff6d38] focus:bg-white/10 text-white rounded-2xl px-6 py-4 font-bold text-xs uppercase tracking-wider outline-none transition-all placeholder:text-neutral-500"
                                required
                            />
                            
                            <div className="relative w-full">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="PASSWORD"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="w-full bg-white/5 border-2 border-white/5 focus:border-[#ff6d38] focus:bg-white/10 text-white rounded-2xl px-6 py-4 pr-12 font-bold text-xs uppercase tracking-wider outline-none transition-all placeholder:text-neutral-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center p-1"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            <AnimatePresence initial={false}>
                                {!isLoginMode && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="relative w-full">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                placeholder="CONFIRM PASSWORD"
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                disabled={isLoading}
                                                className="w-full bg-white/5 border-2 border-white/5 focus:border-[#ff6d38] focus:bg-white/10 text-white rounded-2xl px-6 py-4 pr-12 font-bold text-xs uppercase tracking-wider outline-none transition-all placeholder:text-neutral-500"
                                                required={!isLoginMode}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center p-1"
                                            >
                                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-[#ff6d38] text-black font-black text-xs uppercase tracking-widest py-4.5 rounded-full border-2 border-[#ff6d38] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-[#ff6d38]/15 hover:bg-transparent hover:text-[#ff6d38] ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isLoading ? 'Processing...' : isLoginMode ? 'Log In' : 'Sign Up'}
                        </button>

                        <div className="text-center mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLoginMode(!isLoginMode);
                                    setError('');
                                    setSuccess('');
                                }}
                                disabled={isLoading}
                                className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-[#ff6d38] transition-colors bg-transparent border-none cursor-pointer"
                            >
                                {isLoginMode ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
                            </button>
                        </div>
                    </form>

                    <p className="text-[10px] text-neutral-600 mt-10 text-center font-medium leading-relaxed uppercase tracking-wider">
                        By connecting to Zyvox AI you agree to our <span className="text-neutral-400 font-bold">Terms of use</span> and <span className="text-neutral-400 font-bold">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
