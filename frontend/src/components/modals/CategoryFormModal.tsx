'use client';

interface CategoryFormModalProps {
    show: boolean;
    editingCategory: any;
    formData: {
        name: string;
        description: string;
        sort_order: string;
        is_active: boolean;
    };
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    onFormDataChange: (data: any) => void;
}

export default function CategoryFormModal({
    show,
    editingCategory,
    formData,
    onSubmit,
    onClose,
    onFormDataChange,
}: CategoryFormModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">
                    {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <form onSubmit={onSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            rows={3}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Sort Order</label>
                        <input
                            type="number"
                            value={formData.sort_order}
                            onChange={(e) => onFormDataChange({ ...formData, sort_order: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => onFormDataChange({ ...formData, is_active: e.target.checked })}
                                className="mr-2"
                            />
                            <span className="text-sm font-medium">Active</span>
                        </label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {editingCategory ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
