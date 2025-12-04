import { useState } from 'react';
import { packages } from '@/lib/api';

interface PackageFormData {
    name: string;
    description: string;
    adult_price: string;
    child_price: string;
    duration_minutes: string;
    branch_id: string;
    parent_package_id: string;
    is_active: boolean;
}

export function usePackageForm() {
    const [formData, setFormData] = useState<PackageFormData>({
        name: '',
        description: '',
        adult_price: '',
        child_price: '',
        duration_minutes: '',
        branch_id: '',
        parent_package_id: '',
        is_active: true,
    });
    const [editingPackage, setEditingPackage] = useState<any>(null);

    const handleSubmit = async (onSuccess: () => void) => {
        try {
            const data = {
                ...formData,
                adult_price: parseFloat(formData.adult_price),
                child_price: parseFloat(formData.child_price),
                duration_minutes: parseInt(formData.duration_minutes),
                parent_package_id: formData.parent_package_id || null,
            };

            if (editingPackage) {
                await packages.update(editingPackage.id, data);
                alert('Package updated successfully');
            } else {
                await packages.create(data);
                alert('Package created successfully');
            }

            resetForm();
            onSuccess();
        } catch (error) {
            console.error('Failed to save package:', error);
            alert('Failed to save package');
        }
    };

    const handleEdit = (pkg: any) => {
        setEditingPackage(pkg);
        setFormData({
            name: pkg.name,
            description: pkg.description || '',
            adult_price: pkg.adult_price?.toString() || '',
            child_price: pkg.child_price?.toString() || '',
            duration_minutes: pkg.duration_minutes.toString(),
            branch_id: pkg.branch_id || '',
            parent_package_id: pkg.parent_package_id || '',
            is_active: pkg.is_active,
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            adult_price: '',
            child_price: '',
            duration_minutes: '',
            branch_id: '',
            parent_package_id: '',
            is_active: true,
        });
        setEditingPackage(null);
    };

    return {
        formData,
        setFormData,
        editingPackage,
        handleSubmit,
        handleEdit,
        resetForm,
    };
}
