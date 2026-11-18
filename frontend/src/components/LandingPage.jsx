import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from './Hero'
import PillNav from './PillNav'
import Features from './Features'
import HowItWorks from './HowItWorks'
import Destinations from './Destinations'
import PricingSection from './PricingSection'
import Footer from './Footer'

const LandingPage = () => {
    const location = useLocation()

    const navItems = [
        { label: 'Explore', href: '#features' },
        { label: 'Workflow', href: '#how-it-works' },
        { label: 'Destinations', href: '#destinations' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Open App', href: '/get-plan' },
    ]

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.substring(1);
            const el = document.getElementById(id);
            if (el) {
                const timer = setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth' });
                }, 300);
                return () => clearTimeout(timer);
            }
        }
    }, [location.hash]);

    return (
        <>
            <PillNav
                items={navItems}
                activeHref={location.hash || location.pathname}
                baseColor="#ffffff"
                pillColor="#060010"
                logo="/assets/logo/logo.png"
            />

            <div className="app-content relative min-h-screen bg-black">
                <Hero />
                <Features />
                <HowItWorks />
                <Destinations />
                <PricingSection />
                <Footer />
            </div>
        </>
    )
}

export default LandingPage
