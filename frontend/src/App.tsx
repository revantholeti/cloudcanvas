import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './store/themeStore' // initialize theme before render
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CanvasPage from './pages/CanvasPage'
import SharedViewPage from './pages/SharedViewPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import LandingPage from './pages/LandingPage'
import { useAuthStore } from './store/authStore'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const token = useAuthStore((s) => s.token)
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1a1d27', color: '#e2e8f0', border: '1px solid #2a2d3a' } }} />
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/" element={token ? <DashboardPage /> : <LandingPage />} />
        <Route path="/canvas/:id" element={<PrivateRoute><CanvasPage /></PrivateRoute>} />
        <Route path="/share/:token" element={<SharedViewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
