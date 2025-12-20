import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const FloatingElements = ({ count = 10, containerRef }) => {
    const elementsRef = useRef([]);

    const icons = [
        // Airplane
        <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" />,
        // Globe
        <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2M11 19.93C7.05 19.44 3.99 16.37 3.5 12.44L11 20V19.93M18.5 12.44C18.01 16.37 14.95 19.44 11 19.93V19L18.5 11.5V12.44M11 4.07C14.95 4.56 18.01 7.63 18.5 11.56L11 4V4.07M3.5 11.56C3.99 7.63 7.05 4.56 11 4.07V11L3.5 3.5V11.56Z" />,
        // Compass
        <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2M12 10.5C12.83 10.5 13.5 11.17 13.5 12S12.83 13.5 12 13.5 10.5 12.83 10.5 12 11.17 10.5 12 10.5M14.5 14.5L12 19L9.5 14.5L5 12L9.5 9.5L12 5L14.5 9.5L19 12L14.5 14.5Z" />,
        // Map Binoculars
        <path d="M20 7H14.7L12.7 5H8C6.9 5 6 5.9 6 7V19C6 20.1 6.9 21 8 21H20C21.1 21 22 20.1 22 19V9C22 7.9 21.1 7 20 7M15 11C16.7 11 18 12.3 18 14S16.7 17 15 17 12 15.7 12 14 13.3 11 15 11M4 9H2V21C2 22.1 2.9 23 4 23H18V21H4V9Z" />
    ];

    useEffect(() => {
        if (!containerRef.current) return;

        const elements = elementsRef.current;

        elements.forEach((el, i) => {
            if (!el) return;

            // Random initial positions within container bounds
            gsap.set(el, {
                x: gsap.utils.random(0, window.innerWidth),
                y: gsap.utils.random(0, window.innerHeight),
                opacity: gsap.utils.random(0.05, 0.15),
                scale: gsap.utils.random(0.5, 2),
                rotate: gsap.utils.random(0, 360)
            });

            // Gentle floating animation (independent of scroll)
            gsap.to(el, {
                x: "+=" + gsap.utils.random(-100, 100),
                y: "+=" + gsap.utils.random(-100, 100),
                rotate: "+=" + gsap.utils.random(-45, 45),
                duration: gsap.utils.random(10, 20),
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            // Scroll-linked parallax effect
            gsap.to(el, {
                y: "-=" + gsap.utils.random(200, 1000), // Speed variations
                rotate: "+=" + gsap.utils.random(90, 360),
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1.5
                }
            });
        });
    }, [containerRef, count]);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {Array.from({ length: count }).map((_, i) => (
                <svg
                    key={i}
                    ref={el => elementsRef.current[i] = el}
                    viewBox="0 0 24 24"
                    className="absolute w-24 h-24 text-black fill-current"
                >
                    {icons[i % icons.length]}
                </svg>
            ))}
        </div>
    );
};

export default FloatingElements;
