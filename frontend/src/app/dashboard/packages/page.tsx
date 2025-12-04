'use client';

import PackageManagement from '@/components/PackageManagement';

export default function PackagesPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Package Management</h1>
                <PackageManagement />
            </div>
        </div>
    );
}
