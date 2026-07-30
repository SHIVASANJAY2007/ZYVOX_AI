import { Routes, Route, Navigate } from 'react-router-dom'
import SignUp from './components/SignUp'
import LandingPage from './components/LandingPage'
import GetPlan from './components/GetPlan'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Navigate to="/get-plan" replace />} />
      <Route path="/get-plan" element={<GetPlan />} />
    </Routes>
  )
}

export default App
