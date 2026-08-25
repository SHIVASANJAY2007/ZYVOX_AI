import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { BACKEND_API_URL } from '../config';
import remarkGfm from 'remark-gfm';
import { 
    Copy, 
    Check, 
    ExternalLink, 
    AlertTriangle, 
    CheckCircle, 
    AlertCircle, 
    Info, 
    MapPin, 
    Star, 
    Image as ImageIcon, 
    ImageOff, 
    Link as LinkIcon, 
    ArrowRight, 
    Compass, 
    Clock, 
    Globe,
    Video,
    Calendar,
    ChevronRight,
    Zap
} from 'lucide-react';

// ==========================================
// Scoped CSS Styles & Animations
// ==========================================
const StyleInjection = () => (
    <style dangerouslySetInnerHTML={{ __html: `
        @keyframes zyvoxFadeInUp {
            from {
                opacity: 0;
                transform: translateY(12px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-zyvox-fade-in {
            animation: zyvoxFadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .zyvox-scrollbar::-webkit-scrollbar {
            height: 6px;
            width: 6px;
        }
        .zyvox-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .zyvox-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 4px;
        }
        .dark .zyvox-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
        }
        .zyvox-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.2);
        }
        .dark .zyvox-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    `}} />
);

// ==========================================
// Financial and Currency Highlighter
// ==========================================
const highlightText = (text) => {
    if (typeof text !== 'string') return text;
    
    // Pattern to match currency: ₹, $, €, £ followed by numbers, optional commas, decimals, and optional suffixes like K, M, Lakhs, etc.
    // Also matches budget ranges and percentages.
    const pattern = /(\b(?:₹|\$|€|£)\s*\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:-|–|to)\s*(?:(?:₹|\$|€|£)?\s*\d+(?:,\d+)*(?:\.\d+)?))?(?:\s*(?:K|M|Lakhs|Crores|per night|\/night))?\b|\b\d+(?:\.\d+)?%\b)/gi;
    
    const parts = text.split(pattern);
    if (parts.length === 1) return text;
    
    return parts.map((part, index) => {
        if (index % 2 === 1) {
            return (
                <span 
                    key={index} 
                    className="font-bold text-[#ff6d38] dark:text-[#ff8557] bg-[#ff6d38]/5 dark:bg-[#ff6d38]/10 px-1.5 py-0.5 rounded border border-[#ff6d38]/15 dark:border-[#ff6d38]/25 shadow-xs inline-block"
                >
                    {part}
                </span>
            );
        }
        return part;
    });
};

// ==========================================
// Helper URL Sanitizer
// ==========================================
const sanitizeUrl = (url) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.toLowerCase().startsWith('javascript:')) {
        return '#';
    }
    return trimmed;
};

// ==========================================
// Media Detectors for Chatbot Replies
// ==========================================
const isVideoUrl = (url) => {
    if (!url) return false;
    const cleanUrl = url.toLowerCase().split('?')[0].split('#')[0];
    return (
        cleanUrl.endsWith('.mp4') || 
        cleanUrl.endsWith('.webm') || 
        cleanUrl.endsWith('.ogg') ||
        url.includes('youtube.com') || 
        url.includes('youtu.be') || 
        url.includes('youtube-nocookie.com') ||
        url.includes('vimeo.com')
    );
};

const isImageUrl = (url) => {
    if (!url) return false;
    const cleanUrl = url.toLowerCase().split('?')[0].split('#')[0];
    return (
        cleanUrl.endsWith('.jpg') || 
        cleanUrl.endsWith('.jpeg') || 
        cleanUrl.endsWith('.png') || 
        cleanUrl.endsWith('.webp') || 
        cleanUrl.endsWith('.svg') || 
        cleanUrl.endsWith('.gif') ||
        url.startsWith('data:image/') ||
        url.includes('images.unsplash.com') ||
        url.includes('giphy.com') ||
        url.includes('tenor.com')
    );
};

// ==========================================
// 1. Code Block with Syntax Highlighting & Copy Button
// ==========================================
export const CodeBlock = ({ code, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const highlightCode = (rawCode, lang) => {
        if (!lang) return rawCode;
        const escaped = rawCode
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
            
        if (['javascript', 'js', 'typescript', 'ts', 'jsx', 'json'].includes(lang.toLowerCase())) {
            return escaped
                .replace(/\b(const|let|var|function|return|import|export|from|default|class|extends|if|else|for|while|async|await|try|catch|new|this|typeof|instanceof)\b/g, '<span class="text-[#ff6d38] font-bold">$1</span>')
                .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-[#ffb86c]">$1</span>')
                .replace(/(["'`])(.*?)\1/g, '<span class="text-[#a6e22e]">$1$2$1</span>')
                .replace(/(\/\/.*)/g, '<span class="text-gray-500 italic">$1</span>')
                .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 italic">$1</span>');
        }
        if (['html', 'xml'].includes(lang.toLowerCase())) {
            return escaped
                .replace(/(&lt;\/?[a-zA-Z0-9:-]+)(\s|&gt;)/g, '$1$2')
                .replace(/(\b[a-zA-Z-]+)=(".*?")/g, '<span class="text-[#ffb86c]">$1</span>=<span class="text-[#a6e22e]">$2</span>')
                .replace(/(&lt;\!--[\s\S]*?--&gt;)/g, '<span class="text-gray-500 italic">$1</span>');
        }
        if (['css'].includes(lang.toLowerCase())) {
            return escaped
                .replace(/([a-zA-Z-]+\s*:)/g, '<span class="text-[#ffb86c]">$1</span>')
                .replace(/(#[a-zA-Z0-9]+)/g, '<span class="text-[#ff6d38]">$1</span>')
                .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 italic">$1</span>');
        }
        return escaped;
    };

    return (
        <div className="my-4 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-sm w-full bg-gray-950 text-gray-100 font-mono text-xs animate-zyvox-fade-in">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-white/5 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                <span>{language || 'code'}</span>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md cursor-pointer"
                >
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
            </div>
            <pre className="p-4 overflow-x-auto leading-relaxed zyvox-scrollbar">
                {language ? (
                    <code 
                        dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }} 
                    />
                ) : (
                    <code>{code}</code>
                )}
            </pre>
        </div>
    );
};

// ==========================================
// 2. Rich Table (Zebra-striped, Bordered, Horizontal Scroll)
// ==========================================
export const RichTable = ({ children }) => {
    return (
        <div className="my-4 overflow-x-auto rounded-xl border border-neutral-200 shadow-xs w-full bg-neutral-50 zyvox-scrollbar animate-zyvox-fade-in">
            <table className="min-w-full divide-y divide-neutral-200/60 text-left text-xs border-collapse">
                {children}
            </table>
        </div>
    );
};

// ==========================================
// 3. Image Element (Skeleton, Error handling, Caption)
// ==========================================
export const ImageElement = ({ src, alt, caption }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        if (imgRef.current && imgRef.current.complete) {
            setLoading(false);
        }
    }, [src]);

    return (
        <div className="my-4 w-full max-w-lg mx-auto flex flex-col items-center animate-zyvox-fade-in">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-gray-900 flex items-center justify-center shadow-sm">
                {loading && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                        <div className="w-8 h-8 border-2 border-black/5 border-t-[#ff6d38] rounded-full animate-spin" />
                    </div>
                )}
                
                {error ? (
                    <div className="flex flex-col items-center gap-2 text-gray-400 p-6 text-center">
                        <ImageOff size={32} strokeWidth={1.5} />
                        <span className="text-xs font-bold uppercase tracking-wider">Image Unavailable</span>
                    </div>
                ) : (
                    <img 
                        ref={imgRef}
                        src={src} 
                        alt={alt || 'AI generated visualization'} 
                        onLoad={() => setLoading(false)}
                        onError={() => setError(true)}
                        loading="lazy"
                        className={`w-full h-full object-cover transition-all duration-500 hover:scale-103 ${loading ? 'opacity-0 scale-98' : 'opacity-100 scale-100'}`}
                    />
                )}
            </div>
            {caption && !error && (
                <p className="mt-2.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 text-center px-4 italic leading-snug">
                    {caption}
                </p>
            )}
        </div>
    );
};

// ==========================================
// 4. Source Cards (Citations with Favicons)
// ==========================================
export const SourceCards = ({ sources }) => {
    if (!sources || !Array.isArray(sources) || sources.length === 0) return null;

    const getFaviconUrl = (domainUrl) => {
        try {
            const domain = new URL(domainUrl).hostname;
            return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        } catch {
            return null;
        }
    };

    const getDomainName = (domainUrl) => {
        try {
            return new URL(domainUrl).hostname.replace('www.', '');
        } catch {
            return 'source';
        }
    };

    return (
        <div className="my-6 w-full animate-zyvox-fade-in">
            <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                <Compass size={12} />
                <span>Sources & References</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sources.map((src, idx) => (
                    <a 
                        key={idx}
                        href={sanitizeUrl(src.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-black/5 dark:border-white/5 bg-slate-50/50 hover:bg-slate-50 dark:bg-gray-900/40 dark:hover:bg-gray-900/80 transition-all shadow-xs group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center border border-black/5 dark:border-white/5 overflow-hidden shrink-0 shadow-2xs">
                            {getFaviconUrl(src.url) ? (
                                <img 
                                    src={getFaviconUrl(src.url)} 
                                    alt="" 
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                    className="w-5 h-5 object-contain"
                                />
                            ) : null}
                            <Globe size={14} className="text-gray-400 hidden" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-[#ff6d38] dark:group-hover:text-[#ff8557] transition-colors leading-tight">
                                {src.title || 'Reference Link'}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-0.5 truncate uppercase tracking-wider flex items-center gap-1">
                                {getDomainName(src.url)}
                                <ExternalLink size={8} />
                            </p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

// ==========================================
// 5. Rich Cards Grid (Recommendations, Products, News)
// ==========================================
export const RichCards = ({ items, cardType }) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;

    return (
        <div className="my-4 w-full animate-zyvox-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item, idx) => (
                    <div 
                        key={idx}
                        className="bg-white dark:bg-gray-900 rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden shadow-xs hover:shadow-md dark:hover:border-[#ff6d38]/20 transition-all flex flex-col group"
                    >
                        {item.image && (
                            <div className="w-full aspect-[16/10] bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
                                <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                                />
                                {item.tag && (
                                    <span className="absolute top-3 left-3 bg-black text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 shadow-lg">
                                        {item.tag}
                                    </span>
                                )}
                            </div>
                        )}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className="font-black text-sm uppercase leading-tight text-gray-900 dark:text-white">{item.title}</h4>
                                    {item.rating && (
                                        <div className="flex items-center gap-0.5 text-amber-500 shrink-0 mt-0.5">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-[10px] font-black text-gray-900 dark:text-gray-100">{item.rating}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {item.subtitle && (
                                    <p className="text-[10px] font-bold text-[#ff6d38] dark:text-[#ff8557] uppercase tracking-wider mb-2">{item.subtitle}</p>
                                )}
                                
                                {item.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-4 line-clamp-3">{item.description}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3 mt-auto">
                                {item.price ? (
                                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase">{item.price}</span>
                                ) : <span />}
                                
                                {item.url && (
                                    <a 
                                        href={sanitizeUrl(item.url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-black uppercase tracking-widest text-[#ff6d38] hover:text-[#e0531b] dark:text-[#ff8557] dark:hover:text-[#ffa380] flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                        <span>Details</span>
                                        <ArrowRight size={12} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ==========================================
// 6. Callout Box (Warning, Info, Success, Error)
// ==========================================
export const CalloutBlock = ({ style, text, title }) => {
    const config = {
        warning: {
            bg: 'bg-amber-50/70 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-200',
            icon: <AlertTriangle className="text-amber-600 dark:text-amber-500 shrink-0" size={16} />,
            defaultTitle: 'Attention'
        },
        success: {
            bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-200',
            icon: <CheckCircle className="text-emerald-600 dark:text-emerald-500 shrink-0" size={16} />,
            defaultTitle: 'Completed'
        },
        error: {
            bg: 'bg-rose-50/70 border-rose-200 text-rose-900 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-200',
            icon: <AlertCircle className="text-rose-600 dark:text-rose-500 shrink-0" size={16} />,
            defaultTitle: 'Error'
        },
        info: {
            bg: 'bg-blue-50/70 border-blue-200 text-blue-900 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-200',
            icon: <Info className="text-blue-600 dark:text-blue-500 shrink-0" size={16} />,
            defaultTitle: 'Note'
        }
    };

    const block = config[style] || config.info;

    return (
        <div className={`my-4 p-4 rounded-xl border-2 ${block.bg} flex gap-3 shadow-xs animate-zyvox-fade-in`}>
            {block.icon}
            <div className="text-xs leading-relaxed font-medium">
                <span className="font-bold uppercase tracking-wider block mb-0.5">{title || block.defaultTitle}</span>
                {text}
            </div>
        </div>
    );
};

// ==========================================
// 7. Interactive Action Buttons
// ==========================================
export const ActionButtons = ({ buttons }) => {
    if (!buttons || !Array.isArray(buttons) || buttons.length === 0) return null;

    return (
        <div className="my-4 flex flex-wrap gap-2 animate-zyvox-fade-in">
            {buttons.map((btn, idx) => {
                const isPrimary = btn.style !== 'secondary';
                return (
                    <a 
                        key={idx}
                        href={sanitizeUrl(btn.url) || '#'}
                        target={btn.url ? "_blank" : undefined}
                        rel={btn.url ? "noopener noreferrer" : undefined}
                        onClick={btn.onClick}
                        className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:scale-103 active:scale-97 transition-all shadow-xs cursor-pointer ${
                            isPrimary 
                                ? 'bg-black text-white dark:bg-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90' 
                                : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-black dark:text-white border border-black/5 dark:border-white/5'
                        }`}
                    >
                        {btn.label}
                        <ArrowRight size={10} />
                    </a>
                );
            })}
        </div>
    );
};

// ==========================================
// 8. Link Cards list
// ==========================================
export const LinkCards = ({ links }) => {
    if (!links || !Array.isArray(links) || links.length === 0) return null;

    return (
        <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full animate-zyvox-fade-in">
            {links.map((link, idx) => (
                <a 
                    key={idx}
                    href={sanitizeUrl(link.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-black/5 dark:border-white/5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors shadow-xs group cursor-pointer"
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <LinkIcon size={14} className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-[#ff6d38] dark:group-hover:text-[#ff8557] transition-colors">
                            {link.label || link.url}
                        </span>
                    </div>
                    <ExternalLink size={12} className="text-gray-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
            ))}
        </div>
    );
};

// ==========================================
// Travel Plan Overview Card Component
// ==========================================
const TravelOverviewCard = ({ fields }) => {
    const destination = fields.destination || fields.location;
    const duration = fields.duration || fields.days;
    const dates = fields.dates;
    const budget = fields.budget || fields.cost || fields.estcost || fields.estimatedbudget || fields.estimatedcost;
    const transport = fields.transport || fields.travelmethod;
    const stay = fields.stay || fields.accommodation || fields.hotel;

    return (
        <div className="my-6 bg-gradient-to-br from-amber-50/70 to-[#FDF8F3]/40 dark:from-gray-900 dark:to-gray-950 p-5 rounded-2xl border-2 border-black/5 dark:border-white/5 shadow-xs animate-zyvox-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-[#ff6d38]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#ff6d38]">Travel Plan Dashboard</span>
            </div>
            
            {destination && (
                <h3 className="font-black text-2xl uppercase leading-none text-gray-900 dark:text-white mb-4">
                    {destination}
                </h3>
            )}
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {duration && (
                    <div className="bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-black/5 dark:border-white/5 shadow-2xs">
                        <p className="text-[9px] font-extrabold text-gray-400 dark:text-gray-500 uppercase flex items-center gap-1.5 tracking-wider">
                            <Clock size={10} className="text-[#ff6d38]" /> Duration
                        </p>
                        <p className="text-xs sm:text-sm font-black uppercase text-gray-800 dark:text-gray-200 mt-1">{duration}</p>
                    </div>
                )}
                
                {dates && (
                    <div className="bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-black/5 dark:border-white/5 shadow-2xs">
                        <p className="text-[9px] font-extrabold text-gray-400 dark:text-gray-500 uppercase flex items-center gap-1.5 tracking-wider">
                            <Calendar size={10} className="text-[#ff6d38]" /> Dates
                        </p>
                        <p className="text-xs sm:text-sm font-black uppercase text-gray-800 dark:text-gray-200 mt-1">{dates}</p>
                    </div>
                )}

                {transport && (
                    <div className="bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-black/5 dark:border-white/5 shadow-2xs">
                        <p className="text-[9px] font-extrabold text-gray-400 dark:text-gray-500 uppercase flex items-center gap-1.5 tracking-wider">
                            <Compass size={10} className="text-[#ff6d38]" /> Transport
                        </p>
                        <p className="text-xs sm:text-sm font-black uppercase text-gray-800 dark:text-gray-200 mt-1">{transport}</p>
                    </div>
                )}

                {stay && (
                    <div className="bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-black/5 dark:border-white/5 shadow-2xs col-span-2 sm:col-span-1">
                        <p className="text-[9px] font-extrabold text-gray-400 dark:text-gray-500 uppercase flex items-center gap-1.5 tracking-wider">
                            <MapPin size={10} className="text-[#ff6d38]" /> Stay
                        </p>
                        <p className="text-xs sm:text-sm font-black uppercase text-gray-800 dark:text-gray-200 mt-1 truncate">{stay}</p>
                    </div>
                )}

                {budget && (
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border-2 border-[#ff6d38]/20 dark:border-[#ff6d38]/30 shadow-2xs col-span-2 flex flex-col justify-center">
                        <p className="text-[9px] font-extrabold text-[#ff6d38] dark:text-[#ff8557] uppercase tracking-wider">Estimated Budget</p>
                        <p className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-0.5 tracking-tight">{budget}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ==========================================
// Itinerary Timeline Layout Component
// ==========================================
const ItineraryTimeline = ({ days }) => {
    return (
        <div className="my-6 space-y-4 animate-zyvox-fade-in">
            {days.map((day, dIdx) => {
                const isEven = dIdx % 2 === 0;
                const bgClass = isEven 
                    ? 'bg-neutral-50 border border-neutral-200/80' 
                    : 'bg-neutral-100/50 border border-neutral-200/80';
                
                return (
                    <div 
                        key={dIdx} 
                        className={`p-5 rounded-2xl ${bgClass} shadow-sm transition-all duration-300 hover:border-[#ff6d38]/20`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <span className="inline-block px-3 py-1 bg-[#ff6d38] text-black text-[10px] font-black uppercase tracking-wider rounded-lg shadow-sm">
                                {day.dayNum}
                            </span>
                            <h4 className="text-base sm:text-lg font-black uppercase text-neutral-900 tracking-tight">
                                {day.title}
                            </h4>
                        </div>

                        {day.description && (
                            <p className="text-xs sm:text-sm text-neutral-600 font-medium mb-4 italic leading-relaxed">
                                {day.description}
                            </p>
                        )}

                        <div className="grid grid-cols-1 gap-3">
                            {day.segments.map((seg, sIdx) => {
                                const timeLower = seg.time.toLowerCase();
                                let emoji = '🌅';
                                let timeColor = 'text-amber-700 bg-amber-500/10 border-amber-500/20';
                                if (timeLower.includes('afternoon')) {
                                    emoji = '☀️';
                                    timeColor = 'text-orange-700 bg-orange-500/10 border-orange-500/20';
                                } else if (timeLower.includes('evening')) {
                                    emoji = '🌆';
                                    timeColor = 'text-rose-700 bg-rose-50 border-rose-500/20';
                                } else if (timeLower.includes('night')) {
                                    emoji = '🌙';
                                    timeColor = 'text-indigo-700 bg-indigo-50 border-indigo-500/20';
                                }

                                return (
                                    <div 
                                        key={sIdx} 
                                        className="bg-white p-4 rounded-xl border border-neutral-200/60 shadow-2xs hover:border-[#ff6d38]/10 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${timeColor}`}>
                                                <span>{emoji}</span>
                                                <span>{seg.time}</span>
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
                                            {highlightText(seg.details)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ==========================================
// Multi-Plan Tabs/Comparison Component
// ==========================================
const MultiPlanTabs = ({ plans }) => {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="my-6 border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden bg-gray-50/30 dark:bg-gray-900/10 shadow-xs animate-zyvox-fade-in">
            <div className="flex border-b border-black/5 dark:border-white/5 bg-gray-50 dark:bg-gray-900/50 overflow-x-auto no-scrollbar">
                {plans.map((plan, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveTab(idx)}
                        className={`flex-1 min-w-[120px] px-5 py-4 text-center font-black text-[10px] sm:text-xs uppercase tracking-wider border-b-2 transition-all shrink-0 cursor-pointer ${
                            activeTab === idx
                                ? 'border-[#ff6d38] text-[#ff6d38] bg-white dark:bg-gray-950 font-black'
                                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                        }`}
                    >
                        {plan.title}
                    </button>
                ))}
            </div>

            <div className="p-4 sm:p-6 bg-white dark:bg-gray-950">
                {plans[activeTab].blocks.map((block, bIdx) => (
                    <RenderBlock key={bIdx} block={block} />
                ))}
            </div>
        </div>
    );
};

// ==========================================
// Video Element Player Component
// ==========================================
const VideoElement = ({ url }) => {
    let embedUrl = null;
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch) {
        embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    } else {
        const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
        if (vimeoMatch) {
            embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }
    }

    if (embedUrl) {
        return (
            <div className="my-4 w-full max-w-lg mx-auto aspect-video rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 bg-black shadow-sm animate-zyvox-fade-in">
                <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title="Video Player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
            </div>
        );
    }

    if (url.match(/\.(mp4|webm|ogg)/i)) {
        return (
            <div className="my-4 w-full max-w-lg mx-auto rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 bg-black shadow-sm animate-zyvox-fade-in">
                <video src={url} controls className="w-full aspect-video object-cover" />
            </div>
        );
    }

    return (
        <a
            href={sanitizeUrl(url)}
            target="_blank"
            rel="noopener noreferrer"
            className="my-4 max-w-lg mx-auto flex items-center justify-between p-4 rounded-xl border border-black/5 dark:border-white/5 bg-white dark:bg-gray-900 shadow-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group cursor-pointer animate-zyvox-fade-in"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shadow-2xs">
                    <Video size={18} />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Watch Video Guide</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[180px] sm:max-w-xs">{url}</p>
                </div>
            </div>
            <ExternalLink size={14} className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
        </a>
    );
};

// ==========================================
// Pexels Dynamic Media Spotlight Component
// ==========================================
const PexelsMediaBlock = ({ query }) => {
    const [media, setMedia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!query) return;
        
        let active = true;
        setLoading(true);
        setError(false);

        fetch(`${BACKEND_API_URL}/api/pexels/search?query=${encodeURIComponent(query)}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load Pexels media');
                return res.json();
            })
            .then(resJson => {
                if (active && resJson.success && resJson.data) {
                    setMedia(resJson.data);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("Pexels fetch error:", err);
                if (active) {
                    setError(true);
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [query]);

    if (loading) {
        return (
            <div className="my-6 p-6 rounded-2xl border border-neutral-200 bg-neutral-50 flex flex-col items-center gap-3 animate-pulse">
                <div className="w-6 h-6 border-2 border-neutral-300 border-t-[#ff6d38] rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Retrieving Pexels Spotlight for {query}...</span>
            </div>
        );
    }

    if (error || !media || (!media.photos.length && !media.videos.length)) {
        return null; 
    }

    const { photos, videos } = media;
    
    const cardItems = photos.slice(0, 4).map((p, idx) => ({
        title: `${query} Spotlight #${idx + 1}`,
        subtitle: `Captured by ${p.photographer}`,
        description: `Stunning high-quality visual of ${query} provided by Pexels photographer.`,
        image: p.src,
        rating: '4.8',
        tag: 'Spotlight',
        url: p.url
    }));

    return (
        <div className="my-6 space-y-6 animate-zyvox-fade-in">
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-200/50 flex gap-3 shadow-2xs">
                <Zap className="text-[#ff6d38] shrink-0" size={16} />
                <div className="text-xs leading-relaxed font-medium text-neutral-800">
                    <span className="font-bold uppercase tracking-wider block mb-0.5">✨ Zyvox Media Spotlight: {query}</span>
                    Explore real-time visual postcards and cinematic video guides fetched directly from Pexels API.
                </div>
            </div>

            {videos && videos.length > 0 && videos[0].videoUrl && (
                <div className="space-y-2">
                    <div className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Cinematic Video Guide</div>
                    <VideoElement url={videos[0].videoUrl} />
                </div>
            )}

            {cardItems.length > 0 && (
                <div className="space-y-2">
                    <div className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Visual Postcards</div>
                    <RichCards items={cardItems} cardType="places" />
                </div>
            )}
        </div>
    );
};

// ==========================================
// Content Preprocessor & Block Parser
// ==========================================
const dayHeaderRegex = /^(?:#+\s+|\*\*|)\b(Day\s+\d+|DAY\s+\d+)\b(?:\s*[:\-]\s*|\s+)(.*?)(?:\*\*|)$/i;
const timeSegmentRegex = /^\s*[\-\*\d\.\+\s]*\*\*?(Morning|Afternoon|Evening|Night)(?:\s*\([^)]+\))?\*\*?:?\s*(.*?)\s*$/i;
const overviewFieldRegex = /^\s*[\-\*\d\.\+\s]*\*\*?(Destination|Location|Duration|Days|Dates|Budget|Est\.\s+Cost|Cost|Estimated\s+Budget|Estimated\s+Cost|Travel\s+method|Transport|Accommodation|Stay|Hotel)\*\*?:\s*(.*?)\s*$/i;
const calloutRegex = /^(?:💡|⚠️|🚨|ℹ️|🛑|📌|👉)?\s*\*\*?(Tip|Warning|Important|Note|Remember|Caution|Alert|Success|Info)\*\*?\s*:\s*(.*?)$/i;
const planHeaderRegex = /^(?:#+\s+|\*\*|)\b(Plan\s+\d+|Option\s+[A-Z])\b(?:\s*[:\-]\s*|\s+)(.*?)(?:\*\*|)$/i;
const sourcesHeaderRegex = /^(?:#+\s+|\*\*|)(Sources|References|Citations)(?:\s*[:\-]\s*|\s*)(?:\*\*|)$/i;
const sourceLinkRegex = /^\s*[\-\*\d\.\+\s]*(?:\[(.*?)\]\((.*?)\)|(https?:\/\/[^\s]+))\s*$/i;

const parsePlans = (text) => {
    const lines = text.split('\n');
    const plansList = [];
    let introLines = [];
    let currentPlan = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const planMatch = line.match(planHeaderRegex);

        if (planMatch) {
            if (currentPlan) {
                plansList.push(currentPlan);
            }
            currentPlan = {
                id: planMatch[1],
                title: planMatch[2] ? `Plan ${planMatch[1]}: ${planMatch[2]}` : `Plan ${planMatch[1]}`,
                lines: []
            };
        } else {
            if (currentPlan) {
                currentPlan.lines.push(line);
            } else {
                introLines.push(line);
            }
        }
    }

    if (currentPlan) {
        plansList.push(currentPlan);
    }

    return { introText: introLines.join('\n'), plans: plansList };
};

const parseSubBlocks = (lines) => {
    const blocks = [];
    let accumulatedMarkdown = [];
    
    const flushMarkdown = () => {
        if (accumulatedMarkdown.length > 0) {
            blocks.push({ type: 'markdown', content: accumulatedMarkdown.join('\n') });
            accumulatedMarkdown = [];
        }
    };

    let currentDay = null;
    let currentSegment = null;
    let overviewFields = null;
    let sourceLinks = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 1. Check Sources Header
        if (line.match(sourcesHeaderRegex)) {
            flushMarkdown();
            if (currentDay) {
                blocks.push({ type: 'day', day: currentDay });
                currentDay = null;
            }
            sourceLinks = [];
            continue;
        }
        
        // If we are parsing source links
        if (sourceLinks !== null) {
            const linkMatch = line.match(sourceLinkRegex);
            if (linkMatch) {
                const title = linkMatch[1] || linkMatch[3];
                const url = linkMatch[2] || linkMatch[3];
                sourceLinks.push({ title, url });
                continue;
            } else if (line.trim() === '') {
                continue; 
            } else {
                blocks.push({ type: 'sources', items: sourceLinks });
                sourceLinks = null;
            }
        }
        
        // 2. Check Day Header
        const dayMatch = line.match(dayHeaderRegex);
        if (dayMatch) {
            flushMarkdown();
            if (currentDay) {
                blocks.push({ type: 'day', day: currentDay });
            }
            currentDay = {
                dayNum: dayMatch[1],
                title: dayMatch[2] || 'Exploration',
                description: '',
                segments: []
            };
            currentSegment = null;
            continue;
        }
        
        // 3. Check Overview Field
        const overviewMatch = line.match(overviewFieldRegex);
        if (overviewMatch) {
            if (!overviewFields) {
                flushMarkdown();
                overviewFields = {};
            }
            const key = overviewMatch[1].toLowerCase().replace(/\s+/g, '');
            const val = overviewMatch[2];
            overviewFields[key] = val;
            continue;
        } else if (overviewFields && line.trim() !== '') {
            // Close the overview card when hitting a non-matching line
            blocks.push({ type: 'overview', fields: overviewFields });
            overviewFields = null;
        }
        
        // 4. Check Callout Line
        const calloutMatch = line.match(calloutRegex);
        if (calloutMatch) {
            flushMarkdown();
            const type = calloutMatch[1].toLowerCase();
            const text = calloutMatch[2];
            let style = 'info';
            if (['warning', 'caution', 'alert'].includes(type)) style = 'warning';
            else if (['success', 'done'].includes(type)) style = 'success';
            else if (['error', 'danger'].includes(type)) style = 'error';
            
            blocks.push({ type: 'callout', style, title: calloutMatch[1], text });
            continue;
        }
        
        // 5. Day parsing details
        if (currentDay) {
            const timeMatch = line.match(timeSegmentRegex);
            if (timeMatch) {
                currentSegment = {
                    time: timeMatch[1],
                    details: timeMatch[2]
                };
                currentDay.segments.push(currentSegment);
                continue;
            }
            
            const timeHeaderMatch = line.match(/^[#\s\*]*\s*(Morning|Afternoon|Evening|Night)\s*$/i);
            if (timeHeaderMatch) {
                currentSegment = {
                    time: timeHeaderMatch[1],
                    details: ''
                };
                currentDay.segments.push(currentSegment);
                continue;
            }
            
            if (line.trim() !== '') {
                if (currentSegment) {
                    currentSegment.details += (currentSegment.details ? '\n' : '') + line.replace(/^\s*[\-\*\+\s]*/, '');
                } else {
                    currentDay.description += (currentDay.description ? '\n' : '') + line.replace(/^\s*[\-\*\+\s]*/, '');
                }
                continue;
            }
        }
        
        // 6. Media parsing
        const urlRegex = /(https?:\/\/[^\s\)]+)/g;
        const urls = line.match(urlRegex);
        const isMediaLine = urls && urls.length === 1 && line.trim() === urls[0];
        
        if (isMediaLine) {
            const url = urls[0];
            const isGif = url.match(/\.gif/i) || url.includes('giphy.com') || url.includes('tenor.com');
            const isImage = isImageUrl(url);
            const isVideo = isVideoUrl(url);
            
            if (isGif || isImage || isVideo) {
                flushMarkdown();
                blocks.push({
                    type: 'media',
                    mediaType: isGif ? 'gif' : isVideo ? 'video' : 'image',
                    url: url
                });
                continue;
            }
        }
        
        accumulatedMarkdown.push(line);
    }
    
    // Flush remaining state
    flushMarkdown();
    if (currentDay) {
        blocks.push({ type: 'day', day: currentDay });
    }
    if (overviewFields) {
        blocks.push({ type: 'overview', fields: overviewFields });
    }
    if (sourceLinks) {
        blocks.push({ type: 'sources', items: sourceLinks });
    }
    
    // Group consecutive Day blocks into itineraries
    const finalBlocks = [];
    let currentItineraryDays = [];
    
    for (let block of blocks) {
        if (block.type === 'day') {
            currentItineraryDays.push(block.day);
        } else {
            if (currentItineraryDays.length > 0) {
                finalBlocks.push({ type: 'itinerary', days: currentItineraryDays });
                currentItineraryDays = [];
            }
            finalBlocks.push(block);
        }
    }
    if (currentItineraryDays.length > 0) {
        finalBlocks.push({ type: 'itinerary', days: currentItineraryDays });
    }
    
    return finalBlocks;
};

// ==========================================
// Destination Enrichment Data System
// ==========================================
const destinationData = {
    goa: {
        name: 'Goa',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Goa+Tourism+Places',
        hotelUrl: 'https://www.booking.com/searchresults.html?ss=Goa&ssne=Goa',
        ticketUrl: 'https://www.makemytrip.com/flights/',
        videoUrl: 'https://www.youtube.com/watch?v=F0f15A0y-30',
        places: [
            {
                title: 'Fontainhas (Latin Quarter)',
                subtitle: 'Heritage & Culture',
                description: 'Explore the colorful, Portuguese-influenced narrow streets with local bakeries, historic houses, and classic taverns.',
                image: 'https://images.unsplash.com/photo-1614082242765-7c99bc013cd3?auto=format&fit=crop&w=600&h=400',
                rating: '4.8',
                tag: 'Culture',
                url: 'https://www.google.com/maps/search/?api=1&query=Fontainhas+Goa'
            },
            {
                title: 'Baga Beach',
                subtitle: 'North Goa Nightlife',
                description: 'Famous for its vibrant nightlife, water sports, beach shacks, and delicious local seafood options.',
                image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&h=400',
                rating: '4.5',
                tag: 'Nightlife',
                url: 'https://www.google.com/maps/search/?api=1&query=Baga+Beach+Goa'
            },
            {
                title: 'Dudhsagar Falls',
                subtitle: 'South Goa Deciduous Hills',
                description: 'A massive four-tiered waterfall located on the Mandovi River, surrounded by lush deciduous forests.',
                image: 'https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=600&h=400',
                rating: '4.7',
                tag: 'Nature',
                url: 'https://www.google.com/maps/search/?api=1&query=Dudhsagar+Falls+Goa'
            },
            {
                title: 'Miramar Beach',
                subtitle: 'Panaji Sunsets',
                description: 'A clean, soft-sand beach close to the capital city, perfect for watching sunsets and relaxing walks.',
                image: 'https://images.unsplash.com/photo-1607511316524-780c1eb47b0a?auto=format&fit=crop&w=600&h=400',
                rating: '4.3',
                tag: 'Relaxation',
                url: 'https://www.google.com/maps/search/?api=1&query=Miramar+Beach+Goa'
            }
        ]
    },
    coorg: {
        name: 'Coorg (Kodagu)',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Coorg+Tourism+Places',
        hotelUrl: 'https://www.booking.com/searchresults.html?ss=Coorg',
        ticketUrl: 'https://www.makemytrip.com/flights/',
        videoUrl: 'https://www.youtube.com/watch?v=Fh55n90Hh4M',
        places: [
            {
                title: 'Abbey Falls',
                subtitle: 'Madikeri Waterfalls',
                description: 'Stunning waterfall nestled inside coffee plantations and spice estates, perfect for nature walks.',
                image: 'https://images.unsplash.com/photo-1592345612710-e7485f47264d?auto=format&fit=crop&w=600&h=400',
                rating: '4.6',
                tag: 'Waterfall',
                url: 'https://www.google.com/maps/search/?api=1&query=Abbey+Falls+Coorg'
            },
            {
                title: 'Golden Temple (Namdroling)',
                subtitle: 'Bylakuppe Monastery',
                description: 'One of the largest Tibetan Buddhist monastic centers in India, featuring exquisite gold statues.',
                image: 'https://images.unsplash.com/photo-1600100397608-f010e427eb37?auto=format&fit=crop&w=600&h=400',
                rating: '4.9',
                tag: 'Spiritual',
                url: 'https://www.google.com/maps/search/?api=1&query=Namdroling+Monastery+Coorg'
            },
            {
                title: 'Raja\'s Seat',
                subtitle: 'Sunset Viewpoint',
                description: 'A seasonal garden of flowers and fountains that offers panoramic views of the green valleys.',
                image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&h=400',
                rating: '4.5',
                tag: 'Scenic View',
                url: 'https://www.google.com/maps/search/?api=1&query=Rajas+Seat+Coorg'
            }
        ]
    },
    ooty: {
        name: 'Ooty (Udhagamandalam)',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Ooty+Tourism+Places',
        hotelUrl: 'https://www.booking.com/searchresults.html?ss=Ooty',
        ticketUrl: 'https://www.makemytrip.com/flights/',
        videoUrl: 'https://www.youtube.com/watch?v=d_kXzC4s1Wk',
        places: [
            {
                title: 'Botanical Gardens',
                subtitle: 'Lush Terraces',
                description: 'Beautiful terraced gardens boasting thousands of species of plants, shrubs, and a fossil tree trunk.',
                image: 'https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?auto=format&fit=crop&w=600&h=400',
                rating: '4.7',
                tag: 'Nature',
                url: 'https://www.google.com/maps/search/?api=1&query=Botanical+Gardens+Ooty'
            },
            {
                title: 'Ooty Lake',
                subtitle: 'Boating Hub',
                description: 'A picturesque artificial lake surrounded by Eucalyptus trees, offering boating activities.',
                image: 'https://images.unsplash.com/photo-1598977123418-45f04b01f4ac?auto=format&fit=crop&w=600&h=400',
                rating: '4.4',
                tag: 'Boating',
                url: 'https://www.google.com/maps/search/?api=1&query=Ooty+Lake'
            },
            {
                title: 'Doddabetta Peak',
                subtitle: 'Nilgiris Lookout',
                description: 'The highest mountain in the Nilgiri Hills, offering breathtaking views of the surrounding hills.',
                image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&h=400',
                rating: '4.6',
                tag: 'Adventure',
                url: 'https://www.google.com/maps/search/?api=1&query=Doddabetta+Peak'
            }
        ]
    },
    munnar: {
        name: 'Munnar',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Munnar+Tourism+Places',
        hotelUrl: 'https://www.booking.com/searchresults.html?ss=Munnar',
        ticketUrl: 'https://www.makemytrip.com/flights/',
        videoUrl: 'https://www.youtube.com/watch?v=GjYJp3VskO4',
        places: [
            {
                title: 'Tea Museum & Gardens',
                subtitle: 'Tata Tea Estate',
                description: 'Walk through endless rolling hills of tea plantations and learn the history of tea processing.',
                image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=600&h=400',
                rating: '4.8',
                tag: 'Experience',
                url: 'https://www.google.com/maps/search/?api=1&query=Tea+Gardens+Munnar'
            },
            {
                title: 'Eravikulam National Park',
                subtitle: 'Rajamalai Sanctuary',
                description: 'Home of the endangered Nilgiri Tahr goat, featuring beautiful blooming Neelakurinji flowers.',
                image: 'https://images.unsplash.com/photo-1588691515228-a53c8fbfa751?auto=format&fit=crop&w=600&h=400',
                rating: '4.7',
                tag: 'Wildlife',
                url: 'https://www.google.com/maps/search/?api=1&query=Eravikulam+National+Park'
            }
        ]
    },
    manali: {
        name: 'Manali',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Manali+Tourism+Places',
        hotelUrl: 'https://www.booking.com/searchresults.html?ss=Manali',
        ticketUrl: 'https://www.makemytrip.com/flights/',
        videoUrl: 'https://www.youtube.com/watch?v=rAkyXG27y-4',
        places: [
            {
                title: 'Solang Valley',
                subtitle: 'Adventure Hub',
                description: 'Famous for paragliding, skiing, zorbing, and cable car rides amidst snow-capped peaks.',
                image: 'https://images.unsplash.com/photo-1592345612710-e7485f47264d?auto=format&fit=crop&w=600&h=400',
                rating: '4.7',
                tag: 'Sports',
                url: 'https://www.google.com/maps/search/?api=1&query=Solang+Valley'
            },
            {
                title: 'Hadimba Temple',
                subtitle: 'Wooden Architecture',
                description: 'An ancient wooden temple dedicated to Hidimba Devi, situated in dense cedar forests.',
                image: 'https://images.unsplash.com/photo-1598091873871-23f03301a2c3?auto=format&fit=crop&w=600&h=400',
                rating: '4.5',
                tag: 'Heritage',
                url: 'https://www.google.com/maps/search/?api=1&query=Hadimba+Temple'
            }
        ]
    }
};

const parseBotMessageToBlocks = (text) => {
    if (!text) return [];
    
    // 1. Detect and parse plans
    const plansResult = parsePlans(text);
    let finalBlocks = [];
    
    if (plansResult.plans.length > 1) {
        const parsedPlans = plansResult.plans.map(p => ({
            id: p.id,
            title: p.title,
            blocks: parseSubBlocks(p.lines)
        }));
        
        const introBlocks = parseSubBlocks(plansResult.introText.split('\n'));
        
        finalBlocks = [
            ...introBlocks,
            {
                type: 'multi_plan',
                plans: parsedPlans
            }
        ];
    } else {
        finalBlocks = parseSubBlocks(text.split('\n'));
    }

    // 2. Auto-Enrichment based on Destination Keywords
    const normalizedText = text.toLowerCase();
    let detectedDest = null;
    
    if (/\bgoa\b/i.test(normalizedText)) detectedDest = 'goa';
    else if (/\bcoorg\b/i.test(normalizedText)) detectedDest = 'coorg';
    else if (/\booty\b/i.test(normalizedText)) detectedDest = 'ooty';
    else if (/\bmunnar\b/i.test(normalizedText)) detectedDest = 'munnar';
    else if (/\bmanali\b/i.test(normalizedText)) detectedDest = 'manali';

    if (detectedDest) {
        const enrichment = destinationData[detectedDest];
        if (enrichment) {
            const sourcesIdx = finalBlocks.findIndex(b => b.type === 'sources');
            
            const enrichmentBlocks = [
                {
                    type: 'callout',
                    style: 'success',
                    title: `✨ ZYVOX AI Featured Spotlights: ${enrichment.name}`,
                    text: `Below is a curated preview of tourist highlights, video guides, and direct reservation lines for your trip.`
                },
                {
                    type: 'cards',
                    items: enrichment.places
                },
                {
                    type: 'media',
                    mediaType: 'video',
                    url: enrichment.videoUrl
                },
                {
                    type: 'buttons',
                    buttons: [
                        {
                            label: `🗺️ Realtime Maps Route`,
                            url: enrichment.mapUrl,
                            style: 'primary'
                        },
                        {
                            label: `🏨 Hotel Deals`,
                            url: enrichment.hotelUrl,
                            style: 'secondary'
                        },
                        {
                            label: `✈️ Booking Tickets`,
                            url: enrichment.ticketUrl,
                            style: 'secondary'
                        }
                    ]
                }
            ];

            if (sourcesIdx !== -1) {
                finalBlocks.splice(sourcesIdx, 0, ...enrichmentBlocks);
            } else {
                finalBlocks.push(...enrichmentBlocks);
            }
        }
    }

    // 3. Dynamic Pexels Spotlight for non-hardcoded destinations
    let overviewDest = null;
    const overviewBlock = finalBlocks.find(b => b.type === 'overview');
    if (overviewBlock && overviewBlock.fields) {
        overviewDest = overviewBlock.fields.destination || overviewBlock.fields.location;
    }
    const queryDest = overviewDest;
    if (queryDest && !detectedDest) {
        const sourcesIdx = finalBlocks.findIndex(b => b.type === 'sources');
        const pexelsBlock = {
            type: 'pexels_spotlight',
            query: queryDest.trim()
        };
        if (sourcesIdx !== -1) {
            finalBlocks.splice(sourcesIdx, 0, pexelsBlock);
        } else {
            finalBlocks.push(pexelsBlock);
        }
    }

    return finalBlocks;
};

// ==========================================
// Static Markdown Components for Reconciliation Stability
// ==========================================
const markdownComponents = {
    p: ({ node, children, ...props }) => (
        <div className="mb-4 last:mb-0 leading-relaxed font-medium text-neutral-800 text-[15px] sm:text-[16px] text-left" {...props}>
            {highlightText(children)}
        </div>
    ),
    h1: ({ node, children, ...props }) => (
        <h1 className="text-xl sm:text-2xl font-black uppercase mt-6 mb-3 text-neutral-900 leading-tight border-b border-neutral-200 pb-1 tracking-tight text-center" {...props}>
            {children}
        </h1>
    ),
    h2: ({ node, children, ...props }) => (
        <h2 className="text-lg sm:text-xl font-black uppercase mt-5 mb-2.5 text-neutral-900 leading-tight text-center" {...props}>
            {children}
        </h2>
    ),
    h3: ({ node, children, ...props }) => (
        <h3 className="text-base sm:text-lg font-black uppercase mt-4 mb-2 text-neutral-900 leading-tight text-center" {...props}>
            {children}
        </h3>
    ),
    ul: ({ node, children, ...props }) => (
        <ul className="list-disc pl-5 mb-4 space-y-1.5 font-medium text-neutral-800 text-sm sm:text-base text-left" {...props}>
            {children}
        </ul>
    ),
    ol: ({ node, children, ...props }) => (
        <ol className="list-decimal pl-5 mb-4 space-y-1.5 font-medium text-neutral-800 text-sm sm:text-base text-left" {...props}>
            {children}
        </ol>
    ),
    li: ({ node, children, ...props }) => (
        <li className="leading-relaxed text-neutral-800 text-left" {...props}>
            {highlightText(children)}
        </li>
    ),
    blockquote: ({ node, children, ...props }) => (
        <blockquote className="border-l-4 border-[#ff6d38] pl-4 italic my-4 text-neutral-700 bg-black/5 py-2.5 pr-2.5 rounded-r-xl font-medium" {...props}>
            {children}
        </blockquote>
    ),
    hr: () => <div className="my-6 border-b border-neutral-200" />,
    a: ({ node, href, children, ...props }) => {
        if (isVideoUrl(href)) {
            return <VideoElement url={href} />;
        }
        if (isImageUrl(href)) {
            return <ImageElement src={href} alt={children ? String(children) : 'Visual content'} />;
        }
        return (
            <a 
                className="text-[#ff6d38] hover:text-[#e0531b] dark:text-[#ff8557] dark:hover:text-[#ffa380] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer transition-colors" 
                target="_blank" 
                rel="noopener noreferrer" 
                href={sanitizeUrl(href)}
                {...props}
            >
                {children}
                <ExternalLink size={10} className="inline shrink-0" />
            </a>
        );
    },
    strong: ({ node, children, ...props }) => <strong className="font-extrabold text-neutral-900" {...props}>{children}</strong>,
    em: ({ node, children, ...props }) => <em className="italic text-neutral-700" {...props}>{children}</em>,
    
    table: ({ node, children }) => <RichTable>{children}</RichTable>,
    thead: ({ node, ...props }) => <thead className="bg-neutral-100 border-b border-neutral-200 font-bold uppercase text-[10px] text-neutral-600 tracking-wider" {...props} />,
    tbody: ({ node, ...props }) => <tbody className="divide-y divide-neutral-200/60" {...props} />,
    tr: ({ node, ...props }) => <tr className="hover:bg-neutral-50 transition-colors" {...props} />,
    th: ({ node, ...props }) => <th className="px-4 py-3 font-bold text-left" {...props} />,
    td: ({ node, children, ...props }) => (
        <td className="px-4 py-3 font-medium text-neutral-800 leading-normal" {...props}>
            {highlightText(children)}
        </td>
    ),

    img: ({ node, src, alt }) => <ImageElement src={src} alt={alt} />,
    
    code: ({ node, className, children, ...props }) => {
        const isInline = !className;
        const match = /language-(\w+)/.exec(className || '');
        const codeText = String(children).replace(/\n$/, '');

        if (isInline) {
            return <code className="bg-black/5 px-1.5 py-0.5 rounded font-mono text-xs font-bold text-neutral-900" {...props}>{children}</code>;
        }

        // Keep widget JSON parser compatibility if needed
        if (match && match[1] === 'json') {
            try {
                const parsedWidget = JSON.parse(codeText.trim());
                if (parsedWidget && (parsedWidget.render || parsedWidget.type)) {
                    return renderStructuredJson(parsedWidget);
                }
            } catch (e) {
                // fall back to default code rendering
            }
        }

        return (
            <CodeBlock 
                code={codeText} 
                language={match ? match[1] : ''} 
            />
        );
    }
};

// ==========================================
// Recursive Renderer for Custom Blocks
// ==========================================
const RenderBlock = ({ block }) => {
    switch (block.type) {
        case 'overview':
            return <TravelOverviewCard fields={block.fields} />;
        case 'itinerary':
            return <ItineraryTimeline days={block.days} />;
        case 'multi_plan':
            return <MultiPlanTabs plans={block.plans} />;
        case 'callout':
            return <CalloutBlock style={block.style} title={block.title} text={block.text} />;
        case 'media':
            if (block.mediaType === 'video') {
                return <VideoElement url={block.url} />;
            }
            return <ImageElement src={block.url} alt="Visual content" />;
        case 'sources':
            return <SourceCards sources={block.items} />;
        case 'pexels_spotlight':
            return <PexelsMediaBlock query={block.query} />;
        case 'markdown':
            return (
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                >
                    {block.content}
                </ReactMarkdown>
            );
        default:
            return null;
    }
};

// ==========================================
// Helper Router for Parsed JSON Widgets
// ==========================================
const renderStructuredJson = (data) => {
    const renderType = data.render || data.type;
    
    switch (renderType) {
        case 'callout':
            return (
                <CalloutBlock 
                    style={data.style || 'info'} 
                    text={data.text || ''} 
                    title={data.title}
                />
            );
        case 'sources':
        case 'references':
            return <SourceCards sources={data.items || []} />;
        case 'cards':
        case 'places':
        case 'products':
        case 'news':
        case 'recommendations':
            return <RichCards items={data.items || []} cardType={renderType} />;
        case 'actions':
        case 'buttons':
            return <ActionButtons buttons={data.buttons || []} />;
        case 'links':
            return <LinkCards links={data.links || []} />;
        case 'image':
            return (
                <ImageElement 
                    src={data.src} 
                    alt={data.alt} 
                    caption={data.caption} 
                />
            );
        default:
            return (
                <CodeBlock 
                    code={JSON.stringify(data, null, 2)} 
                    language="json" 
                />
            );
    }
};

// ==========================================
// Error Boundary for Chatbot Output Stability
// ==========================================
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ResponseRenderer Error Boundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 text-red-800 dark:text-red-200 text-xs leading-relaxed animate-zyvox-fade-in w-full">
                    <div className="flex items-center gap-2 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                        <AlertCircle size={14} className="text-red-500" />
                        <span>Rendering Optimization Fallback</span>
                    </div>
                    <p className="mb-2">There was an issue rendering this message block. Displaying raw output:</p>
                    <pre className="p-3 bg-slate-50 dark:bg-black/40 rounded-lg overflow-x-auto text-[11px] font-mono whitespace-pre-wrap select-all max-h-48 border border-black/5 dark:border-white/5">
                        {this.props.fallbackText}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

// ==========================================
// Emojis & Keycaps List Preprocessor
// ==========================================
const preprocessBotReplyText = (text) => {
    if (!text) return '';
    
    let lines = text.split('\n');
    let processedLines = lines.map(line => {
        let currentLine = line;
        
        // 1. Split on keycaps 1️⃣ to 10️⃣ and specific list bullets (✨, 💡, ⭐️)
        // Match when preceded by any non-whitespace char.
        const generalListRegex = /([^\s])\s*((?:[1-9]|10)️⃣|✨|💡|⭐️)\s+/g;
        currentLine = currentLine.replace(generalListRegex, '$1\n- $2 ');
        
        // 2. Split on other list-like emojis when followed by a title and a colon or dash
        // E.g., 🏄 Relaxation:, 🌿 Nature:, 🏨 Accommodation:
        const titleListRegex = /([^\s])\s*(🏄|🌿|🏛️|🛍️|🍴|👤|🏨|🎟️|🎡|🚕|🚗|🚌|💰|💵|🗺️|🏔️|🏝️|⛺|🚂|✈️|⏱️|🎒)\s+([A-Za-z0-9\s&]+?)(:|–|-)\s+/g;
        currentLine = currentLine.replace(titleListRegex, '$1\n- $2 $3$4 ');
        
        return currentLine;
    });
    
    return processedLines.join('\n');
};

// ==========================================
// Main Response Renderer (Controller)
// ==========================================
const ResponseRenderer = ({ text, isBot }) => {
    if (!isBot) {
        return <div className="whitespace-pre-wrap text-sm sm:text-base font-medium leading-relaxed">{text}</div>;
    }

    // Try parsing full message as JSON
    try {
        const parsedJson = JSON.parse(text.trim());
        if (parsedJson && typeof parsedJson === 'object') {
            return (
                <ErrorBoundary fallbackText={text}>
                    <div className="zyvox-message-container max-w-[850px] mx-auto w-full text-white font-sans antialiased leading-relaxed tracking-tight px-1.5 sm:px-2 select-text">
                        <StyleInjection />
                        {renderStructuredJson(parsedJson)}
                    </div>
                </ErrorBoundary>
            );
        }
    } catch (e) {
        // Not full JSON, continue to block parser
    }

    const processedText = preprocessBotReplyText(text);
    const blocks = parseBotMessageToBlocks(processedText);

    return (
        <ErrorBoundary fallbackText={text}>
            <div className="zyvox-message-container max-w-[850px] mx-auto w-full text-neutral-900 font-sans antialiased leading-relaxed tracking-tight px-1.5 sm:px-2 select-text">
                <StyleInjection />
                <div className="flex flex-col gap-4">
                    {blocks.map((block, idx) => {
                        if (block.type === 'markdown') {
                            const isEven = idx % 2 === 0;
                            const bgClass = isEven 
                                ? 'bg-neutral-50 border border-neutral-200/60' 
                                : 'bg-neutral-100/50 border border-neutral-200/40';
                            return (
                                <div key={idx} className={`w-full p-5 rounded-2xl ${bgClass} shadow-sm transition-all`}>
                                    <RenderBlock block={block} />
                                </div>
                            );
                        }
                        
                        return (
                            <div key={idx} className="w-full">
                                <RenderBlock block={block} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default ResponseRenderer;
