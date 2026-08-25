import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
    children,
    scrollContainerRef,
    enableBlur = true,
    baseOpacity = 0.1,
    baseRotation = 3,
    blurStrength = 4,
    containerClassName = '',
    textClassName = '',
    rotationEnd = 'bottom bottom',
    wordAnimationEnd = 'bottom bottom',
    selector = '.word' // Default selector for staggered elements
}) => {
    const containerRef = useRef(null);

    const content = useMemo(() => {
        // If children is a string, we split it into words
        if (typeof children === 'string') {
            return (
                <p className={`text-[clamp(1.6rem,4vw,3rem)] leading-[1.5] font-semibold ${textClassName}`}>
                    {children.split(/(\s+)/).map((word, index) => {
                        if (word.match(/^\s+$/)) return word;
                        return (
                            <span className="inline-block word" key={index}>
                                {word}
                            </span>
                        );
                    })}
                </p>
            );
        }
        // Otherwise, we render children as is
        return children;
    }, [children, textClassName]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;

        // Rotation animation for the whole container
        gsap.fromTo(
            el,
            { transformOrigin: '0% 50%', rotate: baseRotation },
            {
                ease: 'none',
                rotate: 0,
                scrollTrigger: {
                    trigger: el,
                    scroller,
                    start: 'top bottom',
                    end: rotationEnd,
                    scrub: true
                }
            }
        );

        // Target elements based on the selector
        const targets = el.querySelectorAll(selector);

        if (targets.length > 0) {
            // Opacity animation
            gsap.fromTo(
                targets,
                { opacity: baseOpacity, willChange: 'opacity' },
                {
                    ease: 'none',
                    opacity: 1,
                    stagger: 0.1, // Increased stagger for better sequential feel
                    scrollTrigger: {
                        trigger: el,
                        scroller,
                        start: 'top bottom-=10%',
                        end: wordAnimationEnd,
                        scrub: true
                    }
                }
            );

            // Blur animation
            if (enableBlur) {
                gsap.fromTo(
                    targets,
                    { filter: `blur(${blurStrength}px)` },
                    {
                        ease: 'none',
                        filter: 'blur(0px)',
                        stagger: 0.1,
                        scrollTrigger: {
                            trigger: el,
                            scroller,
                            start: 'top bottom-=10%',
                            end: wordAnimationEnd,
                            scrub: true
                        }
                    }
                );
            }
        }

        return () => {
            ScrollTrigger.getAll().forEach(trigger => {
                // Kill only the triggers we created for this element's children/targets
                const vars = trigger.vars;
                if (vars.trigger === el || Array.from(targets).includes(vars.trigger)) {
                    trigger.kill();
                }
            });
        };
    }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength, selector]);

    return (
        <div ref={containerRef} className={`my-5 ${containerClassName}`}>
            {content}
        </div>
    );
};

export default ScrollReveal;
