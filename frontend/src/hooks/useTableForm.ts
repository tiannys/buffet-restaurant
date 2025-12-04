import { useState } from 'react';
import { tables } from '@/lib/api';

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

interface TableFormData {
    table_number: string;
    zone: string;
    capacity: number;
    branch_id: string;
}

export function useTableForm() {
    const [formData, setFormData] = useState<TableFormData>({
        table_number: '',
        zone: '',
        capacity: 4,
        branch_id: '',
    });
    const [editingTable, setEditingTable] = useState<Table | null>(null);

    const handleSubmit = async (onSuccess: () => void) => {
        try {
            if (editingTable) {
                await tables.update(editingTable.id, formData);
                alert('Table updated successfully');
            } else {
                await tables.create(formData);
                alert('Table created successfully');
            }
            resetForm();
            onSuccess();
        } catch (error: any) {
            console.error('Failed to save table:', error);
            alert(error.response?.data?.message || 'Failed to save table');
        }
    };

    const handleEdit = (table: Table) => {
        setEditingTable(table);
        setFormData({
            table_number: table.table_number,
            zone: table.zone || '',
            capacity: table.capacity,
            branch_id: table.branch_id,
        });
    };

    const resetForm = () => {
        setFormData({
            table_number: '',
            zone: '',
            capacity: 4,
            branch_id: '',
        });
        setEditingTable(null);
    };

    return {
        formData,
        setFormData,
        editingTable,
        handleSubmit,
        handleEdit,
        resetForm,
    };
}
