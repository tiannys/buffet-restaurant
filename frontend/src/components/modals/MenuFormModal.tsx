'use client';

interface Category {
    id: string;
    name: string;
}

interface Package {
    id: string;
    name: string;
}

interface Branch {
    id: string;
    name: string;
}

interface MenuFormModalProps {
    show: boolean;
    editingMenu: any;
    formData: {
        name: string;
        description: string;
        category_id: string;
        package_id: string;
        branch_id: string;
        image_url: string;
        is_available: boolean;
    };
    categories: Category[];
    packagesList: Package[];
    branchesList: Branch[];
    imagePreview: string;
    uploading: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    onFormDataChange: (data: any) => void;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function MenuFormModal({
    show,
    editingMenu,
    formData,
    categories,
    packagesList,
    branchesList,
    imagePreview,
    uploading,
    onSubmit,
    onClose,
    onFormDataChange,
    onImageChange,
}: MenuFormModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
                <h3 className="text-xl font-bold mb-4">
                    {editingMenu ? 'Edit Menu Item' : 'Add Menu Item'}
                </h3>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category *</label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => onFormDataChange({ ...formData, category_id: e.target.value })}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                            rows={3}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label>Stock Tracking</label>
                        <select
                            value={formData.stock_quantity === null ? 'unlimited' : 'tracked'}
                            onChange={(e) => {
                                const isUnlimited = e.target.value === 'unlimited';
                                onFormDataChange({
                                    ...formData,
                                    stock_quantity: isUnlimited ? null : 0,
                                });
                            }}
                        >
                            <option value="unlimited">Unlimited (Buffet Item)</option>
                            <option value="tracked">Track Quantity</option>
                        </select>
                    </div>
                    {formData.stock_quantity !== null && (
                        <>
                            <div>
                                <label>Current Stock Quantity</label>
                                <input
                                    type="number"
                                    value={formData.stock_quantity || 0}
                                    onChange={(e) => onFormDataChange({
                                        ...formData,
                                        stock_quantity: parseInt(e.target.value),
                                    })}
                                    min="0"
                                />
                            </div>

                            <div>
                                <label>Low Stock Alert (threshold)</label>
                                <input
                                    type="number"
                                    value={formData.low_stock_threshold || 10}
                                    onChange={(e) => onFormDataChange({
                                        ...formData,
                                        low_stock_threshold: parseInt(e.target.value),
                                    })}
                                    min="0"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Package * <span className="text-xs text-gray-500">(Menu will appear in this package and higher tiers)</span>
                        </label>
                        <select
                            value={formData.package_id}
                            onChange={(e) => onFormDataChange({ ...formData, package_id: e.target.value })}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option value="">Select Package</option>
                            {packagesList.map((pkg) => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.name}
                                </option>
                            ))}
                        </select>
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
                            {branchesList.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="mb-3">
                                <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded" />
                            </div>
                        )}

                        {/* Upload File */}
                        <div className="mb-2">
                            <label className="block text-xs text-gray-600 mb-1">Upload Image (PNG/JPG, max 5MB)</label>
                            <input
                                type="file"
                                accept=".png,.jpg,.jpeg"
                                onChange={onImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        {/* Or URL */}
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Or enter image URL</label>
                            <input
                                type="url"
                                value={formData.image_url}
                                onChange={(e) => {
                                    onFormDataChange({ ...formData, image_url: e.target.value });
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : editingMenu ? 'Save' : 'Add'}
                            </button>
                        </div>
                </form>
            </div>
        </div>
    );
}
