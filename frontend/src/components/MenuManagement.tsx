'use client';

import { useState, useEffect } from 'react';
import { menus, packages as packagesApi } from '@/lib/api';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    category_id: string;
    category?: { id: string; name: string };
    image_url?: string;
    is_available: boolean;
    package_menus?: Array<{ package: { id: string; name: string } }>;
}

interface Category {
    id: string;
    name: string;
}

interface Package {
    id: string;
    name: string;
}

interface MenuManagementProps {
    onClose: () => void;
}

export default function MenuManagement({ onClose }: MenuManagementProps) {
    const [menuList, setMenuList] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [packagesList, setPackagesList] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        package_id: '',
        image_url: '',
        is_available: true,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [menusRes, categoriesRes, packagesRes] = await Promise.all([
                menus.getAll(),
                menus.getCategories(),
                packagesApi.getAll(),
            ]);
            setMenuList(menusRes.data);
            setCategories(categoriesRes.data);
            setPackagesList(packagesRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
            alert('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.match(/^image\/(png|jpg|jpeg)$/)) {
                alert('Only PNG and JPG images are allowed');
                return;
            }
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) return null;

        setUploading(true);
        try {
            const response = await menus.uploadImage(imageFile);
            return response.data.url;
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Failed to upload image');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let imageUrl = formData.image_url;

            // Upload image if file selected
            if (imageFile) {
                const uploadedUrl = await uploadImage();
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            }

            const data = {
                ...formData,
                image_url: imageUrl,
            };

            if (editingMenu) {
                await menus.update(editingMenu.id, data);
                alert('Menu updated successfully');
            } else {
                await menus.create(data);
                alert('Menu created successfully');
            }

            setShowModal(false);
            resetForm();
            loadData();
        } catch (error: any) {
            console.error('Failed to save menu:', error);
            alert(error.response?.data?.message || 'Failed to save menu');
        }
    };

    const handleEdit = (menu: MenuItem) => {
        setEditingMenu(menu);
        setFormData({
            name: menu.name,
            description: menu.description,
            category_id: menu.category_id,
            package_id: menu.package_menus?.[0]?.package?.id || '',
            image_url: menu.image_url || '',
            is_available: menu.is_available,
        });
        if (menu.image_url) {
            setImagePreview(menu.image_url);
        }
        setShowModal(true);
    };

    const handleDelete = async (menu: MenuItem) => {
        if (!confirm(`Are you sure you want to delete "${menu.name}"?`)) return;

        try {
            await menus.delete(menu.id);
            alert('Menu deleted successfully');
            loadData();
        } catch (error) {
            console.error('Failed to delete menu:', error);
            alert('Failed to delete menu');
        }
    };

    const handleToggleAvailability = async (menu: MenuItem) => {
        try {
            await menus.toggleAvailability(menu.id);
            loadData();
        } catch (error) {
            console.error('Failed to toggle availability:', error);
            alert('Failed to update menu status');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category_id: '',
            package_id: '',
            image_url: '',
            is_available: true,
        });
        setEditingMenu(null);
        setImageFile(null);
        setImagePreview('');
    };

    const handleAddNew = () => {
        resetForm();
        setShowModal(true);
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Menu Management</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleAddNew}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        + Add Menu Item
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Menu List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {menuList.map((menu) => (
                            <tr key={menu.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {menu.image_url ? (
                                        <img src={menu.image_url} alt={menu.name} className="h-12 w-12 object-cover rounded" />
                                    ) : (
                                        <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                            No Image
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{menu.name}</div>
                                    <div className="text-sm text-gray-500">{menu.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{menu.category?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {menu.package_menus?.[0]?.package?.name || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleToggleAvailability(menu)}
                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${menu.is_available
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {menu.is_available ? 'Available' : 'Unavailable'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(menu)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(menu)}
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
                        <h3 className="text-xl font-bold mb-4">
                            {editingMenu ? 'Edit Menu Item' : 'Add Menu Item'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                                    <select
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Package * <span className="text-xs text-gray-500">(Menu will appear in this package and higher tiers)</span>
                                </label>
                                <select
                                    value={formData.package_id}
                                    onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
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
                                        onChange={handleImageChange}
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
                                            setFormData({ ...formData, image_url: e.target.value });
                                            if (e.target.value) {
                                                setImagePreview(e.target.value);
                                                setImageFile(null);
                                            }
                                        }}
                                        placeholder="https://example.com/image.jpg"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.is_available}
                                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-900">Available</label>
                            </div>

                            <div className="flex gap-4 justify-end pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
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
            )}
        </div>
    );
}
