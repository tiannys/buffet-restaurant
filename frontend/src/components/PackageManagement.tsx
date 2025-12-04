'use client';

import { useState, useEffect } from 'react';
import { packages, branches } from '@/lib/api';
import { usePackageForm } from '@/hooks/usePackageForm';
import PackageFormModal from '@/components/modals/PackageFormModal';

interface PackageManagementProps {
    onClose?: () => void;
}

export default function PackageManagement({ onClose }: PackageManagementProps) {
    const [packageList, setPackageList] = useState<any[]>([]);
    const [branchesList, setBranchesList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const packageForm = usePackageForm();

    useEffect(() => {
        loadPackages();
        loadBranches();
    }, []);

    const loadPackages = async () => {
        try {
            const response = await packages.getAll();
            setPackageList(response.data);
        } catch (error) {
            console.error('Failed to load packages:', error);
            alert('Failed to load packages');
        } finally {
            setLoading(false);
        }
    };

    const loadBranches = async () => {
        try {
            const response = await branches.getAll();
            setBranchesList(response.data);
        } catch (error) {
            console.error('Failed to load branches:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await packageForm.handleSubmit(() => {
            setShowModal(false);
            loadPackages();
        });
    };

    const handleEdit = (pkg: any) => {
        packageForm.handleEdit(pkg);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this package?')) return;

        try {
            await packages.delete(id);
            alert('Package deleted successfully');
            loadPackages();
        } catch (error) {
            console.error('Failed to delete package:', error);
            alert('Failed to delete package');
        }
    };

    const handleToggleActive = async (pkg: any) => {
        try {
            await packages.update(pkg.id, {
                ...pkg,
                is_active: !pkg.is_active,
            });
            loadPackages();
        } catch (error) {
            console.error('Failed to toggle package status:', error);
            alert('Failed to update package status');
        }
    };

    const handleAddNew = () => {
        packageForm.resetForm();
        setShowModal(true);
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-4 space-y-6">
            {/* Action Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Add Package
                </button>
            </div>

            {/* Package List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adult Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Child Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {packageList.map((pkg) => (
                            <tr key={pkg.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{pkg.name}</td>
                                <td className="px-6 py-4">{pkg.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap">฿{pkg.adult_price}</td>
                                <td className="px-6 py-4 whitespace-nowrap">฿{pkg.child_price}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{pkg.duration_minutes} min</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {pkg.parent_package?.name || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleToggleActive(pkg)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${pkg.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {pkg.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onClick={() => handleEdit(pkg)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pkg.id)}
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
            <PackageFormModal
                show={showModal}
                editingPackage={packageForm.editingPackage}
                formData={packageForm.formData}
                branchesList={branchesList}
                packagesList={packageList}
                onSubmit={handleSubmit}
                onClose={() => {
                    setShowModal(false);
                    packageForm.resetForm();
                }}
                onFormDataChange={packageForm.setFormData}
            />
        </div>
    );
}
