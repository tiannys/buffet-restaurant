'use client';

import { useState, useEffect } from 'react';
import { menus } from '@/lib/api';
import { useCategoryForm } from '@/hooks/useCategoryForm';
import CategoryFormModal from '@/components/modals/CategoryFormModal';

interface Category {
    id: string;
    name: string;
    description?: string;
    sort_order: number;
    is_active: boolean;
}

interface CategoryManagementProps {
    onClose: () => void;
}

export default function CategoryManagement({ onClose }: CategoryManagementProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const categoryForm = useCategoryForm();

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await menus.getCategories();
            setCategories(response.data);
        } catch (error) {
            console.error('Failed to load categories:', error);
            alert('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await categoryForm.handleSubmit(() => {
            setShowModal(false);
            loadCategories();
        });
    };

    const handleEdit = (category: Category) => {
        categoryForm.handleEdit(category);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await menus.deleteCategory(id);
            alert('Category deleted successfully');
            loadCategories();
        } catch (error) {
            console.error('Failed to delete category:', error);
            alert('Failed to delete category');
        }
    };

    const handleAddNew = () => {
        categoryForm.resetForm();
        setShowModal(true);
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Category Management</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleAddNew}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Add Category
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        Back to Menus
                    </button>
                </div>
            </div>

            {/* Category List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sort Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{category.name}</td>
                                <td className="px-6 py-4">{category.description || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{category.sort_order}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${category.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {category.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
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
            <CategoryFormModal
                show={showModal}
                editingCategory={categoryForm.editingCategory}
                formData={categoryForm.formData}
                onSubmit={handleSubmit}
                onClose={() => {
                    setShowModal(false);
                    categoryForm.resetForm();
                }}
                onFormDataChange={categoryForm.setFormData}
            />
        </div>
    );
}
