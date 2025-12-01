'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { users, roles as rolesApi, branches as branchesApi } from '@/lib/api';

interface User {
    id: string;
    username: string;
    full_name: string;
    role: any;
    branch_id: string;
}

interface UserManagementProps {
    onClose: () => void;
}

export default function UserManagement({ onClose }: UserManagementProps) {
    const [userList, setUserList] = useState<User[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role_id: '',
        branch_id: '',
    });

    useEffect(() => {
        loadUsers();
        loadRoles();
        loadBranches();
    }, []);

    const loadRoles = async () => {
        try {
            // ดึง roles ทั้งหมดจาก database
            const response = await rolesApi.getAll();
            setRoles(response.data);
        } catch (error) {
            console.error('Failed to load roles:', error);
        }
    };

    const loadBranches = async () => {
        try {
            // ดึง branches ทั้งหมดจาก database
            const response = await branchesApi.getAll();
            setBranches(response.data);
        } catch (error) {
            console.error('Failed to load branches:', error);
        }
    };

    const loadUsers = async () => {
        try {
            const response = await users.getAll();
            setUserList(response.data);
        } catch (error) {
            console.error('Failed to load users:', error);
            alert('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            password: '',
            full_name: '',
            role_id: roles.length > 0 ? roles[0].id : '',
            branch_id: branches.length > 0 ? branches[0].id : '',
        });
        setShowModal(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: '',
            full_name: user.full_name,
            role_id: typeof user.role === 'object' ? user.role?.id : '',
            branch_id: user.branch_id,
        });
        setShowModal(true);
    };

    const handleDelete = async (user: User) => {
        if (!confirm(`Are you sure you want to delete user "${user.full_name}" ?`)) return;

        try {
            await users.delete(user.id);
            alert('User deleted successfully');
            loadUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingUser) {
                await users.update(editingUser.id, formData);
                alert('User updated successfully');
            } else {
                await users.create(formData);
                alert('User created successfully');
            }
            setShowModal(false);
            loadUsers();
        } catch (error: any) {
            console.error('Failed to save user:', error);
            alert(error.response?.data?.message || 'Failed to save user');
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">User Management</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        + Add User
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* User List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Username
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Full Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Role
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {userList.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user.full_name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role?.name === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                        user.role?.name === 'Staff' ? 'bg-blue-100 text-blue-800' :
                                            user.role?.name === 'Cashier' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role?.name || user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user)}
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
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingUser ? 'Edit User' : 'Add User'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            disabled={!!editingUser}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                        />
                    </div>

                    {!editingUser && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!editingUser}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                            value={formData.role_id}
                            onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option value="">Select Role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Branch</label>
                        <select
                            value={formData.branch_id}
                            onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option value="">Select Branch</option>
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4 justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {editingUser ? 'Save' : 'Add'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
