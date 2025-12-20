import React, { useEffect, useState, useRef } from 'react';

export const EncryptedText = ({
    text,
    revealDelayMs = 50,
    initialDelayMs = 500,
    encryptedClassName = "text-neutral-500",
    revealedClassName = "text-white",
    className = "",
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
    ...props
}) => {
    const [displayText, setDisplayText] = useState('');
    const [revealedCount, setRevealedCount] = useState(0);
    const containerRef = useRef(null);

    useEffect(() => {
        let interval;
        let timeout;

        // Initial scramble matching the target text length
        const initialScramble = text.split('').map(char =>
            char === ' ' ? ' ' : characters[Math.floor(Math.random() * characters.length)]
        ).join('');
        setDisplayText(initialScramble);

        const startReveal = () => {
            let count = 0;
            interval = setInterval(() => {
                if (count <= text.length) {
                    const scrambled = text.split('').map((char, i) => {
                        if (i < count) return text[i];
                        if (char === ' ') return ' ';
                        return characters[Math.floor(Math.random() * characters.length)];
                    }).join('');
                    setDisplayText(scrambled);
                    setRevealedCount(count);
                    count++;
                } else {
                    clearInterval(interval);
                }
            }, revealDelayMs);
        };

        timeout = setTimeout(startReveal, initialDelayMs);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [text, revealDelayMs, initialDelayMs, characters]);

    return (
        <span ref={containerRef} className={className} {...props}>
            {displayText.split('').map((char, i) => (
                <span
                    key={i}
                    className={i < revealedCount ? revealedClassName : encryptedClassName}
                >
                    {char}
                </span>
            ))}
        </span>
    );
};
