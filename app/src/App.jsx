import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from './components/Hero'
import PillNav from './components/PillNav'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Destinations from './components/Destinations'
import PricingSection from './components/PricingSection'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [isFading, setIsFading] = useState(false)
  const location = useLocation()

  const navItems = [
    { label: 'Explore', href: '#features' },
    { label: 'Workflow', href: '#how-it-works' },
    { label: 'Destinations', href: '#destinations' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Login', href: '/signin' },
  ]

  const handleSkip = () => {
    setIsFading(true)
    setTimeout(() => {
      setShowIntro(false)
    }, 1500) // Match the 1.5s transition in CSS
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSkip()
    }, 10000) // 10 seconds

    return () => clearTimeout(timer)
  }, [])



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

export default App
