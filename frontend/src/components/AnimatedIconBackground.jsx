import React from 'react';
import { motion } from 'framer-motion';
import {
    Plane,
    Compass,
    Globe,
    MapPin,
    Map,
    Luggage,
    Hotel,
    Palmtree,
    Mountain,
    Ticket,
    Camera,
    Sun,
    Ship,
    Car,
    Utensils,
    Navigation,
    Bed,
    CloudSun,
    ShieldCheck,
    Landmark
} from 'lucide-react';

// Collection of Travel-only Icons with duo-tone stroke colors
const TRAVEL_ICONS = [
    { Component: Plane, accent: 'blue' },
    { Component: Compass, accent: 'taupe' },
    { Component: MapPin, accent: 'blue' },
    { Component: Globe, accent: 'taupe' },
    { Component: Luggage, accent: 'blue' },
    { Component: Hotel, accent: 'taupe' },
    { Component: Palmtree, accent: 'blue' },
    { Component: Ticket, accent: 'blue' },
    { Component: Map, accent: 'taupe' },
    { Component: Mountain, accent: 'blue' },
    { Component: Camera, accent: 'blue' },
    { Component: Ship, accent: 'taupe' },
    { Component: Car, accent: 'blue' },
    { Component: Sun, accent: 'blue' },
    { Component: Utensils, accent: 'taupe' },
    { Component: Bed, accent: 'blue' },
    { Component: Navigation, accent: 'blue' },
    { Component: ShieldCheck, accent: 'taupe' },
    { Component: CloudSun, accent: 'blue' },
    { Component: Landmark, accent: 'taupe' },
];

const AnimatedIconBackground = () => {
    const TOTAL_ITEMS = 36;

    // Scramble icon positions organically across X & Y with varied rotations & scale
    const scatteredItems = Array.from({ length: TOTAL_ITEMS }, (_, index) => {
        const iconData = TRAVEL_ICONS[index % TRAVEL_ICONS.length];
        
        const offsetX = Math.sin(index * 1.7) * 24;
        const offsetY = Math.cos(index * 2.3) * 28 + (index % 3 === 0 ? -16 : 14);
        const rotateAngle = ((index * 37) % 30) - 15; // rotate between -15deg and +15deg
        const iconScale = 0.85 + ((index * 13) % 35) / 100; // subtle size variations

        return {
            id: index,
            ...iconData,
            offsetX,
            offsetY,
            rotateAngle,
            iconScale,
            duration: 3.8 + (index % 5) * 0.9,
            delay: (index % 7) * 0.25,
        };
    });

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
            {/* Scrambled scattered layout of transparent background icons */}
            <div className="w-full h-full grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-x-8 gap-y-12 p-8 opacity-75">
                {scatteredItems.map((item) => {
                    const IconComponent = item.Component;
                    const isBlue = item.accent === 'blue';

                    return (
                        <motion.div
                            key={item.id}
                            initial={{
                                opacity: 0.75,
                                x: item.offsetX,
                                y: item.offsetY,
                                rotate: item.rotateAngle,
                                scale: item.iconScale
                            }}
                            animate={{
                                y: [
                                    item.offsetY,
                                    item.offsetY + (item.id % 2 === 0 ? -12 : 12),
                                    item.offsetY
                                ],
                                x: [
                                    item.offsetX,
                                    item.offsetX + (item.id % 3 === 0 ? 8 : -8),
                                    item.offsetX
                                ],
                                rotate: [
                                    item.rotateAngle,
                                    item.rotateAngle + (item.id % 2 === 0 ? 6 : -6),
                                    item.rotateAngle
                                ],
                                scale: [item.iconScale, item.iconScale * 1.08, item.iconScale],
                            }}
                            transition={{
                                duration: item.duration,
                                repeat: Infinity,
                                repeatType: 'reverse',
                                ease: 'easeInOut',
                                delay: item.delay,
                            }}
                            className="flex items-center justify-center p-3"
                        >
                            <IconComponent
                                size={44}
                                strokeWidth={1.4}
                                className={isBlue ? 'text-neutral-900/30' : 'text-[#ff6d38]/40'}
                            />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default AnimatedIconBackground;
