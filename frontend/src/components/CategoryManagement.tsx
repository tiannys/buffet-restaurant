'use client';

import { useState, useEffect } from 'react';
import { menus, branches } from '@/lib/api';
import { useCategoryForm } from '@/hooks/useCategoryForm';
import CategoryFormModal from '@/components/modals/CategoryFormModal';

interface Category {
    id: string;
    name: string;
    description?: string;
    sort_order: number;
    is_active: boolean;
    branch_id?: string;
}

interface Branch {
    id: string;
    name: string;
}

interface CategoryManagementProps {
    onClose: () => void;
}

export default function CategoryManagement({ onClose }: CategoryManagementProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [branchesList, setBranchesList] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const categoryForm = useCategoryForm();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [categoriesRes, branchesRes] = await Promise.all([
                menus.getCategories(),
                branches.getAll(),
            ]);
            setCategories(categoriesRes.data);
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
        await categoryForm.handleSubmit(() => {
            setShowModal(false);
            loadData();
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
            loadData();
        } catch (error) {
            console.error('Failed to delete category:', error);
            alert('Failed to delete category');
        }
    };

    const handleAddNew = () => {
        categoryForm.resetForm();
        // Auto-select first branch for new categories
        if (branchesList.length > 0) {
            categoryForm.setFormData({
                ...categoryForm.formData,
                branch_id: branchesList[0].id,
            });
        }
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
                branchesList={branchesList}
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
