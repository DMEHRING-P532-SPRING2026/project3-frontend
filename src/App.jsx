import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, NavLink } from 'react-router-dom'
import Patients from './pages/Patients'
import PatientDetail from './pages/PatientDetail'
import Catalogue from './pages/Catalogue'
import Logs from './pages/Logs'
import config from './config'

function App() {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetch(`${config.BASE_URL}/api/auth/users`)
        .then(res => res.json())
        .then(async data => {
            const list = Array.isArray(data) ? data : []
            setUsers(list)
            if (list.length > 0) {
                await fetch(`${config.BASE_URL}/api/auth/login?username=${list[0].username}`, {
                    method: 'POST',
                    credentials: 'include',
                })
            }
        })
        .finally(() => setReady(true))
}, [])

  const handleSwitch = async (username) => {
    if (!username) return
    await fetch(`${config.BASE_URL}/api/auth/login?username=${username}`, {
      method: 'POST',
      credentials: 'include',
    })
    setCurrentUser(users.find(u => u.username === username))
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-neutral-950">
      <nav className="bg-neutral-900 px-8 py-3 flex gap-1 items-center shrink-0 border-b border-neutral-800">
        <span className="text-white font-semibold text-sm mr-6 tracking-wide">
          Clinical
        </span>
        {[
          { to: '/patients', label: 'Patients' },
          { to: '/catalogue', label: 'Catalogue' },
          { to: '/logs', label: 'Logs' },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-700 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`
            }
          >
            {label}
          </NavLink>
        ))}

        <div className="ml-auto flex items-center gap-3">
          {currentUser && (
            <span className="text-xs text-neutral-400 flex items-center gap-2">
              {currentUser.username}
              <span className={`font-bold px-2 py-0.5 rounded ${
                currentUser.role === 'ADMIN'
                  ? 'bg-red-800 text-red-200'
                  : 'bg-blue-800 text-blue-200'
              }`}>
                {currentUser.role}
              </span>
            </span>
          )}
          <select
            onChange={(e) => handleSwitch(e.target.value)}
            className="text-xs px-2 py-1 rounded bg-neutral-700 text-white border border-neutral-600 focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>Switch user...</option>
            {users.map(u => (
              <option key={u.id} value={u.username}>{u.username}</option>
            ))}
          </select>
        </div>
      </nav>

      <div className="flex-1 overflow-hidden">
        {ready && (
          <Routes>
            <Route path="/" element={<Navigate to="/patients" replace />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/logs" element={<Logs />} />
          </Routes>
        )}
      </div>
    </div>
  )
}

export default App