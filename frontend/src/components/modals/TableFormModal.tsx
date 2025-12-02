'use client';

interface TableFormModalProps {
    show: boolean;
    editingTable: any;
    formData: {
        table_number: string;
        zone: string;
        capacity: number;
        branch_id: string;
    };
    branches: Array<{ id: string; name: string }>;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    onFormDataChange: (data: any) => void;
}

export default function TableFormModal({
    show,
    editingTable,
    formData,
    branches,
    onSubmit,
    onClose,
    onFormDataChange,
}: TableFormModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">
                    {editingTable ? 'Edit Table' : 'Add New Table'}
                </h3>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Table Number * <span className="text-xs text-gray-500">(e.g., 01, A1, VIP-1)</span>
                        </label>
                        <input
                            type="text"
                            value={formData.table_number}
                            onChange={(e) => onFormDataChange({ ...formData, table_number: e.target.value })}
                            required
                            placeholder="01"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Zone/Section <span className="text-xs text-gray-500">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={formData.zone}
                            onChange={(e) => onFormDataChange({ ...formData, zone: e.target.value })}
                            placeholder="VIP, ชั้น 1, Outdoor"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Capacity *</label>
                        <input
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => onFormDataChange({ ...formData, capacity: parseInt(e.target.value) })}
                            required
                            min="1"
                            max="20"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Branch *</label>
                        <select
                            value={formData.branch_id}
                            onChange={(e) => onFormDataChange({ ...formData, branch_id: e.target.value })}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option value="">Select Branch</option>
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {editingTable ? 'Update Table' : 'Add Table'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
