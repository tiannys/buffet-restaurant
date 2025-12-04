'use client';

import { useState, useEffect } from 'react';
import { tables, branches } from '@/lib/api';
import { useTableForm } from '@/hooks/useTableForm';
import TableFormModal from '@/components/modals/TableFormModal';

interface Table {
    id: string;
    table_number: string;
    zone: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'cleaning';
    branch_id: string;
    branch?: { id: string; name: string };
    is_active: boolean;
}

interface Branch {
    id: string;
    name: string;
}

interface TableManagementProps {
    onClose: () => void;
}

export default function TableManagement({ onClose }: TableManagementProps) {
    const [tableList, setTableList] = useState<Table[]>([]);
    const [branchesList, setBranchesList] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [filterZone, setFilterZone] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');

    const tableForm = useTableForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [tablesRes, branchesRes] = await Promise.all([
                tables.getAll(),
                branches.getAll(),
            ]);
            setTableList(tablesRes.data);
            setBranchesList(branchesRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await tableForm.handleSubmit(() => {
            setShowModal(false);
            loadData();
        });
    };

    const handleEdit = (table: Table) => {
        tableForm.handleEdit(table);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this table?')) return;

        try {
            await tables.delete(id);
            alert('Table deleted successfully');
            loadData();
        } catch (error) {
            console.error('Failed to delete table:', error);
            alert('Failed to delete table');
        }
    };

    const handleToggleStatus = async (table: Table) => {
        try {
            const statusCycle = {
                available: 'cleaning',
                cleaning: 'available',
                occupied: 'available',
                reserved: 'available',
            };
            const newStatus = statusCycle[table.status] || 'available';
            await tables.updateStatus(table.id, newStatus);
            loadData();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update table status');
        }
    };

    const handleAddNew = () => {
        tableForm.resetForm();
        setShowModal(true);
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    // Get unique zones
    const zones = Array.from(new Set(tableList.map(t => t.zone).filter(Boolean)));

    // Filter tables
    const filteredTables = tableList.filter((table) => {
        if (filterZone && table.zone !== filterZone) return false;
        if (filterStatus && table.status !== filterStatus) return false;
        return true;
    });

    return (
        <div className="space-y-6 p-4">
            {/* Action Buttons */}
            <div className="flex justify-end">
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Add Table
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Zone
                        </label>
                        <select
                            value={filterZone}
                            onChange={(e) => setFilterZone(e.target.value)}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option value="">All Zones</option>
                            {zones.map((zone) => (
                                <option key={zone} value={zone}>
                                    {zone}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Status
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="block w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option value="">All Status</option>
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="cleaning">Cleaning</option>
                            <option value="reserved">Reserved</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Table Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Zone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Capacity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Branch
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTables.map((table) => (
                            <tr key={table.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {table.table_number}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{table.zone || '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{table.capacity} seats</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{table.branch?.name || '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleToggleStatus(table)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${table.status === 'available'
                                                ? 'bg-green-100 text-green-800'
                                                : table.status === 'occupied'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : table.status === 'cleaning'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {table.status === 'available' && '🟢 Available'}
                                        {table.status === 'occupied' && '🔵 Occupied'}
                                        {table.status === 'cleaning' && '🟡 Cleaning'}
                                        {table.status === 'reserved' && '🔴 Reserved'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(table)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(table.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <TableFormModal
                show={showModal}
                editingTable={tableForm.editingTable}
                formData={tableForm.formData}
                branches={branchesList}
                onSubmit={handleSubmit}
                onClose={() => {
                    setShowModal(false);
                    tableForm.resetForm();
                }}
                onFormDataChange={tableForm.setFormData}
            />
        </div>
    );
}
