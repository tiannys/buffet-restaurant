'use client';

import { useEffect, useState } from 'react';
import { tables, branches } from '@/lib/api';
import TableFormModal from '@/components/modals/TableFormModal';

interface TableManagementProps {
    onClose: () => void;
}

interface Branch {
    id: string;
    name: string;
}

interface TableItem {
    id: string;
    table_number: string;
    zone?: string;
    capacity: number;
    branch?: Branch;
    branch_id?: string;
    status?: string;
}

export default function TableManagement({ onClose }: TableManagementProps) {
    const [tableList, setTableList] = useState<TableItem[]>([]);
    const [branchesList, setBranchesList] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTable, setEditingTable] = useState<TableItem | null>(null);
    const [formData, setFormData] = useState({
        table_number: '',
        zone: '',
        capacity: 2,
        branch_id: '',
    });

    useEffect(() => {
        loadTables();
        loadBranches();
    }, []);

    const loadTables = async () => {
        try {
            const response = await tables.getAll();
            setTableList(response.data);
        } catch (error) {
            console.error('Failed to load tables:', error);
            alert('Failed to load tables');
        } finally {
            setLoading(false);
        }
    };

    const loadBranches = async () => {
        try {
            const response = await branches.getAll();
            setBranchesList(response.data);
        } catch (error) {
            console.error('Failed to load branches:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTable) {
                await tables.update(editingTable.id, formData);
                alert('Table updated successfully');
            } else {
                await tables.create(formData);
                alert('Table created successfully');
            }
            setShowModal(false);
            setEditingTable(null);
            resetForm();
            loadTables();
        } catch (error) {
            console.error('Failed to save table:', error);
            alert('Failed to save table');
        }
    };

    const handleEdit = (table: TableItem) => {
        setEditingTable(table);
        setFormData({
            table_number: table.table_number,
            zone: table.zone || '',
            capacity: table.capacity,
            branch_id: table.branch_id || table.branch?.id || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this table?')) return;

        try {
            await tables.delete(id);
            alert('Table deleted successfully');
            loadTables();
        } catch (error) {
            console.error('Failed to delete table:', error);
            alert('Failed to delete table');
        }
    };

    const handleAddNew = () => {
        resetForm();
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            table_number: '',
            zone: '',
            capacity: 2,
            branch_id: branchesList[0]?.id || '',
        });
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-end gap-2">
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Add Table
                </button>
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                    Close
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tableList.map((table) => (
                            <tr key={table.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{table.table_number}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{table.zone || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{table.capacity}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{table.branch?.name || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {table.status || 'available'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => handleEdit(table)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
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

            <TableFormModal
                show={showModal}
                editingTable={editingTable}
                formData={formData}
                branches={branchesList}
                onSubmit={handleSubmit}
                onClose={() => {
                    setShowModal(false);
                    setEditingTable(null);
                    resetForm();
                }}
                onFormDataChange={setFormData}
            />
        </div>
    );
}
