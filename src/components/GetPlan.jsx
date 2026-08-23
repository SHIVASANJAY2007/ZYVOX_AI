import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, User, Bot, Phone, Video, MoreVertical, Paperclip, Smile, ExternalLink, Shield, Zap, Globe, Clock, CreditCard, CheckCircle2 } from 'lucide-react';
import AnimatedIconBackground from './AnimatedIconBackground';
import { N8N_WEBHOOK_URL, SIGNUP_ENABLED } from '../config';
import ResponseRenderer from './ResponseRenderer';




const ChatMessage = ({ text, sender, isBot, time, type, data }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`flex w-full mb-4 relative z-10 ${isBot ? 'justify-start' : 'justify-end'}`}
        >
            <div className={`max-w-[85%] relative ${isBot ? 'bg-white text-black rounded-2xl rounded-tl-none border border-black/5' : 'bg-black text-white rounded-2xl rounded-tr-none'} p-4 shadow-sm`}>
                {type === 'plan' ? (
                    <div className="space-y-4 min-w-[280px]">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={16} className="text-[#ff6d38]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#ff6d38]">Plan Generated</span>
                        </div>
                        <h3 className="font-black text-xl uppercase leading-none">{data.title}</h3>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="bg-gray-50 p-3 rounded-xl border border-black/5">
                                <p className="text-[8px] font-bold text-gray-400 uppercase">Duration</p>
                                <p className="text-xs font-black uppercase">{data.duration}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-black/5">
                                <p className="text-[8px] font-bold text-gray-400 uppercase">Est. Cost</p>
                                <p className="text-xs font-black uppercase">{data.cost}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                            <CheckCircle2 size={12} className="text-green-500" />
                            Luxury Stays & VIP Transfers Included
                        </div>
                    </div>
                ) : type === 'whatsapp' ? (
                    <div className="space-y-4 py-2">
                        <p className="text-sm font-medium leading-relaxed italic">
                            "Excellent choice. I've synced your final itinerary to our Operations Console."
                        </p>
                        <div className="bg-[#25D366]/10 p-4 rounded-2xl border-2 border-[#25D366]/20">
                            <h4 className="font-black text-xs uppercase tracking-widest text-[#25D366] mb-2">Ready for Booking</h4>
                            <p className="text-[11px] font-bold text-gray-600 mb-4">You need to finalize this on WhatsApp to unlock exclusive member rates.</p>
                            <a
                                href="https://wa.me/15551382180"
                                target="_blank"
                                className="w-full bg-[#25D366] text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-[#25D366]/20"
                            >
                                <Phone size={14} fill="white" />
                                Initiate Booking Flow
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        <ResponseRenderer text={text} isBot={isBot} />
                    </div>
                )}
                <div className="text-[9px] font-bold mt-2 text-gray-400">
                    {time}
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
                        text: `Welcome to Zyvox Concierge, Guest Explorer! 🌍\n\nHow can I assist you today?`,
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
                    text: `Welcome to Zyvox Concierge, ${firstName}! 🌍\n\nHow can I assist you today?`,
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
                        text: `Welcome to Zyvox Concierge, Guest Explorer! 🌍\n\nHow can I assist you today?`,
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
        <div className="h-screen w-full flex items-center justify-center bg-[#FDF8F3]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-black border-t-[#ff6d38] rounded-full animate-spin"></div>
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
                N8N_WEBHOOK_URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chatInput: userMsg,
                        sessionId: sessionId
                    })
                }
            );

            const text = await response.text();

            console.log("Response from n8n:");
            console.log(text);
            
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                data = text;
            }

            // Handle different possible response formats from n8n
            let botText = "";
            if (data && data.output) {
                botText = data.output;
            } else if (data && data.text) {
                botText = data.text;
            } else if (data && data.message) {
                botText = data.message;
            } else if (Array.isArray(data) && data.length > 0) {
                if (data[0].output) botText = data[0].output;
                else if (data[0].text) botText = data[0].text;
                else if (data[0].message) botText = data[0].message;
                else botText = JSON.stringify(data[0]);
            } else if (typeof data === 'string' && data.trim() !== '') {
                botText = data;
            } else if (data !== undefined && data !== null && data !== "") {
                botText = JSON.stringify(data);
            }

            if (!botText.trim()) {
                botText = "⚠️ Received an empty response from the n8n webhook. Make sure your n8n Webhook node is set to 'Respond: When Last Node Finishes' or uses a 'Respond to Webhook' node.";
            }

            setMessages(prev => [...prev, {
                text: botText,
                isBot: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch (error) {
            console.error('Webhook error:', error);
            setMessages(prev => [...prev, {
                text: "Error connecting to AI Assistant.",
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
        <div className="flex h-screen bg-[#FDF8F3] overflow-hidden">
            {/* Left Side - AI Chatbot */}
            <div className="w-full lg:w-[60%] flex flex-col bg-white border-r-2 border-black/5">
                {/* Header */}
                <div className="p-6 border-b border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#ff6d38] rounded-2xl flex items-center justify-center border-2 border-black">
                            <Bot size={24} className="text-black" />
                        </div>
                        <div>
                            <h2 className="font-black text-xl uppercase tracking-tighter text-black">Zyvox AI Agent</h2>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available</span>
                            </div>
                        </div>
                    </div>
                    {user && (
                        <div className="flex items-center gap-3 bg-gray-50 border border-black/5 px-4 py-2 rounded-2xl">
                            {user.picture ? (
                                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-black/10 object-cover" />
                            ) : (
                                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs">
                                    {user.name ? user.name[0] : 'U'}
                                </div>
                            )}
                            <div className="hidden sm:block text-left">
                                <p className="text-xs font-black uppercase tracking-tight leading-none mb-0.5">{user.name}</p>
                                <button 
                                    type="button"
                                    onClick={() => {
                                        localStorage.removeItem('zyvox_user');
                                        navigate('/signup');
                                    }}
                                    className="text-[9px] font-bold text-red-500 uppercase tracking-wider hover:underline bg-transparent border-none p-0 cursor-pointer"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Messages Area */}
                <div className="flex-1 relative bg-[#FDF8F3]">
                    <AnimatedIconBackground />
                    <div className="absolute inset-0 overflow-y-auto p-8 no-scrollbar">
                        <AnimatePresence>
                            {messages.map((msg, idx) => (
                                <ChatMessage key={idx} {...msg} />
                            ))}
                        </AnimatePresence>
                        <div ref={chatEndRef} className="relative z-10" />
                    </div>
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSend} className="p-6 bg-white border-t border-black/5 flex gap-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl px-6 py-4 font-bold text-sm text-black outline-none transition-all placeholder:text-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={isPlanCreated}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isPlanCreated ? 'bg-gray-100 cursor-not-allowed text-gray-300' : 'bg-black text-white hover:scale-105 active:scale-95'}`}
                    >
                        <Send size={24} />
                    </button>
                </form>
            </div>

            {/* Right Side - WhatsApp Redirect */}
            <div className="hidden lg:flex flex-col flex-1 items-center justify-center p-12 bg-[#F8F6E9] relative">
                <div className="absolute top-20 right-20 w-64 h-64 bg-[#ff6d38]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-20 w-48 h-48 bg-black/5 rounded-full blur-2xl" />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-md text-center"
                >
                    <div className="w-24 h-24 bg-[#25D366] rounded-[35%] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#25D366]/20">
                        <Phone size={48} className="text-white" />
                    </div>

                    <h2 className="text-5xl font-black uppercase tracking-tighter leading-none mb-6 text-black">
                        Take it to <br /> <span className="text-[#25D366]">WhatsApp</span>
                    </h2>

                    <p className="text-sm font-bold text-gray-500 mb-10 leading-relaxed">
                        Ready to book? Chat with our live agents on WhatsApp for instant confirmation and exclusive mobile-only deals.
                    </p>

                    <a
                        href="https://wa.me/15551382180"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative inline-flex items-center gap-4 bg-black text-white px-10 py-6 rounded-full font-black uppercase tracking-widest text-xs overflow-hidden shadow-[8px_8px_0px_#25D366] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none"
                    >
                        <span>Open WhatsApp Bot</span>
                        <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </a>

                    <div className="mt-12 flex items-center justify-center gap-8 opacity-20">
                        <div className="flex flex-col items-center">
                            <Video size={20} className="text-black" />
                            <span className="text-[8px] font-black mt-1 uppercase tracking-widest text-black">Video Call</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <MoreVertical size={20} className="text-black" />
                            <span className="text-[8px] font-black mt-1 uppercase tracking-widest text-black">More Tools</span>
                        </div>
                    </div>
                </motion.div>

                <div className="absolute bottom-10 text-[10px] font-black uppercase tracking-[0.5em] opacity-30 text-black">
                    Zyvox Official Mobile Concierge
                </div>
            </div>
        </div>
    );
};

export default GetPlan;
