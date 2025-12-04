'use client';

import { useEffect, useState } from 'react';
import { tables, sessions } from '@/lib/api';

interface TableWithSession {
    id: string;
    table_number: string;
    zone?: string;
    capacity: number;
    status: string;
    table_type: string;
    is_out_of_service: boolean;
    current_session?: {
        id: string;
        package_name: string;
        adult_count: number;
        child_count: number;
        start_time: string;
        end_time: string;
        paused_at?: string;
    };
}

interface DashboardSummary {
    total: number;
    available: number;
    occupied: number;
    reserved: number;
    cleaning: number;
    out_of_service: number;
}

export default function TableDashboard() {
    const [tableList, setTableList] = useState<TableWithSession[]>([]);
    const [summary, setSummary] = useState<DashboardSummary>({
        total: 0,
        available: 0,
        occupied: 0,
        reserved: 0,
        cleaning: 0,
        out_of_service: 0,
    });
    const [loading, setLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState<string>('all');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [zones, setZones] = useState<string[]>([]);
    const [selectedTable, setSelectedTable] = useState<TableWithSession | null>(null);

    useEffect(() => {
        loadDashboard();
        const interval = setInterval(loadDashboard, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const loadDashboard = async () => {
        try {
            const response = await tables.getDashboardWithSessions();
            setTableList(response.data.tables);
            setSummary(response.data.summary);

            // Extract unique zones
            const uniqueZones = Array.from(
                new Set(response.data.tables.map((t: TableWithSession) => t.zone).filter(Boolean))
            ) as string[];
            setZones(uniqueZones);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (table: TableWithSession) => {
        if (table.is_out_of_service) return 'bg-black text-white';

        switch (table.status) {
            case 'available':
                return 'bg-green-500 text-white';
            case 'occupied':
                return 'bg-red-500 text-white';
            case 'reserved':
                return 'bg-yellow-500 text-white';
            case 'cleaning':
                return 'bg-gray-400 text-white';
            default:
                return 'bg-gray-300 text-gray-700';
        }
    };

    const getTimeRemaining = (endTime: string, pausedAt?: string) => {
        if (pausedAt) return { minutes: 0, warning: 'paused' };

        const now = new Date();
        const end = new Date(endTime);
        const diffMs = end.getTime() - now.getTime();
        const minutes = Math.floor(diffMs / 60000);

        let warning = 'none';
        if (minutes <= 0) warning = 'overtime';
        else if (minutes <= 5) warning = 'critical';
        else if (minutes <= 15) warning = 'medium';

        return { minutes, warning };
    };

    const getWarningColor = (warning: string) => {
        switch (warning) {
            case 'overtime':
                return 'text-red-700 font-bold animate-pulse';
            case 'critical':
                return 'text-red-600 font-semibold';
            case 'medium':
                return 'text-orange-600 font-medium';
            case 'paused':
                return 'text-blue-600';
            default:
                return 'text-gray-700';
        }
    };

    const filteredTables = tableList.filter((table) => {
        if (selectedZone !== 'all' && table.zone !== selectedZone) return false;
        if (selectedType !== 'all' && table.table_type !== selectedType) return false;
        return true;
    });

    const handleTableClick = (table: TableWithSession) => {
        setSelectedTable(table);
    };

    const handleToggleOutOfService = async (tableId: string, notes?: string) => {
        try {
            await tables.toggleOutOfService(tableId, notes);
            loadDashboard();
            setSelectedTable(null);
        } catch (error) {
            console.error('Failed to toggle out of service:', error);
            alert('Failed to toggle out of service');
        }
    };

    const handleChangeStatus = async (tableId: string, newStatus: string) => {
        try {
            await tables.updateStatus(tableId, newStatus);
            loadDashboard();
            setSelectedTable(null);
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        }
    };

    if (loading) {
        return <div className="p-6">Loading dashboard...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Total Tables</div>
                    <div className="text-2xl font-bold">{summary.total}</div>
                </div>
                <div className="bg-green-100 rounded-lg shadow p-4">
                    <div className="text-sm text-green-700">Available</div>
                    <div className="text-2xl font-bold text-green-700">{summary.available}</div>
                </div>
                <div className="bg-red-100 rounded-lg shadow p-4">
                    <div className="text-sm text-red-700">Occupied</div>
                    <div className="text-2xl font-bold text-red-700">{summary.occupied}</div>
                </div>
                <div className="bg-yellow-100 rounded-lg shadow p-4">
                    <div className="text-sm text-yellow-700">Reserved</div>
                    <div className="text-2xl font-bold text-yellow-700">{summary.reserved}</div>
                </div>
                <div className="bg-gray-100 rounded-lg shadow p-4">
                    <div className="text-sm text-gray-700">Cleaning</div>
                    <div className="text-2xl font-bold text-gray-700">{summary.cleaning}</div>
                </div>
                <div className="bg-black rounded-lg shadow p-4">
                    <div className="text-sm text-white">Out of Service</div>
                    <div className="text-2xl font-bold text-white">{summary.out_of_service}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                    <select
                        value={selectedZone}
                        onChange={(e) => setSelectedZone(e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2"
                    >
                        <option value="all">All Zones</option>
                        {zones.map((zone) => (
                            <option key={zone} value={zone}>
                                {zone}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Table Type</label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2"
                    >
                        <option value="all">All Types</option>
                        <option value="normal">Normal</option>
                        <option value="vip">VIP</option>
                        <option value="private">Private</option>
                    </select>
                </div>
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredTables.map((table) => {
                    const timeInfo = table.current_session
                        ? getTimeRemaining(table.current_session.end_time, table.current_session.paused_at)
                        : null;

                    return (
                        <div
                            key={table.id}
                            onClick={() => handleTableClick(table)}
                            className={`${getStatusColor(table)} rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow`}
                        >
                            <div className="text-center">
                                <div className="text-2xl font-bold mb-1">{table.table_number}</div>
                                {table.zone && <div className="text-xs opacity-80 mb-2">{table.zone}</div>}
                                <div className="text-sm opacity-90">
                                    {table.is_out_of_service ? 'Out of Service' : table.status.toUpperCase()}
                                </div>
                                {table.table_type !== 'normal' && (
                                    <div className="text-xs mt-1 opacity-80">
                                        {table.table_type.toUpperCase()}
                                    </div>
                                )}
                                {table.current_session && timeInfo && (
                                    <div className="mt-2 pt-2 border-t border-white/30">
                                        <div className="text-xs">{table.current_session.package_name}</div>
                                        <div className="text-xs">
                                            {table.current_session.adult_count} Adults
                                            {table.current_session.child_count > 0 && `, ${table.current_session.child_count} Kids`}
                                        </div>
                                        <div className={`text-sm font-bold mt-1 ${getWarningColor(timeInfo.warning)}`}>
                                            {timeInfo.warning === 'paused' ? '⏸ PAUSED' :
                                                timeInfo.warning === 'overtime' ? '⚠ OVERTIME' :
                                                    `${timeInfo.minutes} min left`}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Table Details Modal */}
            {selectedTable && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Table {selectedTable.table_number}</h3>

                        <div className="space-y-3">
                            <div>
                                <span className="font-medium">Zone:</span> {selectedTable.zone || 'N/A'}
                            </div>
                            <div>
                                <span className="font-medium">Type:</span> {selectedTable.table_type.toUpperCase()}
                            </div>
                            <div>
                                <span className="font-medium">Capacity:</span> {selectedTable.capacity} people
                            </div>
                            <div>
                                <span className="font-medium">Status:</span>{' '}
                                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(selectedTable)}`}>
                                    {selectedTable.is_out_of_service ? 'Out of Service' : selectedTable.status}
                                </span>
                            </div>

                            {selectedTable.current_session && (
                                <>
                                    <hr className="my-4" />
                                    <h4 className="font-bold">Current Session</h4>
                                    <div>
                                        <span className="font-medium">Package:</span> {selectedTable.current_session.package_name}
                                    </div>
                                    <div>
                                        <span className="font-medium">Guests:</span>{' '}
                                        {selectedTable.current_session.adult_count} Adults
                                        {selectedTable.current_session.child_count > 0 && `, ${selectedTable.current_session.child_count} Kids`}
                                    </div>
                                    <div>
                                        <span className="font-medium">Started:</span>{' '}
                                        {new Date(selectedTable.current_session.start_time).toLocaleTimeString()}
                                    </div>
                                    <div>
                                        <span className="font-medium">Ends:</span>{' '}
                                        {new Date(selectedTable.current_session.end_time).toLocaleTimeString()}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-6">
                            {/* Cleaning → Available */}
                            {selectedTable.status === 'cleaning' && !selectedTable.current_session && (
                                <button
                                    onClick={() => handleChangeStatus(selectedTable.id, 'available')}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                                >
                                    ✅ Mark as Available
                                </button>
                            )}

                            {/* Out of Service Toggle */}
                            {!selectedTable.current_session && (
                                <button
                                    onClick={() => {
                                        if (selectedTable.is_out_of_service) {
                                            handleToggleOutOfService(selectedTable.id);
                                        } else {
                                            const notes = prompt('เหตุผลที่ปิดการใช้งาน (Optional):');
                                            if (notes !== null) { // User didn't cancel
                                                handleToggleOutOfService(selectedTable.id, notes || undefined);
                                            }
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-lg font-semibold ${selectedTable.is_out_of_service
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-orange-600 hover:bg-orange-700'
                                        } text-white`}
                                >
                                    {selectedTable.is_out_of_service ? '🔧 Enable Service' : '🚫 Disable Service'}
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedTable(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 ml-auto"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
