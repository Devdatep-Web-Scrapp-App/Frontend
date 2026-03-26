import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Historial from './pages/Historial.jsx'
import Login from './pages/Login.jsx'
import Settings from './pages/Settings.jsx'
import { useTheme } from './components/switcher/theme/useTheme.js'
import './styles/global.css'

function PrivateRoute({ children }) {
    const auth = localStorage.getItem('sp_auth')
    return auth ? children : <Navigate to="/login" replace />
}

function AuthLayout() {
    const { theme, toggle } = useTheme()
    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            <Sidebar onToggleTheme={toggle} theme={theme} />
            <main style={{
                flex: 1,
                minWidth: 0,
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'var(--bg-base)',
            }}>
                <Routes>
                    <Route path="/"          element={<Dashboard />} />
                    <Route path="/historial" element={<Historial />} />
                    <Route path="*"          element={<Navigate to="/" replace />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </main>
        </div>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={
                    <PrivateRoute>
                        <AuthLayout />
                    </PrivateRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}