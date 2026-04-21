import { useState, useEffect } from 'react'
import api from '../api'

function Logs() {
    const [commandLog, setCommandLog] = useState([])
    const [auditLog, setAuditLog] = useState([])

    const fetchCommandLog = async () => {
        try {
            const res = await api.get('/api/command-log')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setCommandLog(Array.isArray(data) ? data : [])
        } catch (err) {
            console.error('Failed to load command log', err)
        }
    }

    useEffect(() => {
        const fetchAuditLog = async () => {
            try {
                const res = await api.get('/api/audit-log')
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setAuditLog(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error('Failed to load audit log', err)
            }
        }

        fetchCommandLog()
        fetchAuditLog()
    }, [])

    const handleUndo = async (id) => {
        try {
            const res = await api.post(`/api/command-log/${id}/undo`)
            if (!res.ok) {
                const text = await res.text()
                alert(`Undo failed: ${text}`)
                return
            }
            fetchCommandLog()
        } catch (err) {
            console.error('Failed to undo command', err)
        }
    }

    const undoableTypes = ['CREATE_OBSERVATION', 'REJECT_OBSERVATION']

    return (
        <div className="grid grid-cols-2 w-full h-full gap-8 px-8 py-8 bg-neutral-800 overflow-hidden">

            {/* Command Log */}
            <div className="bg-neutral-600 rounded overflow-hidden flex flex-col min-h-0">
                <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-500">
                    <h1 className="text-white font-bold text-3xl tracking-wide">Command Log</h1>
                </div>
                <div className="overflow-y-auto flex-1 min-h-0 p-4 flex flex-col gap-2">
                    {commandLog.length === 0
                        ? <p className="text-neutral-400 p-2">No commands logged</p>
                        : commandLog.map(entry => (
                            <div key={entry.id} className="bg-neutral-700 rounded border border-neutral-500 p-3 flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-800 text-blue-200">
                                            {entry.commandType}
                                        </span>
                                        {entry.undone && (
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-600 text-neutral-300">
                                                UNDONE
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-neutral-400 text-xs">
                                        {new Date(entry.executedAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-neutral-300 text-xs">
                                    User: <span className="text-white">{entry.user?.username ?? entry.user}</span>
                                </p>
                                <details className="mt-1">
                                    <summary className="text-neutral-400 text-xs cursor-pointer hover:text-white transition-colors">
                                        Payload
                                    </summary>
                                    <pre className="text-neutral-300 text-xs mt-1 bg-neutral-800 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                                        {(() => {
                                            try {
                                                return JSON.stringify(JSON.parse(entry.payload ?? '{}'), null, 2)
                                            } catch {
                                                return entry.payload
                                            }
                                        })()}
                                    </pre>
                                </details>
                                    {!entry.undone && (
                                        <button
                                            onClick={() => handleUndo(entry.id)}
                                            className="self-start text-xs text-amber-400 hover:text-amber-300 transition-colors mt-1"
                                        >
                                            Undo
                                        </button>
                                    )}
                            </div>
                        ))
                    }
                </div>
            </div>

            {/* Audit Log */}
            <div className="bg-neutral-600 rounded overflow-hidden flex flex-col min-h-0">
                <div className="bg-neutral-700 px-4 py-3 border-b border-neutral-500">
                    <h1 className="text-white font-bold text-3xl tracking-wide">Audit Log</h1>
                </div>
                <div className="overflow-y-auto flex-1 min-h-0 p-4 flex flex-col gap-2">
                    {auditLog.length === 0
                        ? <p className="text-neutral-400 p-2">No audit entries</p>
                        : auditLog.map(entry => (
                            <div key={entry.id} className="bg-neutral-700 rounded border border-neutral-500 p-3 flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                        entry.auditType === 'CREATE'
                                            ? 'bg-green-800 text-green-200'
                                            : 'bg-red-800 text-red-200'
                                    }`}>
                                        {entry.auditType}
                                    </span>
                                    <span className="text-neutral-400 text-xs">
                                        {new Date(entry.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-neutral-300 text-xs">
                                    Observation ID: <span className="text-white">{entry.observationId}</span>
                                </p>
                                <p className="text-neutral-300 text-xs">
                                    Patient ID: <span className="text-white">{entry.patientId}</span>
                                </p>
                            </div>
                        ))
                    }
                </div>
            </div>

        </div>
    )
}

export default Logs