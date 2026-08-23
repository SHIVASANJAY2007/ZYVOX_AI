import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
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
    Globe 
} from 'lucide-react';

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

    // A simple regex highlighter for key languages to style tokens cleanly
    const highlightCode = (rawCode, lang) => {
        if (!lang) return rawCode;
        const escaped = rawCode
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
            
        // Basic syntax highlighters based on common keywords
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
        <div className="my-4 rounded-xl overflow-hidden border border-black/10 shadow-sm w-full bg-gray-950 text-gray-100 font-mono text-xs">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-white/5 text-[10px] uppercase font-bold tracking-wider text-gray-400">
                <span>{language || 'code'}</span>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md"
                >
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
            </div>
            <pre className="p-4 overflow-x-auto leading-relaxed">
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
        <div className="my-4 overflow-x-auto rounded-xl border border-black/10 shadow-sm w-full bg-white">
            <table className="min-w-full divide-y divide-black/10 text-left text-xs border-collapse">
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

    return (
        <div className="my-4 w-full max-w-lg mx-auto flex flex-col items-center">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-black/5 bg-gray-50 flex items-center justify-center shadow-sm">
                {loading && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                        <div className="w-8 h-8 border-2 border-black/5 border-t-black rounded-full animate-spin" />
                    </div>
                )}
                
                {error ? (
                    <div className="flex flex-col items-center gap-2 text-gray-400 p-6 text-center">
                        <ImageOff size={32} strokeWidth={1.5} />
                        <span className="text-xs font-bold uppercase tracking-wider">Image Unavailable</span>
                    </div>
                ) : (
                    <img 
                        src={src} 
                        alt={alt || 'AI generated visualization'} 
                        onLoad={() => setLoading(false)}
                        onError={() => setError(true)}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-1'}`}
                    />
                )}
            </div>
            {caption && !error && (
                <p className="mt-2 text-[11px] font-bold text-gray-500 text-center px-4 italic leading-snug">
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
        <div className="my-4 w-full">
            <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <Compass size={12} />
                <span>Sources & References</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sources.map((src, idx) => (
                    <a 
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border border-black/5 bg-white hover:bg-gray-50 transition-colors shadow-sm group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-black/5 overflow-hidden shrink-0">
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
                            <p className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-black transition-colors leading-tight">
                                {src.title || 'Reference Link'}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 mt-0.5 truncate uppercase tracking-wider flex items-center gap-1">
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
        <div className="my-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item, idx) => (
                    <div 
                        key={idx}
                        className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                    >
                        {item.image && (
                            <div className="w-full aspect-[16/10] bg-gray-50 relative overflow-hidden">
                                <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
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
                                    <h4 className="font-black text-sm uppercase leading-tight text-black">{item.title}</h4>
                                    {item.rating && (
                                        <div className="flex items-center gap-0.5 text-amber-500 shrink-0 mt-0.5">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-[10px] font-black text-black">{item.rating}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {item.subtitle && (
                                    <p className="text-[10px] font-bold text-[#ff6d38] uppercase tracking-wider mb-2">{item.subtitle}</p>
                                )}
                                
                                {item.description && (
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium mb-4 line-clamp-3">{item.description}</p>
                                )}
                            </div>

                            {/* Card Footer / Actions */}
                            <div className="flex items-center justify-between border-t border-black/5 pt-3 mt-auto">
                                {item.price ? (
                                    <span className="text-sm font-black text-black uppercase">{item.price}</span>
                                ) : <span />}
                                
                                {item.url && (
                                    <a 
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-black uppercase tracking-widest text-[#ff6d38] hover:text-black flex items-center gap-1 transition-colors"
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
            bg: 'bg-amber-50/70 border-amber-200 text-amber-900',
            icon: <AlertTriangle className="text-amber-600 shrink-0" size={16} />,
            defaultTitle: 'Attention required'
        },
        success: {
            bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
            icon: <CheckCircle className="text-emerald-600 shrink-0" size={16} />,
            defaultTitle: 'Action completed'
        },
        error: {
            bg: 'bg-rose-50/70 border-rose-200 text-rose-900',
            icon: <AlertCircle className="text-rose-600 shrink-0" size={16} />,
            defaultTitle: 'Error occurred'
        },
        info: {
            bg: 'bg-blue-50/70 border-blue-200 text-blue-900',
            icon: <Info className="text-blue-600 shrink-0" size={16} />,
            defaultTitle: 'Notice'
        }
    };

    const block = config[style] || config.info;

    return (
        <div className={`my-4 p-4 rounded-xl border-2 ${block.bg} flex gap-3 shadow-sm`}>
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
        <div className="my-4 flex flex-wrap gap-2">
            {buttons.map((btn, idx) => {
                const isPrimary = btn.style !== 'secondary';
                return (
                    <a 
                        key={idx}
                        href={btn.url || '#'}
                        target={btn.url ? "_blank" : undefined}
                        rel={btn.url ? "noopener noreferrer" : undefined}
                        onClick={btn.onClick}
                        className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-sm ${
                            isPrimary 
                                ? 'bg-black text-white hover:bg-black/90' 
                                : 'bg-gray-100 hover:bg-gray-200 text-black border border-black/5'
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
        <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
            {links.map((link, idx) => (
                <a 
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-black/5 bg-white hover:bg-gray-50 transition-colors shadow-sm group"
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <LinkIcon size={14} className="text-gray-400 group-hover:text-black transition-colors" />
                        <span className="text-xs font-bold text-gray-800 truncate group-hover:text-black transition-colors">
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
// Main Response Renderer (Controller)
// ==========================================
const ResponseRenderer = ({ text, isBot }) => {
    // If it's a user message, just render as normal whitespace-pre-wrap
    if (!isBot) {
        return <div className="whitespace-pre-wrap">{text}</div>;
    }

    // Safely parse JSON structure in a block or in the whole message
    const tryParseJson = (str) => {
        try {
            const parsed = JSON.parse(str.trim());
            // Make sure it looks like our structured schemas
            if (parsed && typeof parsed === 'object') {
                return parsed;
            }
        } catch {
            return null;
        }
        return null;
    };

    // 1. Try parsing full message as JSON
    const parsedJson = tryParseJson(text);
    if (parsedJson) {
        return renderStructuredJson(parsedJson);
    }

    // 2. Render Markdown content safely (with nested JSON-block widget rendering support)
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ node, ...props }) => <p className="mb-3 last:mb-0 leading-relaxed font-medium text-gray-800" {...props} />,
                h1: ({ node, ...props }) => <h1 className="text-lg font-black uppercase mt-5 mb-2 text-black leading-tight border-b border-black/5 pb-1" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-base font-black uppercase mt-4 mb-2 text-black leading-tight" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-sm font-black uppercase mt-3 mb-1 text-black leading-tight" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1.5 font-medium text-gray-800" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5 font-medium text-gray-800" {...props} />,
                li: ({ node, ...props }) => <li className="text-sm leading-relaxed" {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-[#ff6d38] pl-4 italic my-4 text-gray-600 bg-gray-50 py-2 pr-2 rounded-r-lg font-medium" {...props} />,
                hr: ({ node, ...props }) => <hr className="my-6 border-t border-black/10" {...props} />,
                a: ({ node, ...props }) => <a className="text-[#ff6d38] hover:underline font-bold inline-flex items-center gap-0.5" target="_blank" rel="noopener noreferrer" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold text-black" {...props} />,
                em: ({ node, ...props }) => <em className="italic text-gray-800" {...props} />,
                
                // Override tables to make them premium and responsive
                table: ({ node, children }) => <RichTable>{children}</RichTable>,
                thead: ({ node, ...props }) => <thead className="bg-gray-50 border-b border-black/10 font-bold uppercase text-[10px] text-gray-500 tracking-wider" {...props} />,
                tbody: ({ node, ...props }) => <tbody className="divide-y divide-black/5" {...props} />,
                tr: ({ node, ...props }) => <tr className="hover:bg-gray-50/50 transition-colors" {...props} />,
                th: ({ node, ...props }) => <th className="px-4 py-3 font-bold text-left" {...props} />,
                td: ({ node, ...props }) => <td className="px-4 py-3 font-medium text-gray-700 leading-normal" {...props} />,

                // Override images for markdown compatibility
                img: ({ node, src, alt }) => <ImageElement src={src} alt={alt} />,
                
                // Code block renderer containing syntax highlighting, copy-buttons, and JSON widgets
                code: ({ node, className, children, ...props }) => {
                    const isInline = !className;
                    const match = /language-(\w+)/.exec(className || '');
                    const codeText = String(children).replace(/\n$/, '');

                    if (isInline) {
                        return <code className="bg-black/5 px-1.5 py-0.5 rounded font-mono text-xs font-semibold text-black" {...props}>{children}</code>;
                    }

                    // Check if this code block is parsed as a JSON widget
                    if (match && match[1] === 'json') {
                        const parsedWidget = tryParseJson(codeText);
                        if (parsedWidget && parsedWidget.render) {
                            return renderStructuredJson(parsedWidget);
                        }
                    }

                    return (
                        <CodeBlock 
                            code={codeText} 
                            language={match ? match[1] : ''} 
                        />
                    );
                }
            }}
        >
            {text}
        </ReactMarkdown>
    );
};

// ==========================================
// Helper Router for Parsed JSON Widgets
// ==========================================
const renderStructuredJson = (data) => {
    // If the json specifies a standard widget render key
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
            // If it's valid JSON but doesn't have a matching renderer, just show it as highlighted JSON
            return (
                <CodeBlock 
                    code={JSON.stringify(data, null, 2)} 
                    language="json" 
                />
            );
    }
};

export default ResponseRenderer;
