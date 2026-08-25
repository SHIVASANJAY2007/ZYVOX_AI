import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';

/**
 * THE CURVED DIAGONAL WIPE
 * Reduced size and slanted for a "Top-Left to Bottom-Right" sweep.
 */
const ScrollControlledWipe = () => {
    const { scrollYProgress } = useScroll();

    // Optimized scroll range for a faster, tighter wipe
    const sweepX = useTransform(scrollYProgress, [0, 0.15], ["-120%", "120%"]);
    const sweepY = useTransform(scrollYProgress, [0, 0.15], ["-20%", "20%"]);

    const layers = [
        { color: '#7B61FF', delay: 0 },
        { color: '#B6FF33', delay: 0.01 },
        { color: '#FFC700', delay: 0.02 },
        { color: '#A0D7FB', delay: 0.03 },
        { color: '#F8F6E9', delay: 0.04 },
    ];

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {layers.map((layer, i) => (
                <motion.div
                    key={i}
                    style={{
                        x: sweepX,
                        y: sweepY,
                        backgroundColor: layer.color,
                        // Slanted "Curved" Edge: creates a diagonal leading point
                        clipPath: 'polygon(0% 0%, 85% 0%, 100% 100%, 0% 100%)',
                        zIndex: 100 - i,
                        rotate: -15, // Creates the downward slant
                        scaleY: 1.5, // Ensures coverage despite the rotation
                    }}
                    className="absolute inset-0 w-[150vw] h-[120vh] -top-[10vh]"
                />
            ))}
        </div>
    );
};

/**
 * CHARACTER REVEAL ANIMATION
 */
const CharReveal = ({ text, className }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.02, delayChildren: 0.1 },
        },
    };

    const child = {
        visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 200 } },
        hidden: { opacity: 0, y: 30 },
    };

    return (
        <motion.h2 ref={ref} variants={container} initial="hidden" animate={isInView ? "visible" : "hidden"} className={className}>
            {text.split("").map((char, index) => (
                <motion.span key={index} variants={child} className="inline-block whitespace-pre">{char}</motion.span>
            ))}
        </motion.h2>
    );
};

/**
 * BOLD INLINE ICON
 */
const FloatingIcon = ({ icon, color }) => (
    <motion.span
        whileHover={{ y: -5, scale: 1.1 }}
        style={{ backgroundColor: color }}
        className="inline-flex items-center justify-center w-[1.1em] h-[1.1em] rounded-xl mx-1 shadow-[4px_4px_0px_#000] border-2 border-black align-middle cursor-pointer"
    >
        <span className="text-xl md:text-3xl">{icon}</span>
    </motion.span>
);

/**
 * PRICING CARD COMPONENT
 */
const PricingCard = ({ title, price, features, color, buttonText, isPopular }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10%" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, type: "spring", damping: 15 }}
            whileHover={{ y: -10, rotate: isPopular ? 1 : -1 }}
            className={`relative p-8 rounded-[32px] border-[4px] border-black bg-white shadow-[12px_12px_0px_#000] flex flex-col h-full ${isPopular ? 'z-10' : 'z-0'}`}
        >
            {isPopular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#B6FF33] border-2 border-black px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_#000]">
                    Most Popular
                </div>
            )}
            <div className="mb-6">
                <h3 className="text-2xl font-black uppercase mb-2">{title}</h3>
                <div className="flex items-baseline">
                    <span className="text-5xl font-[1000] tracking-tighter">${price}</span>
                    <span className="text-gray-500 font-bold ml-1">/mo</span>
                </div>
            </div>
            <ul className="mb-8 flex-grow space-y-4">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-start font-bold">
                        <span className="mr-2 mt-1">✦</span>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ backgroundColor: color }}
                className="w-full py-4 rounded-2xl border-[3px] border-black font-black uppercase text-xl shadow-[6px_6px_0px_#000] transition-shadow hover:shadow-none"
            >
                {buttonText}
            </motion.button>
        </motion.div>
    );
};

export default function AntigravityLanding() {
    const { scrollYProgress } = useScroll();
    const [billingCycle, setBillingCycle] = useState('monthly');

    const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

    const pricingData = [
        {
            title: "Explorer",
            monthlyPrice: 0,
            yearlyPrice: 0,
            features: ["Personal data dashboard", "Basic privacy reports", "1 device support", "Community access"],
            color: "#A0D7FB",
            buttonText: "Join for free",
            isPopular: false
        },
        {
            title: "Guardian",
            monthlyPrice: 29,
            yearlyPrice: 19,
            features: ["Advanced data removal", "Real-time threat detection", "Unlimited devices", "Priority support", "Vault protection"],
            color: "#B6FF33",
            buttonText: "Go Guardian",
            isPopular: true
        },
        {
            title: "Antigravity",
            monthlyPrice: 99,
            yearlyPrice: 79,
            features: ["Full identity management", "Legal privacy concierge", "Encrypted cloud mesh", "Early feature access", "Ghost mode"],
            color: "#FFC700",
            buttonText: "Full Access",
            isPopular: false
        }
    ];

    return (
        <div className="bg-[#F8F6E9] min-h-[400vh] font-sans text-[#111111] overflow-x-hidden">

            <ScrollControlledWipe />

            {/* SECTION 1: HERO */}
            <section className="h-screen flex flex-col justify-center items-center px-6 text-center sticky top-0">
                <motion.div style={{ opacity: heroOpacity }}>
                    <p className="text-[10px] font-bold mb-6 opacity-60 tracking-[0.4em] uppercase">
                        Today, you are the product
                    </p>
                    <h1 className="text-5xl md:text-[6vw] font-[1000] leading-[1.05] tracking-[-0.07em] max-w-5xl uppercase">
                        Your favorite <FloatingIcon icon="🎵" color="#7B61FF" /> songs. <br />
                        That <FloatingIcon icon="🟩" color="#B6FF33" /> must-see movie. <br />
                        Your top <FloatingIcon icon="👻" color="#FF5C00" /> interests.
                    </h1>
                </motion.div>
            </section>

            {/* SECTION 2: THE REVEAL */}
            <section className="relative z-10 bg-[#111111] text-white py-40 px-10 min-h-screen flex flex-col justify-center border-t-4 border-black">
                <div className="max-w-4xl mx-auto">
                    <CharReveal
                        text="✦ Your data is taken by companies."
                        className="text-4xl md:text-[5vw] font-[1000] text-[#B6FF33] mb-8 tracking-tighter leading-none uppercase"
                    />
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-lg md:text-2xl text-gray-400 font-bold max-w-3xl"
                    >
                        It's time for a change. Put the power back in your hands.
                    </motion.p>
                </div>
            </section>

            {/* SECTION 3: THE NAVIGATOR */}
            <section className="bg-[#FF5C00] min-h-screen py-20 flex flex-col items-center justify-center relative z-10 border-t-4 border-black">
                <h2 className="text-[10vw] font-[1000] leading-none tracking-[-0.08em] mb-16 uppercase">
                    Navigators
                </h2>

                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-64 h-80 bg-[#F8F6E9] border-[6px] border-black rounded-[40px] shadow-[20px_20px_0px_#000] flex items-center justify-center text-8xl"
                >
                    👤
                </motion.div>
            </section>

            {/* SECTION 4: PRICING */}
            <section className="relative z-20 bg-[#F8F6E9] py-32 px-6 border-t-[6px] border-black">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center mb-20">
                        <h2 className="text-6xl md:text-[8vw] font-[1000] uppercase tracking-tighter leading-none text-center mb-8">
                            Choose your <br /> <span className="text-[#7B61FF]">Protection</span>
                        </h2>

                        {/* TOGGLE */}
                        <div className="flex items-center gap-4 bg-white p-2 rounded-full border-[3px] border-black shadow-[6px_6px_0px_#000]">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-8 py-3 rounded-full font-black uppercase text-sm transition-colors ${billingCycle === 'monthly' ? 'bg-[#111111] text-white' : 'text-[#111111] hover:bg-gray-100'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-8 py-3 rounded-full font-black uppercase text-sm transition-colors ${billingCycle === 'yearly' ? 'bg-[#111111] text-white' : 'text-[#111111] hover:bg-gray-100'}`}
                            >
                                Yearly <span className="text-[#B6FF33] ml-1">(-30%)</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {pricingData.map((plan, index) => (
                            <PricingCard
                                key={index}
                                title={plan.title}
                                price={billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                                features={plan.features}
                                color={plan.color}
                                buttonText={plan.buttonText}
                                isPopular={plan.isPopular}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER-ISH PUSH */}
            <section className="h-[50vh] bg-[#111111] border-t-[6px] border-black flex items-center justify-center overflow-hidden">
                <motion.div
                    animate={{ x: [-2000, 2000] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="whitespace-nowrap text-[20vw] font-[1000] text-[#B6FF33] opacity-20 uppercase tracking-tighter"
                >
                    ANTIGRAVITY ANTIGRAVITY ANTIGRAVITY ANTIGRAVITY
                </motion.div>
            </section>
        </div>
    );
}
