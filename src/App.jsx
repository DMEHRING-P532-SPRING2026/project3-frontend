import { Routes, Route, Navigate, NavLink } from 'react-router-dom'
import Patients from './pages/Patients'
import PatientDetail from './pages/PatientDetail'
import Catalogue from './pages/Catalogue'
import Logs from './pages/Logs'

function App() {
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
      </nav>

      <div className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/patients" replace />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/logs" element={<Logs />} />
        </Routes>
      </div>
    </div>
  )
}

export default App