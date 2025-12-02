'use client';

interface Branch {
    id: string;
    name: string;
}

interface Package {
    id: string;
    name: string;
}

interface PackageFormModalProps {
    show: boolean;
    editingPackage: any;
    formData: {
        name: string;
        description: string;
        adult_price: string;
        child_price: string;
        duration_minutes: string;
        branch_id: string;
        parent_package_id: string;
        is_active: boolean;
    };
    branchesList: Branch[];
    packagesList: Package[];
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    onFormDataChange: (data: any) => void;
}

export default function PackageFormModal({
    show,
    editingPackage,
    formData,
    branchesList,
    packagesList,
    onSubmit,
    onClose,
    onFormDataChange,
}: PackageFormModalProps) {
    if (!show) return null;

    // Filter out the current package from parent options to prevent circular reference
    const availableParentPackages = packagesList.filter(
        (pkg) => !editingPackage || pkg.id !== editingPackage.id
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">
                    {editingPackage ? 'Edit Package' : 'Add Package'}
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
                        <label className="block text-sm font-medium mb-2">Adult Price (฿) *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.adult_price}
                            onChange={(e) => onFormDataChange({ ...formData, adult_price: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Child Price (฿) *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.child_price}
                            onChange={(e) => onFormDataChange({ ...formData, child_price: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Duration (minutes) *</label>
                        <input
                            type="number"
                            value={formData.duration_minutes}
                            onChange={(e) => onFormDataChange({ ...formData, duration_minutes: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Branch *</label>
                        <select
                            value={formData.branch_id}
                            onChange={(e) => onFormDataChange({ ...formData, branch_id: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        >
                            <option value="">Select a branch</option>
                            {branchesList.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            Parent Package <span className="text-xs text-gray-500">(Optional - for package inheritance)</span>
                        </label>
                        <select
                            value={formData.parent_package_id}
                            onChange={(e) => onFormDataChange({ ...formData, parent_package_id: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="">None (Base Package)</option>
                            {availableParentPackages.map((pkg) => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.name}
                                </option>
                            ))}
                        </select>
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
                            {editingPackage ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
