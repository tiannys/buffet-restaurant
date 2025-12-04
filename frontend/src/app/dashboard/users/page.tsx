'use client';

import UserManagement from '@/components/UserManagement';

export default function UsersPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>
                <UserManagement />
            </div>
        </div>
    );
}
