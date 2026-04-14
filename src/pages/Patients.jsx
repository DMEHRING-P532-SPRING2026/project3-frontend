import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import config from '../config'

function PatientItem({ patient, onClick }) {
  return (
    <div
      onClick={onClick}
      className="grid grid-cols-3 bg-neutral-700 rounded text-white cursor-pointer hover:brightness-110 border border-neutral-500"
    >
      <div className="p-3 border-r border-white/20">
        <p className="text-neutral-400 text-xs uppercase tracking-wide mb-0.5">Name</p>
        <h1 className="font-bold text-base">{patient.name}</h1>
      </div>
      <div className="p-3 border-r border-white/20">
        <p className="text-neutral-400 text-xs uppercase tracking-wide mb-0.5">Date of Birth</p>
        <h1 className="font-bold text-base">{patient.dob}</h1>
      </div>
      <div className="p-3">
        <p className="text-neutral-400 text-xs uppercase tracking-wide mb-0.5">Note</p>
        <h1 className="font-bold text-base truncate">{patient.note || '—'}</h1>
      </div>
    </div>
  )
}

function Patients() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${config.BASE_URL}/api/patients`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setPatients(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load patients', err)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${config.BASE_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, dateOfBirth, note }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Server error: ${text}`)
      }
      setFullName('')
      setDateOfBirth('')
      setNote('')
      fetchPatients()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-3 w-full h-full gap-8 px-8 py-8 bg-neutral-800 overflow-hidden">

      {/* Patient List */}
      <div className="col-span-2 bg-neutral-600 rounded overflow-hidden flex flex-col min-h-0">
        <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-500">
          <h1 className="text-white font-bold text-3xl tracking-wide">Patients</h1>
        </div>
        <div className="overflow-y-auto flex-1 min-h-0 p-4 flex flex-col gap-2">
          {patients.length === 0
            ? <p className="text-neutral-400 p-2">No patients found</p>
            : patients.map(p => (
                <PatientItem
                  key={p.id}
                  patient={p}
                  onClick={() => navigate(`/patients/${p.id}`, { state: { patient: p } })}
                />
              ))
          }
        </div>
      </div>

      {/* Create Patient */}
      <div className="bg-neutral-600 rounded overflow-hidden flex flex-col min-h-0">
        <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-500">
          <h1 className="text-white font-bold text-3xl tracking-wide">New Patient</h1>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-white text-sm font-bold mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white placeholder-neutral-400 border border-neutral-500 focus:outline-none focus:border-neutral-300"
              required
            />
          </div>
          <div>
            <label className="block text-white text-sm font-bold mb-2">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
              required
            />
          </div>
          <div>
            <label className="block text-white text-sm font-bold mb-2">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white placeholder-neutral-400 border border-neutral-500 focus:outline-none focus:border-neutral-300"
              rows="3"
            />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Patient'}
          </button>
        </form>
      </div>

    </div>
  )
}

export default Patients