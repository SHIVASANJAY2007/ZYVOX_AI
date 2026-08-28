import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, User, Bot, Phone, Video, MoreVertical, Paperclip, Smile, ExternalLink, Shield, Zap, Globe, Clock, CreditCard, CheckCircle2, ArrowLeft, Download } from 'lucide-react';
import AnimatedIconBackground from './AnimatedIconBackground';
import { N8N_WEBHOOK_URL, SIGNUP_ENABLED, WHATSAPP_API_URL, TELEGRAM_API_URL, BACKEND_API_URL } from '../config';
import ResponseRenderer from './ResponseRenderer';
import { downloadSingleReplyPDF, downloadFullChatPDF } from '../utils/pdfGenerator';

const WhatsAppIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const TelegramIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
        <path d="M21.9 4.1L2.1 11.7c-.8.3-.8.8-.2 1l5.1 1.6 11.8-7.4c.6-.4 1.1-.2.6.2L9.9 14.8l-.4 3.7c.4 0 .5-.2.7-.3l1.8-1.7 3.7 2.7c.7.4 1.2.2 1.4-.6l2.4-11.4c.2-.9-.3-1.3-1-1z" />
    </svg>
);

const isTravelPlan = (text) => {
    if (!text || typeof text !== 'string') return false;
    const lower = text.toLowerCase();

    return lower.includes('rough plan') || lower.includes('final plan');
};

const ChatMessage = ({ text, sender, isBot, time, type, data, userName, messages, responseType }) => {
    const handleDownloadPDF = () => {
        let pdfText = text || '';
        if (type === 'plan' && data) {
            pdfText = `### ${data.title}\n- **Duration**: ${data.duration}\n- **Estimated Cost**: ${data.cost}\n\nLuxury Stays & VIP Transfers Included.`;
        } else if (type === 'whatsapp') {
            pdfText = `Excellent choice. I've synced your final itinerary to our Operations Console. Ready for WhatsApp member rates booking flow.`;
        }
        downloadSingleReplyPDF(pdfText, userName, messages);
    };

    // Fallback handling: If responseType is missing or unrecognized, treat as "question"
    const normalizedResponseType = (responseType === 'plan_rough' || responseType === 'plan_final' || responseType === 'question')
        ? responseType
        : 'question';

    const isPlanRough = isBot && normalizedResponseType === 'plan_rough';
    const isPlanFinal = isBot && (normalizedResponseType === 'plan_final' || type === 'plan');
    const isPlan = isPlanRough || isPlanFinal;

    return (
        <motion.div
            initial={isPlan ? { opacity: 0, y: 30, scale: 0.96 } : { opacity: 0, scale: 0.95, y: 10 }}
            animate={isPlan ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, scale: 1, y: 0 }}
            transition={isPlan ? { type: "spring", stiffness: 90, damping: 14 } : { duration: 0.2 }}
            className={`flex w-full mb-4 relative z-10 ${isBot ? 'justify-start' : 'justify-end'}`}
        >
            <div className={`max-w-[85%] relative ${isBot
                    ? isPlanFinal
                        ? 'bg-gradient-to-br from-white via-[#fffaf7] to-[#fff6f0] border-2 border-[#ff6d38]/30 shadow-xl shadow-[#ff6d38]/5 rounded-2xl rounded-tl-none'
                        : isPlanRough
                            ? 'bg-gradient-to-br from-white via-neutral-50/50 to-[#fffbf7]/30 border border-neutral-300 shadow-md shadow-neutral-100/50 rounded-2xl rounded-tl-none'
                            : 'bg-white text-neutral-900 rounded-2xl rounded-tl-none border border-neutral-200/80 shadow-xs'
                    : 'bg-[#fff6f2] border border-[#ff6d38]/20 text-neutral-900 rounded-2xl rounded-tr-none shadow-xs'
                } p-4 shadow-md`}
            >
                {isPlanFinal && (
                    <div className="absolute -top-3 right-4 bg-gradient-to-r from-[#ff6d38] to-[#ff8557] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md animate-pulse">
                        ✨ Final Plan
                    </div>
                )}
                {isPlanRough && (
                    <div className="absolute -top-3 right-4 bg-gradient-to-r from-neutral-600 to-neutral-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
                        📋 Rough Plan
                    </div>
                )}
                {type === 'plan' ? (
                    <div className="space-y-4 min-w-[280px]">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={16} className="text-[#ff6d38]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#ff6d38]">Plan Generated</span>
                        </div>
                        <h3 className="font-black text-xl uppercase leading-none text-neutral-900">{data.title}</h3>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                                <p className="text-[8px] font-bold text-neutral-500 uppercase">Duration</p>
                                <p className="text-xs font-black uppercase text-neutral-900">{data.duration}</p>
                            </div>
                            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                                <p className="text-[8px] font-bold text-neutral-500 uppercase">Est. Cost</p>
                                <p className="text-xs font-black uppercase text-neutral-900">{data.cost}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-600">
                            <CheckCircle2 size={12} className="text-[#ff6d38]" />
                            Luxury Stays & VIP Transfers Included
                        </div>
                    </div>
                ) : type === 'whatsapp' ? (
                    <div className="space-y-4 py-2">
                        <p className="text-sm font-medium leading-relaxed italic text-neutral-800">
                            "Excellent choice. I've synced your final itinerary to our Operations Console."
                        </p>
                        <div className="bg-[#25D366]/5 p-4 rounded-2xl border border-[#25D366]/25">
                            <h4 className="font-black text-xs uppercase tracking-widest text-[#1ea74c] mb-2">Ready for Booking</h4>
                            <p className="text-[11px] font-bold text-neutral-600 mb-4">You need to finalize this on WhatsApp to unlock exclusive member rates.</p>
                            <a
                                href={WHATSAPP_API_URL}
                                target="_blank"
                                className="w-full bg-[#25D366] text-black py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#25D366]/20"
                            >
                                <Phone size={14} fill="black" />
                                Initiate Booking Flow
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        <ResponseRenderer text={text} isBot={isBot} />
                    </div>
                )}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100/50 text-neutral-500">
                    <span className="text-[9px] font-bold opacity-60">
                        {time}
                    </span>
                    {isBot && isPlanFinal && (
                        <button
                            type="button"
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-1.5 text-[11px] font-black text-white bg-[#ff6d38] hover:bg-[#e0531b] uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm shadow-[#ff6d38]/20"
                            title="Download this response as PDF"
                        >
                            <Download size={13} className="stroke-[2.5]" />
                            <span>Download PDF</span>
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const GetPlan = () => {
    const [user, setUser] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isPlanCreated, setIsPlanCreated] = useState(false);
    const chatEndRef = useRef(null);
    const [chatStatus, setChatStatus] = useState('checking');
    const [activePlatform, setActivePlatform] = useState('whatsapp');

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch(`${BACKEND_API_URL}/api/chat/status`);
                if (res.ok) {
                    const data = await res.json();
                    setChatStatus(data.online ? 'online' : 'offline');
                } else {
                    setChatStatus('offline');
                }
            } catch (err) {
                setChatStatus('offline');
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('zyvox_user');
        if (!storedUser) {
            if (!SIGNUP_ENABLED) {
                const guestUser = {
                    name: 'Guest Explorer',
                    email: 'guest@zyvox.ai',
                    picture: null,
                    action: 'Guest'
                };
                setUser(guestUser);
                setIsLoaded(true);
                setMessages([
                    {
                        text: `Welcome to ZYVOX AI, Guest Explorer! 🌍\n\nHow can I assist you today?`,
                        isBot: true,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]);
                return;
            }
            navigate('/signup');
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsLoaded(true);

            // Set personalized welcome message
            const firstName = parsedUser.name ? parsedUser.name.split(' ')[0] : 'Explorer';
            setMessages([
                {
                    text: `Welcome to ZYVOX AI, ${firstName}! 🌍\n\nHow can I assist you today?`,
                    isBot: true,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        } catch (e) {
            console.error('Error parsing user session:', e);
            if (!SIGNUP_ENABLED) {
                const guestUser = {
                    name: 'Guest Explorer',
                    email: 'guest@zyvox.ai',
                    picture: null,
                    action: 'Guest'
                };
                setUser(guestUser);
                setIsLoaded(true);
                setMessages([
                    {
                        text: `Welcome to ZYVOX AI, Guest Explorer! 🌍\n\nHow can I assist you today?`,
                        isBot: true,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                ]);
            } else {
                navigate('/signup');
            }
        }
    }, [navigate]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!isLoaded) return (
        <div className="h-screen w-full flex items-center justify-center bg-[#050505] text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-[#ff6d38] rounded-full animate-spin"></div>
                <p className="font-black uppercase tracking-widest text-xs">Synchronizing Neural Links...</p>
            </div>
        </div>
    );

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg = inputValue.trim();
        setMessages(prev => [...prev, { text: userMsg, isBot: false, time: now }]);
        setInputValue('');

        try {
            const sessionId =
                localStorage.getItem("sessionId") || crypto.randomUUID();

            localStorage.setItem("sessionId", sessionId);

            const response = await fetch(
                `${BACKEND_API_URL}/api/chat/send`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        personId: user?.personNo || user?.['Person No'] || "",
                        sessionId: sessionId,
                        message: userMsg
                    })
                }
            );

            if (!response.ok) {
                const errText = await response.text();
                let errMsg = "Error connecting to AI Assistant. Contact 7373382999 (Admin) for more Details.";
                try {
                    const errJson = JSON.parse(errText);
                    errMsg = errJson.message || errMsg;
                } catch (_) { }
                throw new Error(errMsg);
            }

            const data = await response.json();
            let botText = data.output || "⚠️ Received empty output from the assistant.";

            if (!botText.trim()) {
                botText = "⚠️ Received an empty response from the n8n webhook. Make sure your n8n Webhook node is set to 'Respond: When Last Node Finishes' or uses a 'Respond to Webhook' node.";
            }

            setMessages(prev => [...prev, {
                text: botText,
                isBot: true,
                responseType: data.responseType || "question",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch (error) {
            console.error('Webhook error:', error);
            setMessages(prev => [...prev, {
                text: "Error connecting to AI Assistant. Contact 7373382999 (Admin) for more Details.",
                isBot: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    };

    const triggerPlan = (time) => {
        setMessages(prev => [...prev,
        {
            type: 'plan',
            data: {
                title: "The Zenith Odyssey",
                duration: "12 Days / 11 Nights",
                cost: "$12,400 per person"
            },
            isBot: true,
            time: time
        }
        ]);

        setTimeout(() => {
            setMessages(prev => [...prev, {
                type: 'whatsapp',
                isBot: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1500);

        setIsPlanCreated(true);
    };

    return (
        <div className="flex h-screen bg-neutral-100 text-neutral-900 overflow-hidden relative">
            {/* Subtle background glow blobs */}
            <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#ff6d38]/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Left Side - AI Chatbot */}
            <div className="w-full lg:w-[60%] flex flex-col bg-white border-r border-neutral-200 relative z-10">
                {/* Header */}
                <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-all flex items-center justify-center text-neutral-600 hover:text-neutral-900 cursor-pointer mr-2 active:scale-95"
                            title="Back to Landing Page"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div className="w-12 h-12 bg-[#ff6d38] rounded-2xl flex items-center justify-center border-2 border-[#ff6d38]">
                            <Bot size={24} className="text-black" />
                        </div>
                        <div>
                            <h2 className="font-black text-xl uppercase tracking-tighter text-neutral-900">Zyvox AI Agent</h2>
                            {chatStatus === 'online' && (
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.7)]"></span>
                                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Agent Online</span>
                                </div>
                            )}
                            {chatStatus === 'offline' && (
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping shadow-[0_0_10px_rgba(239,68,68,0.7)]"></span>
                                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Agent Offline</span>
                                </div>
                            )}
                            {chatStatus === 'checking' && (
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.7)]"></span>
                                    <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Connecting...</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {messages.length > 0 && (
                            <button
                                type="button"
                                onClick={() => downloadFullChatPDF(messages, user?.name || 'Explorer')}
                                className="flex items-center gap-2 bg-[#ff6d38]/10 hover:bg-[#ff6d38]/20 border border-[#ff6d38]/30 px-3 py-2 rounded-xl text-[10px] font-black text-[#ff6d38] uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                                title="Download Full Chat History"
                            >
                                <Download size={13} />
                                <span className="hidden sm:inline">Download Chat</span>
                            </button>
                        )}

                        {user && (
                            <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-2xl">
                                {user.picture ? (
                                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-neutral-200 object-cover" />
                                ) : (
                                    <div className="w-8 h-8 bg-[#ff6d38] text-black rounded-full flex items-center justify-center font-black text-xs border border-[#ff6d38]">
                                        {user.name ? user.name[0].toUpperCase() : 'U'}
                                    </div>
                                )}
                                <div className="hidden sm:block text-left">
                                    <p className="text-xs font-black uppercase tracking-tight leading-none mb-0.5 text-neutral-900">{user.name}</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            localStorage.removeItem('zyvox_user');
                                            navigate('/signup');
                                        }}
                                        className="text-[9px] font-black text-[#ff6d38] uppercase tracking-wider hover:underline bg-transparent border-none p-0 cursor-pointer"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 relative bg-[#fbfbfb]">
                    <div className="opacity-20 absolute inset-0 pointer-events-none">
                        <AnimatedIconBackground />
                    </div>
                    <div className="absolute inset-0 overflow-y-auto p-8 no-scrollbar">
                        <AnimatePresence>
                            {messages.map((msg, idx) => (
                                <ChatMessage
                                    key={idx}
                                    {...msg}
                                    userName={user?.name || 'Explorer'}
                                    messages={messages}
                                />
                            ))}
                        </AnimatePresence>
                        <div ref={chatEndRef} className="relative z-10" />
                    </div>
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSend} className="p-6 bg-white border-t border-neutral-200 flex gap-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-neutral-50 border border-neutral-200 focus:border-[#ff6d38] focus:bg-white rounded-2xl px-6 py-4 font-bold text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400"
                    />
                    <button
                        type="submit"
                        disabled={isPlanCreated}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isPlanCreated
                                ? 'bg-neutral-200 cursor-not-allowed text-neutral-400'
                                : 'bg-[#ff6d38] text-white hover:scale-105 active:scale-95 shadow-lg shadow-[#ff6d38]/15 hover:bg-[#e0531b]'
                            }`}
                    >
                        <Send size={24} />
                    </button>
                </form>
            </div>

            <div className={`hidden lg:flex flex-col flex-1 items-center justify-center p-12 border-l border-neutral-200 relative transition-colors duration-700 ${
                activePlatform === 'whatsapp' ? 'bg-[#eefcf3]' : 'bg-[#edf6fd]'
            }`}>
                {/* Dynamic Background Glow Blobs */}
                <div
                    className={`absolute top-20 right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${activePlatform === 'whatsapp' ? 'bg-[#25D366]/10' : 'bg-[#0088cc]/10'
                        }`}
                />
                <div
                    className={`absolute bottom-20 left-20 w-48 h-48 rounded-full blur-2xl pointer-events-none transition-colors duration-500 ${activePlatform === 'whatsapp' ? 'bg-[#25D366]/5' : 'bg-[#0088cc]/5'
                        }`}
                />

                {/* Platform Toggle Switcher at the Top */}
                <div className="absolute top-8 flex items-center bg-white/70 border border-neutral-200/50 p-2 rounded-full shadow-lg backdrop-blur-md z-20 gap-3">
                    {/* WhatsApp Option */}
                    <motion.button
                        layout
                        type="button"
                        onClick={() => setActivePlatform('whatsapp')}
                        title="Switch to WhatsApp"
                        className={`flex items-center justify-center gap-3 h-12 rounded-full cursor-pointer transition-all duration-500 relative border overflow-hidden ${
                            activePlatform === 'whatsapp'
                                ? 'bg-[#25D366] border-[#1ebd5b] text-black w-44 shadow-lg shadow-[#25D366]/30'
                                : 'bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 w-12'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 350, damping: 26 }}
                    >
                        <WhatsAppIcon className={`w-5 h-5 flex-shrink-0 transition-colors duration-500 ${activePlatform === 'whatsapp' ? 'text-black' : 'text-[#25D366]'}`} />
                        {activePlatform === 'whatsapp' && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="font-black uppercase text-[10px] tracking-[2px] whitespace-nowrap text-black"
                            >
                                WhatsApp
                            </motion.span>
                        )}
                    </motion.button>

                    {/* Telegram Option */}
                    <motion.button
                        layout
                        type="button"
                        onClick={() => setActivePlatform('telegram')}
                        title="Switch to Telegram"
                        className={`flex items-center justify-center gap-3 h-12 rounded-full cursor-pointer transition-all duration-500 relative border overflow-hidden ${
                            activePlatform === 'telegram'
                                ? 'bg-[#0088cc] border-[#0077b5] text-white w-44 shadow-lg shadow-[#0088cc]/30'
                                : 'bg-[#0088cc]/10 border-[#0088cc]/30 text-[#0088cc] hover:bg-[#0088cc]/20 w-12'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 350, damping: 26 }}
                    >
                        <TelegramIcon className={`w-5 h-5 flex-shrink-0 transition-colors duration-500 ${activePlatform === 'telegram' ? 'text-white' : 'text-[#0088cc]'}`} />
                        {activePlatform === 'telegram' && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="font-black uppercase text-[10px] tracking-[2px] whitespace-nowrap text-white"
                            >
                                Telegram
                            </motion.span>
                        )}
                    </motion.button>
                </div>

                <AnimatePresence mode="wait">
                    {activePlatform === 'whatsapp' ? (
                        <motion.div
                            key="whatsapp"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-md text-center z-10 flex flex-col items-center"
                        >
                            <div className="w-24 h-24 bg-[#25D366] rounded-[35%] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#25D366]/20">
                                <Phone size={48} className="text-black" fill="black" />
                            </div>

                            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-6 text-neutral-900">
                                Take it to <br /> <span className="text-[#25D366]">WhatsApp</span>
                            </h2>

                            <p className="text-sm font-bold text-neutral-600 mb-10 leading-relaxed">
                                Ready to book? Chat with our live agents on WhatsApp for instant confirmation and exclusive mobile-only deals.
                            </p>

                            <a
                                href={WHATSAPP_API_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative inline-flex items-center gap-4 bg-neutral-900 text-white px-10 py-6 rounded-full font-black uppercase tracking-widest text-xs overflow-hidden shadow-[8px_8px_0px_#25D366] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none"
                            >
                                <span>Open WhatsApp Bot</span>
                                <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </a>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="telegram"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-md text-center z-10 flex flex-col items-center"
                        >
                            <div className="w-24 h-24 bg-[#0088cc] rounded-[35%] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#0088cc]/20">
                                <TelegramIcon className="w-12 h-12 text-white" />
                            </div>

                            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-6 text-neutral-900">
                                Take it to <br /> <span className="text-[#0088cc]">Telegram</span>
                            </h2>

                            <p className="text-sm font-bold text-neutral-600 mb-10 leading-relaxed">
                                Ready to book? Chat with our live agents on Telegram for instant confirmation and exclusive mobile-only deals.
                            </p>

                            <a
                                href={TELEGRAM_API_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative inline-flex items-center gap-4 bg-neutral-900 text-white px-10 py-6 rounded-full font-black uppercase tracking-widest text-xs overflow-hidden shadow-[8px_8px_0px_#0088cc] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none"
                            >
                                <span>Open Telegram Bot</span>
                                <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </a>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute bottom-10 text-[10px] font-black uppercase tracking-[0.5em] opacity-35 text-neutral-900 z-10">
                    ZYVOX AI Official Mobile Agent
                </div>
            </div>
        </div>
    );
};

export default GetPlan;
