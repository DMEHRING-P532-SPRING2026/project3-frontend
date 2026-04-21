import { useState, useEffect } from 'react'
import api from '../api'

function Catalogue() {
    const [phenomenonTypes, setPhenomenonTypes] = useState([])
    const [protocols, setProtocols] = useState([])
    const [associativeFunctions, setAssociativeFunctions] = useState([])
    const [phenomena, setPhenomena] = useState([])
    const [activeSection, setActiveSection] = useState('phenomenonTypes')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // phenomenon type form
    const [ptName, setPtName] = useState('')
    const [ptKind, setPtKind] = useState('QUANTITATIVE')
    const [ptAllowedUnits, setPtAllowedUnits] = useState('')
    const [ptPhenomena, setPtPhenomena] = useState('')
    const [ptNormalMin, setPtNormalMin] = useState('')
    const [ptNormalMax, setPtNormalMax] = useState('')

    // phenomenon form
    const [phName, setPhName] = useState('')
    const [phPhenomenonTypeId, setPhPhenomenonTypeId] = useState('')
    const [phParentConceptId, setPhParentConceptId] = useState('')

    // protocol form
    const [prName, setPrName] = useState('')
    const [prDescription, setPrDescription] = useState('')
    const [prAccuracyRating, setPrAccuracyRating] = useState('HIGH')

    const fetchPhenomenonTypes = async () => {
        try {
            const res = await api.get('/api/phenomenon-types')
            const data = await res.json()
            setPhenomenonTypes(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Failed to load phenomenon types', err)
        }
    }

    const fetchPhenomena = async () => {
        try {
            const res = await api.get('/api/phenomena')
            const data = await res.json()
            setPhenomena(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Failed to load phenomena', err)
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

    const fetchAssociativeFunctions = async () => {
        try {
            const res = await api.get('/api/associative-function')
            const data = await res.json()
            setAssociativeFunctions(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Failed to load associative functions', err)
        }
    }

    useEffect(() => {
        fetchPhenomenonTypes()
        fetchPhenomena()
        fetchProtocols()
        fetchAssociativeFunctions()
    }, [])

    const handlePhenomenonTypeSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await api.post('/api/phenomenon-types', {
                name: ptName,
                kind: ptKind,
                allowedUnits: ptKind === 'QUANTITATIVE'
                    ? ptAllowedUnits.split(',').map(u => u.trim()).filter(Boolean)
                    : [],
                phenomena: ptKind === 'QUALITATIVE'
                    ? ptPhenomena.split(',').map(p => p.trim()).filter(Boolean)
                    : [],
                normalMin: ptNormalMin !== '' ? parseFloat(ptNormalMin) : null,
                normalMax: ptNormalMax !== '' ? parseFloat(ptNormalMax) : null,
            })
            if (!res.ok) throw new Error(await res.text())
            setPtName('')
            setPtAllowedUnits('')
            setPtPhenomena('')
            setPtKind('QUANTITATIVE')
            setPtNormalMin('')
            setPtNormalMax('')
            fetchPhenomenonTypes()
            fetchPhenomena()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handlePhenomenonSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await api.post('/api/phenomena', {
                name: phName,
                phenomenonTypeId: parseInt(phPhenomenonTypeId),
                parentConceptId: phParentConceptId !== '' ? parseInt(phParentConceptId) : null,
            })
            if (!res.ok) throw new Error(await res.text())
            setPhName('')
            setPhPhenomenonTypeId('')
            setPhParentConceptId('')
            fetchPhenomena()
            fetchPhenomenonTypes()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleProtocolSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await api.post('/api/protocols', {
                name: prName,
                description: prDescription,
                accuracyRating: prAccuracyRating,
            })
            if (!res.ok) throw new Error(await res.text())
            setPrName('')
            setPrDescription('')
            setPrAccuracyRating('HIGH')
            fetchProtocols()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDeletePhenomenonType = async (id) => {
        try {
            await api.delete(`/api/phenomenon-types/${id}`)
            fetchPhenomenonTypes()
        } catch (err) {
            console.error('Failed to delete phenomenon type', err)
        }
    }

    const handleDeleteProtocol = async (id) => {
        try {
            await api.delete(`/api/protocols/${id}`)
            fetchProtocols()
        } catch (err) {
            console.error('Failed to delete protocol', err)
        }
    }

    const handleStrategyChange = async (id, strategyType) => {
        try {
            const res = await api.patch(`/api/associative-function/${id}/strategy`, {
                diagnosisStrategyType: strategyType,
            })
            if (!res.ok) throw new Error(await res.text())
            fetchAssociativeFunctions()
        } catch (err) {
            console.error('Failed to update strategy', err)
        }
    }

    const accuracyColors = {
        HIGH: 'bg-green-800 text-green-200',
        MEDIUM: 'bg-yellow-800 text-yellow-200',
        LOW: 'bg-red-800 text-red-200',
    }

    const strategyColors = {
        CONJUNCTIVE: 'bg-blue-800 text-blue-200',
        WEIGHTED: 'bg-purple-800 text-purple-200',
    }

    // phenomena available as parents for the selected phenomenon type
    const availableParents = phenomena.filter(
        p => phPhenomenonTypeId === '' || p.phenomenonTypeId === parseInt(phPhenomenonTypeId)
    )

    return (
        <div className="grid grid-cols-3 w-full h-full gap-8 px-8 py-8 bg-neutral-800 overflow-hidden">

            {/* List panel */}
            <div className="col-span-2 bg-neutral-600 rounded overflow-hidden flex flex-col min-h-0">
                <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-500 flex items-center gap-2">
                    {['phenomenonTypes', 'protocols', 'associativeFunctions'].map(s => (
                        <button
                            key={s}
                            onClick={() => { setActiveSection(s); setError('') }}
                            className={`px-3 py-1.5 rounded text-sm font-bold transition-colors ${
                                activeSection === s
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-neutral-600 text-neutral-300 hover:bg-neutral-500'
                            }`}
                        >
                            {s === 'phenomenonTypes' ? 'Phenomenon Types'
                                : s === 'protocols' ? 'Protocols'
                                : 'Rules'}
                        </button>
                    ))}
                </div>

                <div className="overflow-y-auto flex-1 min-h-0 p-4 flex flex-col gap-2">

                    {activeSection === 'phenomenonTypes' && (
                        phenomenonTypes.length === 0
                            ? <p className="text-neutral-400 p-2">No phenomenon types found</p>
                            : phenomenonTypes.map(pt => (
                                <div key={pt.id} className="bg-neutral-700 rounded border border-neutral-500 p-3 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-white font-bold text-base">{pt.name}</h1>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${pt.kind === 'QUANTITATIVE' ? 'bg-blue-800 text-blue-200' : 'bg-purple-800 text-purple-200'}`}>
                                                {pt.kind}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDeletePhenomenonType(pt.id)}
                                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    {pt.kind === 'QUANTITATIVE' && pt.allowedUnits?.length > 0 && (
                                        <p className="text-neutral-400 text-xs">Units: {pt.allowedUnits.join(', ')}</p>
                                    )}
                                    {pt.kind === 'QUALITATIVE' && pt.phenomena?.length > 0 && (
                                        <p className="text-neutral-400 text-xs">
                                            Phenomena: {pt.phenomena.map(p => p.name).join(', ')}
                                        </p>
                                    )}
                                    {(pt.normalMin != null || pt.normalMax != null) && (
                                        <p className="text-neutral-400 text-xs">
                                            Normal range: {pt.normalMin ?? '—'} – {pt.normalMax ?? '—'}
                                        </p>
                                    )}
                                </div>
                            ))
                    )}

                    {activeSection === 'protocols' && (
                        protocols.length === 0
                            ? <p className="text-neutral-400 p-2">No protocols found</p>
                            : protocols.map(p => (
                                <div key={p.id} className="bg-neutral-700 rounded border border-neutral-500 p-3 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-white font-bold text-base">{p.name}</h1>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${accuracyColors[p.accuracyRating] ?? 'bg-neutral-600 text-neutral-200'}`}>
                                                {p.accuracyRating}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteProtocol(p.id)}
                                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    <p className="text-neutral-400 text-xs">{p.description}</p>
                                </div>
                            ))
                    )}

                    {activeSection === 'associativeFunctions' && (
                        associativeFunctions.length === 0
                            ? <p className="text-neutral-400 p-2">No rules found</p>
                            : associativeFunctions.map(af => (
                                <div key={af.id} className="bg-neutral-700 rounded border border-neutral-500 p-3 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-white font-bold text-base">{af.name}</h1>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${strategyColors[af.diagnosisStrategyType] ?? 'bg-neutral-600 text-neutral-200'}`}>
                                                {af.diagnosisStrategyType}
                                            </span>
                                        </div>
                                        <select
                                            value={af.diagnosisStrategyType ?? ''}
                                            onChange={(e) => handleStrategyChange(af.id, e.target.value)}
                                            className="text-xs px-2 py-1 rounded bg-neutral-600 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                        >
                                            <option value="CONJUNCTIVE">CONJUNCTIVE</option>
                                            <option value="WEIGHTED">WEIGHTED</option>
                                        </select>
                                    </div>
                                    <p className="text-neutral-400 text-xs">
                                        Arguments: {af.argumentConceptNames?.join(', ')}
                                    </p>
                                    <p className="text-neutral-400 text-xs">
                                        Infers: <span className="text-white">{af.productConceptName}</span>
                                    </p>
                                </div>
                            ))
                    )}
                </div>
            </div>

            {/* Form panel */}
            <div className="flex flex-col gap-4 min-h-0 overflow-y-auto">

                {/* New Phenomenon Type */}
                <div className="bg-neutral-600 rounded overflow-hidden">
                    <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-500">
                        <h1 className="text-white font-bold text-2xl tracking-wide">New Phenomenon Type</h1>
                    </div>
                    <form onSubmit={handlePhenomenonTypeSubmit} className="p-4 space-y-3">
                        <div>
                            <label className="block text-white text-sm font-bold mb-1">Name</label>
                            <input
                                type="text"
                                value={ptName}
                                onChange={(e) => setPtName(e.target.value)}
                                className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm font-bold mb-1">Kind</label>
                            <select
                                value={ptKind}
                                onChange={(e) => { setPtKind(e.target.value); setPtAllowedUnits(''); setPtPhenomena('') }}
                                className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                            >
                                <option value="QUANTITATIVE">QUANTITATIVE</option>
                                <option value="QUALITATIVE">QUALITATIVE</option>
                            </select>
                        </div>
                        {ptKind === 'QUANTITATIVE' && (
                            <div>
                                <label className="block text-white text-sm font-bold mb-1">Allowed Units</label>
                                <input
                                    type="text"
                                    value={ptAllowedUnits}
                                    onChange={(e) => setPtAllowedUnits(e.target.value)}
                                    placeholder="celsius, fahrenheit"
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white placeholder-neutral-400 border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                    required
                                />
                                <p className="text-neutral-400 text-xs mt-1">Comma separated</p>
                            </div>
                        )}
                        {ptKind === 'QUALITATIVE' && (
                            <div>
                                <label className="block text-white text-sm font-bold mb-1">Phenomena</label>
                                <input
                                    type="text"
                                    value={ptPhenomena}
                                    onChange={(e) => setPtPhenomena(e.target.value)}
                                    placeholder="A, B, AB, O"
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white placeholder-neutral-400 border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                    required
                                />
                                <p className="text-neutral-400 text-xs mt-1">Comma separated</p>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-white text-sm font-bold mb-1">Normal Min</label>
                                <input
                                    type="number"
                                    value={ptNormalMin}
                                    onChange={(e) => setPtNormalMin(e.target.value)}
                                    placeholder="e.g. 36.5"
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white placeholder-neutral-400 border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-white text-sm font-bold mb-1">Normal Max</label>
                                <input
                                    type="number"
                                    value={ptNormalMax}
                                    onChange={(e) => setPtNormalMax(e.target.value)}
                                    placeholder="e.g. 37.5"
                                    className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white placeholder-neutral-400 border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                />
                            </div>
                        </div>
                        <p className="text-neutral-400 text-xs">Normal range is optional — leave blank to skip anomaly checking</p>
                        {error && activeSection === 'phenomenonTypes' && (
                            <p className="text-red-400 text-sm">{error}</p>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Phenomenon Type'}
                        </button>
                    </form>
                </div>

                {/* New Phenomenon */}
                <div className="bg-neutral-600 rounded overflow-hidden">
                    <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-500">
                        <h1 className="text-white font-bold text-2xl tracking-wide">New Phenomenon</h1>
                    </div>
                    <form onSubmit={handlePhenomenonSubmit} className="p-4 space-y-3">
                        <div>
                            <label className="block text-white text-sm font-bold mb-1">Name</label>
                            <input
                                type="text"
                                value={phName}
                                onChange={(e) => setPhName(e.target.value)}
                                className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm font-bold mb-1">Phenomenon Type</label>
                            <select
                                value={phPhenomenonTypeId}
                                onChange={(e) => { setPhPhenomenonTypeId(e.target.value); setPhParentConceptId('') }}
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
                            <label className="block text-white text-sm font-bold mb-1">Parent Concept (optional)</label>
                            <select
                                value={phParentConceptId}
                                onChange={(e) => setPhParentConceptId(e.target.value)}
                                className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                            >
                                <option value="">None</option>
                                {availableParents.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        {error && activeSection === 'phenomenonTypes' && (
                            <p className="text-red-400 text-sm">{error}</p>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Phenomenon'}
                        </button>
                    </form>
                </div>

                {/* New Protocol */}
                <div className="bg-neutral-600 rounded overflow-hidden">
                    <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-500">
                        <h1 className="text-white font-bold text-2xl tracking-wide">New Protocol</h1>
                    </div>
                    <form onSubmit={handleProtocolSubmit} className="p-4 space-y-3">
                        <div>
                            <label className="block text-white text-sm font-bold mb-1">Name</label>
                            <input
                                type="text"
                                value={prName}
                                onChange={(e) => setPrName(e.target.value)}
                                className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm font-bold mb-1">Description</label>
                            <textarea
                                value={prDescription}
                                onChange={(e) => setPrDescription(e.target.value)}
                                className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                                rows="3"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white text-sm font-bold mb-1">Accuracy Rating</label>
                            <select
                                value={prAccuracyRating}
                                onChange={(e) => setPrAccuracyRating(e.target.value)}
                                className="w-full px-3 py-2 rounded-md bg-neutral-700 text-white border border-neutral-500 focus:outline-none focus:border-neutral-300"
                            >
                                <option value="HIGH">HIGH</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="LOW">LOW</option>
                            </select>
                        </div>
                        {error && activeSection === 'protocols' && (
                            <p className="text-red-400 text-sm">{error}</p>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Protocol'}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    )
}

export default Catalogue