import { Routes, Route } from 'react-router-dom'
import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import SignUp from './components/SignUp'
import LandingPage from './components/LandingPage'
import GetPlan from './components/GetPlan'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/get-plan" element={<GetPlan />} />
      <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
    </Routes>
  )
}

export default App
