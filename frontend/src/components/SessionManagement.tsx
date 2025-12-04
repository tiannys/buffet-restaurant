'use client';

import { useEffect, useState } from 'react';
import { sessions, tables, packages as packagesApi } from '@/lib/api';
import QRCodeDisplay from './QRCodeDisplay';

interface Session {
    id: string;
    table: { id: string; table_number: string };
    package: { id: string; name: string; duration_minutes: number };
    adult_count: number;
    child_count: number;
    start_time: string;
    end_time: string;
    status: string;
    paused_at?: string;
    qr_code?: string;
}

interface Table {
    id: string;
    table_number: string;
    status: string;
    zone?: string;
}

interface Package {
    id: string;
    name: string;
    duration_minutes: number;
    price_adult: number;
}

export default function SessionManagement() {
    const [activeSessions, setActiveSessions] = useState<Session[]>([]);
    const [availableTables, setAvailableTables] = useState<Table[]>([]);
    const [packagesList, setPackagesList] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [showStartModal, setShowStartModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [startFormData, setStartFormData] = useState({
        table_id: '',
        package_id: '',
        adult_count: 2,
        child_count: 0,
    });

    const [editFormData, setEditFormData] = useState({
        package_id: '',
        adult_count: 2,
        child_count: 0,
        new_table_id: '',
    });

    useEffect(() => {
        loadData();
        const interval = setInterval(loadActiveSessions, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        await Promise.all([loadActiveSessions(), loadAvailableTables(), loadPackages()]);
        setLoading(false);
    };

    const loadActiveSessions = async () => {
        try {
            const response = await sessions.getActive();
            setActiveSessions(response.data);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    };

    const loadAvailableTables = async () => {
        try {
            const response = await tables.getAll();
            const available = response.data.filter((t: Table) => t.status === 'available');
            setAvailableTables(available);
        } catch (error) {
            console.error('Failed to load tables:', error);
        }
    };

    const loadPackages = async () => {
        try {
            const response = await packagesApi.getAll();
            setPackagesList(response.data);
        } catch (error) {
            console.error('Failed to load packages:', error);
        }
    };

    const handleStartSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await sessions.start(startFormData);
            alert('Session started successfully!');
            setShowStartModal(false);
            resetStartForm();
            loadData();
        } catch (error) {
            console.error('Failed to start session:', error);
            alert('Failed to start session');
        }
    };

    const handleEndSession = async (sessionId: string) => {
        if (!confirm('Are you sure you want to end this session?')) return;

        try {
            await sessions.end(sessionId);
            alert('Session ended successfully!');
            loadData();
        } catch (error) {
            console.error('Failed to end session:', error);
            alert('Failed to end session');
        }
    };

    const handlePauseSession = async (sessionId: string) => {
        try {
            await sessions.pause(sessionId);
            alert('Session paused successfully!');
            loadActiveSessions();
        } catch (error) {
            console.error('Failed to pause session:', error);
            alert('Failed to pause session');
        }
    };

    const handleResumeSession = async (sessionId: string) => {
        try {
            await sessions.resume(sessionId);
            alert('Session resumed successfully!');
            loadActiveSessions();
        } catch (error) {
            console.error('Failed to resume session:', error);
            alert('Failed to resume session');
        }
    };

    const handleUpdateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSession) return;

        try {
            if (editFormData.package_id !== selectedSession.package.id) {
                await sessions.updatePackage(selectedSession.id, editFormData.package_id);
            }
            if (editFormData.adult_count !== selectedSession.adult_count ||
                editFormData.child_count !== selectedSession.child_count) {
                await sessions.updateGuestCount(
                    selectedSession.id,
                    editFormData.adult_count,
                    editFormData.child_count
                );
            }
            if (editFormData.new_table_id && editFormData.new_table_id !== selectedSession.table.id) {
                await sessions.transferTable(selectedSession.id, editFormData.new_table_id);
            }

            alert('Session updated successfully!');
            setShowEditModal(false);
            setSelectedSession(null);
            loadData();
        } catch (error) {
            console.error('Failed to update session:', error);
            alert('Failed to update session');
        }
    };

    const handleShowQR = async (session: Session) => {
        try {
            const response = await sessions.getQRCode(session.id);
            setSelectedSession({ ...session, qr_code: response.data.qr_code });
            setShowQRModal(true);
        } catch (error) {
            console.error('Failed to get QR code:', error);
            alert('Failed to get QR code');
        }
    };

    const handleEditSession = (session: Session) => {
        setSelectedSession(session);
        setEditFormData({
            package_id: session.package.id,
            adult_count: session.adult_count,
            child_count: session.child_count,
            new_table_id: '',
        });
        setShowEditModal(true);
    };

    const resetStartForm = () => {
        setStartFormData({
            table_id: '',
            package_id: '',
            adult_count: 2,
            child_count: 0,
        });
    };

    const getTimeRemaining = (endTime: string, pausedAt?: string) => {
        if (pausedAt) return 'PAUSED';

        const now = new Date();
        const end = new Date(endTime);
        const diffMs = end.getTime() - now.getTime();
        const minutes = Math.floor(diffMs / 60000);

        if (minutes <= 0) return `OVERTIME (${Math.abs(minutes)} min)`;
        return `${minutes} min`;
    };

    const getTimeColor = (endTime: string, pausedAt?: string) => {
        if (pausedAt) return 'text-blue-600';

        const now = new Date();
        const end = new Date(endTime);
        const diffMs = end.getTime() - now.getTime();
        const minutes = Math.floor(diffMs / 60000);

        if (minutes <= 0) return 'text-red-700 font-bold animate-pulse';
        if (minutes <= 5) return 'text-red-600 font-semibold';
        if (minutes <= 15) return 'text-orange-600 font-medium';
        return 'text-gray-700';
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Session Management</h2>
                <button
                    onClick={() => setShowStartModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Start New Session
                </button>
            </div>

            {/* Active Sessions List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guests</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Left</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {activeSessions.map((session) => (
                            <tr key={session.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">
                                    {session.table.table_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{session.package.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {session.adult_count}A
                                    {session.child_count > 0 && `, ${session.child_count}C`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {new Date(session.start_time).toLocaleTimeString()}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap ${getTimeColor(session.end_time, session.paused_at)}`}>
                                    {getTimeRemaining(session.end_time, session.paused_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                    <button
                                        onClick={() => handleShowQR(session)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        QR
                                    </button>
                                    <button
                                        onClick={() => handleEditSession(session)}
                                        className="text-green-600 hover:text-green-900"
                                    >
                                        Edit
                                    </button>
                                    {session.paused_at ? (
                                        <button
                                            onClick={() => handleResumeSession(session.id)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Resume
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handlePauseSession(session.id)}
                                            className="text-orange-600 hover:text-orange-900"
                                        >
                                            Pause
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEndSession(session.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        End
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {activeSessions.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                    No active sessions
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Start Session Modal */}
            {showStartModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Start New Session</h3>
                        <form onSubmit={handleStartSession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Table *</label>
                                <select
                                    value={startFormData.table_id}
                                    onChange={(e) => setStartFormData({ ...startFormData, table_id: e.target.value })}
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                >
                                    <option value="">Select Table</option>
                                    {availableTables.map((table) => (
                                        <option key={table.id} value={table.id}>
                                            {table.table_number} {table.zone && `(${table.zone})`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Package *</label>
                                <select
                                    value={startFormData.package_id}
                                    onChange={(e) => setStartFormData({ ...startFormData, package_id: e.target.value })}
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                >
                                    <option value="">Select Package</option>
                                    {packagesList.map((pkg) => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.name} - {pkg.duration_minutes} min - ฿{pkg.price_adult}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Adults *</label>
                                <input
                                    type="number"
                                    value={startFormData.adult_count}
                                    onChange={(e) => setStartFormData({ ...startFormData, adult_count: parseInt(e.target.value) })}
                                    required
                                    min="1"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Children</label>
                                <input
                                    type="number"
                                    value={startFormData.child_count}
                                    onChange={(e) => setStartFormData({ ...startFormData, child_count: parseInt(e.target.value) })}
                                    min="0"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowStartModal(false);
                                        resetStartForm();
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Start Session
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Session Modal */}
            {showEditModal && selectedSession && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Edit Session - Table {selectedSession.table.table_number}</h3>
                        <form onSubmit={handleUpdateSession} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Package</label>
                                <select
                                    value={editFormData.package_id}
                                    onChange={(e) => setEditFormData({ ...editFormData, package_id: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                >
                                    {packagesList.map((pkg) => (
                                        <option key={pkg.id} value={pkg.id}>
                                            {pkg.name} - {pkg.duration_minutes} min
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Adults</label>
                                <input
                                    type="number"
                                    value={editFormData.adult_count}
                                    onChange={(e) => setEditFormData({ ...editFormData, adult_count: parseInt(e.target.value) })}
                                    min="1"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Children</label>
                                <input
                                    type="number"
                                    value={editFormData.child_count}
                                    onChange={(e) => setEditFormData({ ...editFormData, child_count: parseInt(e.target.value) })}
                                    min="0"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Transfer to Table (Optional)</label>
                                <select
                                    value={editFormData.new_table_id}
                                    onChange={(e) => setEditFormData({ ...editFormData, new_table_id: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                >
                                    <option value="">Keep current table</option>
                                    {availableTables.map((table) => (
                                        <option key={table.id} value={table.id}>
                                            {table.table_number} {table.zone && `(${table.zone})`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedSession(null);
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Update Session
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {showQRModal && selectedSession && selectedSession.qr_code && (
                <QRCodeDisplay
                    session={selectedSession}
                    onClose={() => {
                        setShowQRModal(false);
                        setSelectedSession(null);
                    }}
                />
            )}
        </div>
    );
}
