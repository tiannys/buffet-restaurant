import { useState } from 'react';
import { menus } from '@/lib/api';

interface Category {
    id: string;
    name: string;
    description?: string;
    sort_order: number;
    is_active: boolean;
    branch_id?: string;
}

interface CategoryFormData {
    name: string;
    description: string;
    sort_order: string;
    branch_id: string;
    is_active: boolean;
}

export function useCategoryForm() {
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        description: '',
        sort_order: '0',
        branch_id: '',
        is_active: true,
    });
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleSubmit = async (onSuccess: () => void) => {
        try {
            const data = {
                ...formData,
                sort_order: parseInt(formData.sort_order),
            };

            if (editingCategory) {
                await menus.updateCategory(editingCategory.id, data);
                alert('Category updated successfully');
            } else {
                await menus.createCategory(data);
                alert('Category created successfully');
            }

            resetForm();
            onSuccess();
        } catch (error) {
            console.error('Failed to save category:', error);
            alert('Failed to save category');
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            sort_order: category.sort_order.toString(),
            branch_id: category.branch_id || '',
            is_active: category.is_active,
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            sort_order: '0',
            branch_id: '',
            is_active: true,
        });
        setEditingCategory(null);
    };

    return {
        formData,
        setFormData,
        editingCategory,
        handleSubmit,
        handleEdit,
        resetForm,
    };
}

