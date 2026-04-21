import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import api from '../api'

function ObservationItem({ observation, onReject }) {
    const isRejected = observation.status === 'REJECTED'
    const isInferred = observation.source === 'INFERRED'

    return (
        <div className={`grid grid-cols-4 rounded text-white border ${
            isRejected ? 'bg-neutral-700 border-neutral-600 opacity-60' 
            : isInferred ? 'bg-neutral-700 border-neutral-500 border-dashed italic opacity-80'
            : 'bg-neutral-600 border-neutral-500'
        }`}>
            <div className="p-3 border-r border-white/20">
                <p className="text-neutral-400 text-xs uppercase tracking-wide mb-0.5">Type</p>
                <div className="flex items-center gap-1">
                    <h1 className="font-bold text-sm capitalize">{observation.type}</h1>
                    {isInferred && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-800 text-purple-200 not-italic">
                            INFERRED
                        </span>
                    )}
                </div>
                <p className="text-xs text-neutral-400 mt-1">{observation.phenomenonTypeName}</p>
            </div>
            <div className="p-3 border-r border-white/20">
                <p className="text-neutral-400 text-xs uppercase tracking-wide mb-0.5">Value</p>
                <h1 className="font-bold text-sm">
                    {observation.type === 'measurement'
                        ? `${observation.value} ${observation.unit}`
                        : `${observation.phenomenonName} — ${observation.value}`
                    }
                </h1>
            </div>
            <div className="p-3 border-r border-white/20">
                <p className="text-neutral-400 text-xs uppercase tracking-wide mb-0.5">Recorded</p>
                <p className="text-sm">{new Date(observation.recordedAt).toLocaleString()}</p>
                <p className="text-xs text-neutral-400 mt-1">
                    Applicable: {new Date(observation.applicableAt).toLocaleString()}
                </p>
            </div>
            <div className="p-3 flex flex-col justify-between">
                <div>
                    <p className="text-neutral-400 text-xs uppercase tracking-wide mb-0.5">Status</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${isRejected ? 'bg-red-800 text-red-200' : 'bg-green-800 text-green-200'}`}>
                        {observation.status}
                    </span>
                    {observation.flag && (
                        <span className="ml-1 text-xs font-bold px-2 py-0.5 rounded bg-amber-800 text-amber-200">
                            {observation.flag}
                        </span>
                    )}
                    {observation.protocolName && (
                        <p className="text-xs text-neutral-400 mt-1">{observation.protocolName}</p>
                    )}
                    {observation.performedBy && (
                        <p className="text-xs text-neutral-400 mt-1">By: {observation.performedBy}</p>
                    )}
                </div>
                {!isRejected && !isInferred && (
                    <button
                        onClick={() => onReject(observation.id)}
                        className="self-start text-xs text-red-400 hover:text-red-300 transition-colors mt-2"
                    >
                        Reject
                    </button>
                )}
            </div>
        </div>
    )
}

function PatientDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const patient = location.state?.patient
    const now = new Date().toISOString().slice(0, 16)

    const [observations, setObservations] = useState([])
    const [phenomenonTypes, setPhenomenonTypes] = useState([])
    const [protocols, setProtocols] = useState([])
    const [inferences, setInferences] = useState([])
    const [activeForm, setActiveForm] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // measurement form
    const [phenomenonTypeId, setPhenomenonTypeId] = useState('')
    const [amount, setAmount] = useState('')
    const [unit, setUnit] = useState('')
    const [protocolId, setProtocolId] = useState('')
    const [applicableAt, setApplicableAt] = useState(now)

    // category form
    const [catPhenomenonTypeId, setCatPhenomenonTypeId] = useState('')
    const [phenomenonId, setPhenomenonId] = useState('')
    const [presence, setPresence] = useState('PRESENT')
    const [catProtocolId, setCatProtocolId] = useState('')
    const [catApplicableAt, setCatApplicableAt] = useState(now)

    // reject form
    const [rejectId, setRejectId] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    const [rejectedById, setRejectedById] = useState('')

    const fetchObservations = async () => {
        try {
            const res = await api.get(`/api/patients/${id}/observations`)
            if (!res.ok) throw new Error('Failed to fetch observations')
            const data = await res.json()
            setObservations(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Failed to load observations', err)
        }
    }

    useEffect(() => {
        const fetchPhenomenonTypes = async () => {
            try {
                const res = await api.get('/api/phenomenon-types')
                const data = await res.json()
                setPhenomenonTypes(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error('Failed to load phenomenon types', err)
            }
        }

        const fetchProtocols = async () => {
            try {
                const res = await api.get('/api/protocols')
                const data = await res.json()
                setProtocols(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error('Failed to load protocols', err)
            }
        }

        fetchObservations()
        fetchPhenomenonTypes()
        fetchProtocols()
    }, [id])

    const handleMeasurementSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await api.post('/api/observations/measurement', {
                patientId: parseInt(id),
                phenomenonTypeId: parseInt(phenomenonTypeId),
                amount: parseFloat(amount),
                unit,
                protocolId: protocolId ? parseInt(protocolId) : null,
                applicableAt: new Date(applicableAt).toISOString(),
            })
            if (!res.ok) throw new Error(await res.text())
            setActiveForm(null)
            setPhenomenonTypeId('')
            setAmount('')
            setUnit('')
            setProtocolId('')
            setApplicableAt(now)
            fetchObservations()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCategorySubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await api.post('/api/observations/category', {
                patientId: parseInt(id),
                phenomenonId: parseInt(phenomenonId),
                presence,
                protocolId: catProtocolId ? parseInt(catProtocolId) : null,
                applicableAt: new Date(catApplicableAt).toISOString(),
            })
            if (!res.ok) throw new Error(await res.text())
            setActiveForm(null)
            setCatPhenomenonTypeId('')
            setPhenomenonId('')
            setPresence('PRESENT')
            setCatProtocolId('')
            setCatApplicableAt(now)
            fetchObservations()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRejectSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await api.post(`/api/observations/${rejectId}/reject`, {
                reason: rejectReason,
                rejectedById: rejectedById ? parseInt(rejectedById) : null,
            })
            if (!res.ok) throw new Error(await res.text())
            setActiveForm(null)
            setRejectId(null)
            setRejectReason('')
            setRejectedById('')
            fetchObservations()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleEvaluate = async () => {
        try {
            const res = await api.post(`/api/patients/${id}/evaluate`)
            const data = await res.json()
            setInferences(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Failed to evaluate', err)
        }
    }

    const selectedQualType = phenomenonTypes.find(pt => pt.id === parseInt(catPhenomenonTypeId))
    const selectedMeasType = phenomenonTypes.find(pt => pt.id === parseInt(phenomenonTypeId))

    return (
        <div className="grid grid-cols-3 w-full h-full gap-8 px-8 py-8 bg-neutral-800 overflow-hidden">

            {/* Observations */}
            <div className="col-span-2 bg-neutral-600 rounded overflow-hidden flex flex-col min-h-0">
                <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-500 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/patients')}
                        className="text-neutral-400 hover:text-white text-sm transition-colors"
                    >
                        ← Back
                    </button>
                    <h1 className="text-white font-bold text-3xl tracking-wide flex-1">
                        {patient?.name ?? `Patient ${id}`}
                    </h1>
                    <button
                        onClick={handleEvaluate}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-1.5 rounded transition-colors"
                    >
                        Evaluate Rules
                    </button>
                </div>

                {inferences.length > 0 && (
                    <div className="bg-blue-950 border-b border-blue-800 px-4 py-3 flex flex-col gap-2">
                        <span className="text-blue-300 text-sm font-bold">Inferred Diagnoses</span>
                        {inferences.map((inference, i) => (
                            <div key={i} className="bg-blue-900 rounded border border-blue-700 p-2 flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-white text-sm font-bold">{inference.inferredConcept}</span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-blue-700 text-blue-200">
                                        {inference.strategyUsed}
                                    </span>
                                </div>
                                {inference.evidenceObservationIds?.length > 0 && (
                                    <p className="text-blue-300 text-xs">
                                        Evidence: obs {inference.evidenceObservationIds.join(', ')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="overflow-y-auto flex-1 min-h-0 p-4 flex flex-col gap-2">
                    {observations.length === 0
                        ? <p className="text-neutral-400 p-2">No observations recorded</p>
                        : [...observations]
                            .sort((a, b) => {
                                if (a.status === 'REJECTED' && b.status !== 'REJECTED') return 1
                                if (a.status !== 'REJECTED' && b.status === 'REJECTED') return -1
                                return 0
                            })
                            .map(o => (
                                <ObservationItem
                                    key={o.id}
                                    observation={o}
                                    onReject={(obsId) => { setRejectId(obsId); setActiveForm('reject'); setError('') }}
                                />
                            ))
                    }
                </div>
            </div>

            {/* Right panel */}
            <div className="flex flex-col gap-4 min-h-0 overflow-y-auto">

                {/* Form selector */}
                <div className="bg-neutral-600 rounded overflow-hidden">
                    <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-500">
                        <h1 className="text-white font-bold text-2xl tracking-wide">Record</h1>
                    </div>
                    <div className="p-4 flex gap-2">
                        {['measurement', 'category', 'reject'].map(f => (
                            <button
                                key={f}
                                onClick={() => { setActiveForm(activeForm === f ? null : f); setError('') }}
                                className={`flex-1 py-2 rounded text-sm font-bold transition-colors ${activeForm === f
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                                }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Measurement form */}
                {activeForm === 'measurement' && (
                    <div className="bg-neutral-600 rounded overflow-hidden">
                        <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-500">
                            <h1 className="text-white font-bold text-2xl tracking-wide">New Measurement</h1>
                        </div>
                        <form onSubmit={handleMeasurementSubmit} className="p-4 space-y-3">
                            <div>
                                <label className="block text-white text-sm font-bold mb-1">Phenomenon Type</label>
                                <select
                                    value={phenomenonTypeId}
                                    onChange={(e) => { setPhenomenonTypeId(e.target.value); setUnit('') }}
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                    required
                                >
                                    <option value="">Select...</option>
                                    {phenomenonTypes.filter(pt => pt.kind === 'QUANTITATIVE').map(pt => (
                                        <option key={pt.id} value={pt.id}>{pt.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-white text-sm font-bold mb-1">Amount</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-white text-sm font-bold mb-1">Unit</label>
                                <select
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                    required
                                >
                                    <option value="">Select...</option>
                                    {(selectedMeasType?.allowedUnits ?? []).map(u => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-white text-sm font-bold mb-1">Protocol (optional)</label>
                                <select
                                    value={protocolId}
                                    onChange={(e) => setProtocolId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                >
                                    <option value="">None</option>
                                    {protocols.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-white text-sm font-bold mb-1">Applicable At</label>
                                <input
                                    type="datetime-local"
                                    value={applicableAt}
                                    onChange={(e) => setApplicableAt(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                    required
                                />
                            </div>
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Record Measurement'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Category form */}
                {activeForm === 'category' && (
                    <div className="bg-neutral-600 rounded overflow-hidden">
                        <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-500">
                            <h1 className="text-white font-bold text-2xl tracking-wide">New Category Obs.</h1>
                        </div>
                        <form onSubmit={handleCategorySubmit} className="p-4 space-y-3">
                            <div>
                                <label className="block text-white text-sm font-bold mb-1">Phenomenon Type</label>
                                <select
                                    value={catPhenomenonTypeId}
                                    onChange={(e) => { setCatPhenomenonTypeId(e.target.value); setPhenomenonId('') }}
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                    required
                                >
                                    <option value="">Select...</option>
                                    {phenomenonTypes.filter(pt => pt.kind === 'QUALITATIVE').map(pt => (
                                        <option key={pt.id} value={pt.id}>{pt.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-white text-sm font-bold mb-1">Phenomenon</label>
                                <select
                                    value={phenomenonId}
                                    onChange={(e) => setPhenomenonId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                    required
                                >
                                    <option value="">Select...</option>
                                    {(selectedQualType?.phenomena ?? []).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-white text-sm font-bold mb-1">Presence</label>
                                <select
                                    value={presence}
                                    onChange={(e) => setPresence(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                >
                                    <option value="PRESENT">PRESENT</option>
                                    <option value="ABSENT">ABSENT</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-white text-sm font-bold mb-1">Protocol (optional)</label>
                                <select
                                    value={catProtocolId}
                                    onChange={(e) => setCatProtocolId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                >
                                    <option value="">None</option>
                                    {protocols.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-white text-sm font-bold mb-1">Applicable At</label>
                                <input
                                    type="datetime-local"
                                    value={catApplicableAt}
                                    onChange={(e) => setCatApplicableAt(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                    required
                                />
                            </div>
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Record Observation'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Reject form */}
                {activeForm === 'reject' && (
                    <div className="bg-neutral-600 rounded overflow-hidden">
                        <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-500">
                            <h1 className="text-white font-bold text-2xl tracking-wide">Reject Observation</h1>
                        </div>
                        <form onSubmit={handleRejectSubmit} className="p-4 space-y-3">
                            <div>
                                <label className="block text-white text-sm font-bold mb-1">Observation ID</label>
                                <input
                                    type="number"
                                    value={rejectId ?? ''}
                                    onChange={(e) => setRejectId(parseInt(e.target.value))}
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-white text-sm font-bold mb-1">Reason</label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-white text-sm font-bold mb-1">Rejected By Observation ID</label>
                                <input
                                    type="number"
                                    value={rejectedById}
                                    onChange={(e) => setRejectedById(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                    required
                                />
                            </div>
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded disabled:opacity-50"
                            >
                                {loading ? 'Rejecting...' : 'Reject Observation'}
                            </button>
                        </form>
                    </div>
                )}

            </div>
        </div>
    )
}

export default PatientDetail