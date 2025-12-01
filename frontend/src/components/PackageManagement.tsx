'use client';

import { useState, useEffect } from 'react';
import { packages, branches } from '@/lib/api';

interface PackageManagementProps {
    onClose: () => void;
}

export default function PackageManagement({ onClose }: PackageManagementProps) {
    const [packageList, setPackageList] = useState<any[]>([]);
    const [branchesList, setBranchesList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        adult_price: '',
        child_price: '',
        duration_minutes: '',
        branch_id: '',
        is_active: true,
    });

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
        try {
            const data = {
                ...formData,
                adult_price: parseFloat(formData.adult_price),
                child_price: parseFloat(formData.child_price),
                duration_minutes: parseInt(formData.duration_minutes),
            };

            if (editingPackage) {
                await packages.update(editingPackage.id, data);
                alert('Package updated successfully');
            } else {
                await packages.create(data);
                alert('Package created successfully');
            }

            setShowModal(false);
            resetForm();
            loadPackages();
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
            is_active: pkg.is_active,
        });
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

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            adult_price: '',
            child_price: '',
            duration_minutes: '',
            branch_id: '',
            is_active: true,
        });
        setEditingPackage(null);
    };

    const handleAddNew = () => {
        resetForm();
        setShowModal(true);
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Package Management</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleAddNew}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Add Package
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
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
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">
                            {editingPackage ? 'Edit Package' : 'Add Package'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    rows={3}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Adult Price (฿)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.adult_price}
                                    onChange={(e) => setFormData({ ...formData, adult_price: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Child Price (฿)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.child_price}
                                    onChange={(e) => setFormData({ ...formData, child_price: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={formData.duration_minutes}
                                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Branch</label>
                                <select
                                    value={formData.branch_id}
                                    onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
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
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm font-medium">Active</span>
                                </label>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
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
            )}
        </div>
    );
}
