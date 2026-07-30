import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSignIn, useUser } from '@clerk/clerk-react';
import { Send, User, Bot, Phone, Video, MoreVertical, Paperclip, Smile, ExternalLink, Shield, Zap, Globe, Clock, CreditCard, CheckCircle2 } from 'lucide-react';

// Structured Menu Structure for the Agent
const MENU_STRUCTURE = {
    main: {
        text: "How can I assist you today? Please select an option by typing the number:\n\n1) 🌎 Explore Destinations\n2) 📋 Travel Logistics & FAQs\n3) 💎 Exclusive Membership\n4) 🛡️ Safety & Insurance\n5) ⚡ Generate My Plan",
        options: {
            "1": "destinations",
            "2": "logistics",
            "3": "membership",
            "4": "safety",
            "5": "generate"
        }
    },
    destinations: {
        text: "Where are we heading? Pick a region:\n\n1) 🗼 Europe (Paris, London, Santorini)\n2) 🍣 Asia (Tokyo, Bali)\n3) 🏙️ Americas (New York)\n4) 🏝️ Tropical (Maldives)\n5) 🐪 Middle East (Dubai)\n0) ⬅️ Back to Main Menu",
        options: {
            "1": "europe",
            "2": "asia",
            "3": "americas",
            "4": "tropical",
            "5": "dubai",
            "0": "main"
        }
    },
    europe: {
        text: "European Gems:\n\n1) Paris (The City of Light)\n2) London (Modern Majesty)\n3) Santorini (Caldera Views)\n4) Switzerland (Alpine Luxury)\n0) ⬅️ Back",
        options: {
            "1": "paris",
            "2": "london",
            "3": "santorini",
            "4": "switzerland",
            "0": "destinations"
        }
    },
    asia: {
        text: "Asian Icons:\n\n1) Tokyo (Contrast & Culture)\n2) Bali (Spiritual Retreat)\n0) ⬅️ Back",
        options: {
            "1": "tokyo",
            "2": "bali",
            "0": "destinations"
        }
    },
    logistics: {
        text: "Logistics Support:\n\n1) 🎫 Visa Consultation\n2) ✈️ Flight Tracking\n3) 🏨 Hotel Partnerships\n4) 💳 Payments & Refunds\n0) ⬅️ Back to Main Menu",
        options: {
            "1": "visa",
            "2": "flights",
            "3": "hotel",
            "4": "payment",
            "0": "main"
        }
    },
    membership: {
        text: "Zyvox Elite Membership:\n\n1) 🌟 Perks & Upgrades\n2) 🤝 Human Concierge Access\n3) 🔒 Privacy Standards\n0) ⬅️ Back to Main Menu",
        options: {
            "1": "perks",
            "2": "concierge",
            "3": "privacy",
            "0": "main"
        }
    },
    safety: {
        text: "Safety & Security:\n\n1) 🚑 Emergency Support\n2) 🌍 Travel Advisories\n3) 📜 Insurance Coverage\n0) ⬅️ Back to Main Menu",
        options: {
            "1": "emergency",
            "2": "advisory",
            "3": "insurance",
            "0": "main"
        }
    }
};

// Response content for leaf nodes
const RESPONSES = {
    paris: "Paris! The City of Light. I recommend a stay in Le Marais for the best local vibe, or the 1er Arrondissement for classic luxury near the Louvre. (Type '5' to start your plan)",
    london: "A classic! Mayfair is ideal for luxury, or Shoreditch for a modern, creative edge. Shall I secure your table at The Shard? (Type '5' to start your plan)",
    tokyo: "Tokyo is a masterpiece of contrast. From the neon lights of Shinjuku to the serenity of Meiji Shrine. (Type '5' to start your plan)",
    bali: "Bali is perfect right now. Ubud offers the best spiritual retreat, while Uluwatu has world-class cliffside villas. (Type '5' to start your plan)",
    santorini: "The sunsets in Oia are unmatched. I recommend a boutique cave hotel with a private caldera view. (Type '5' to start your plan)",
    switzerland: "Whether it's Zermatt for skiing or Lucerne for lakeside luxury, I can arrange your Swiss Travel Pass. (Type '5' to start your plan)",
    americas: "The Americas! From the lights of NYC to the beaches of Rio. Stay in Central Park South for the icons. (Type '5' to start your plan)",
    tropical: "Ultimate seclusion. I have exclusive rates for overwater villas in the Noonu Atoll. (Type '5' to start your plan)",
    dubai: "Dubai is about grandeur. I suggest the Burj Al Arab or a private desert safari. (Type '5' to start your plan)",
    visa: "I handle visa consultations for all major destinations. For many countries, I can expedite E-Visas directly.",
    flights: "I track real-time price drops in First and Business class. I can also arrange private jet charters.",
    hotel: "I only partner with 5-star and boutique properties. My users get automatic upgrades.",
    payment: "We support all major cards, crypto, and 'Book Now, Pay Later' options.",
    perks: "Zyvox members get automatic room upgrades, late checkouts, and airport lounge access globally.",
    concierge: "Our human concierge team is available 24/7 for complex requests that require a personal touch.",
    privacy: "Your data is encrypted and never sold. We prioritize the security of our elite travelers.",
    emergency: "We provide 24/7 emergency medical evacuation and local security support in every destination.",
    advisory: "I monitor global travel advisories 24/7 and will alert you instantly if your plans need to change.",
    insurance: "Our 'Odyssey Plus' insurance covers medical, cancellation, and even lost tech gear.",
};

const ChatMessage = ({ text, sender, isBot, time, type, data }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`flex w-full mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}
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
                    <div className="text-sm leading-relaxed font-medium whitespace-pre-wrap">
                        {text}
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
    const { isLoaded, user } = useUser();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            text: "Welcome to Zyvox Concierge! 🌍\n\nI'm your dedicated AI Agent. " + MENU_STRUCTURE.main.text,
            isBot: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [currentMenu, setCurrentMenu] = useState('main');
    const [isPlanCreated, setIsPlanCreated] = useState(false);
    const chatEndRef = useRef(null);




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

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMsg = inputValue.trim();
        setMessages(prev => [...prev, { text: userMsg, isBot: false, time: now }]);
        setInputValue('');

        setTimeout(() => {
            const menu = MENU_STRUCTURE[currentMenu];

            // Check if user input is a valid number in current menu
            if (menu && menu.options[userMsg]) {
                const nextKey = menu.options[userMsg];

                if (nextKey === 'generate') {
                    triggerPlan(now);
                } else if (MENU_STRUCTURE[nextKey]) {
                    // Navigate to sub-menu
                    setCurrentMenu(nextKey);
                    setMessages(prev => [...prev, {
                        text: MENU_STRUCTURE[nextKey].text,
                        isBot: true,
                        time: now
                    }]);
                } else if (RESPONSES[nextKey]) {
                    // Show final response
                    setMessages(prev => [...prev, {
                        text: RESPONSES[nextKey],
                        isBot: true,
                        time: now
                    }]);
                }
            } else if (userMsg === '0' && currentMenu !== 'main') {
                // Explicit back handling if not in structured menu options
                setCurrentMenu('main');
                setMessages(prev => [...prev, {
                    text: MENU_STRUCTURE.main.text,
                    isBot: true,
                    time: now
                }]);
            } else {
                // Fallback for non-numeric or invalid inputs
                setMessages(prev => [...prev, {
                    text: "I'm sorry, I didn't recognize that option. Please type a number from the list above, or type '0' to return to the Main Menu.",
                    isBot: true,
                    time: now
                }]);
            }
        }, 800);
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
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-[#FDF8F3]">
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <ChatMessage key={idx} {...msg} />
                        ))}
                    </AnimatePresence>
                    <div ref={chatEndRef} />
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSend} className="p-6 bg-white border-t border-black/5 flex gap-4">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a number to select..."
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
