'use client';

import TableDashboard from '@/components/TableDashboard';

export default function TablesPage() {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto">
                <div className="py-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 px-6">Table Dashboard</h1>
                    <TableDashboard />
                </div>
            </div>
        </div>
    );
}
