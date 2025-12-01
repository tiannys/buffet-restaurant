'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tables, sessions } from '@/lib/api';

export default function StaffDashboard() {
    const router = useRouter();
    const [dashboard, setDashboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication and role
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(userStr);
        const roleName = userData.role?.name || userData.role;

        // Only Staff and Admin can access
        if (roleName !== 'Staff' && roleName !== 'Admin') {
            alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
            router.push('/login');
            return;
        }

        loadDashboard();
    }, [router]);

    const loadDashboard = async () => {
        try {
            const response = await tables.getDashboard();
            setDashboard(response.data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartSession = (tableId: string) => {
        router.push(`/staff/start-session?table_id=${tableId}`);
    };

    if (loading) {
        return <div className="p-8">กำลังโหลด...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">แดชบอร์ดโต๊ะ</h1>
                <div className="mt-4 grid grid-cols-4 gap-4">
                    <div className="rounded-lg bg-white p-4 shadow">
                        <div className="text-2xl font-bold text-gray-800">{dashboard?.summary.total}</div>
                        <div className="text-sm text-gray-600">โต๊ะทั้งหมด</div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4 shadow">
                        <div className="text-2xl font-bold text-green-600">{dashboard?.summary.available}</div>
                        <div className="text-sm text-green-700">ว่าง</div>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-4 shadow">
                        <div className="text-2xl font-bold text-blue-600">{dashboard?.summary.occupied}</div>
                        <div className="text-sm text-blue-700">มีลูกค้า</div>
                    </div>
                    <div className="rounded-lg bg-yellow-50 p-4 shadow">
                        <div className="text-2xl font-bold text-yellow-600">{dashboard?.summary.cleaning}</div>
                        <div className="text-sm text-yellow-700">กำลังทำความสะอาด</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {dashboard?.tables.map((table: any) => (
                    <div
                        key={table.id}
                        className={`rounded-lg p-6 shadow-lg ${table.status === 'available'
                            ? 'bg-green-100 border-2 border-green-300'
                            : table.status === 'occupied'
                                ? 'bg-blue-100 border-2 border-blue-300'
                                : 'bg-gray-100 border-2 border-gray-300'
                            }`}
                    >
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-800">โต๊ะ {table.table_number}</div>
                            <div className="mt-2 text-sm text-gray-600">
                                {table.zone && `โซน: ${table.zone}`}
                            </div>
                            <div className="mt-2 text-sm font-medium">
                                {table.status === 'available' && (
                                    <span className="text-green-700">ว่าง</span>
                                )}
                                {table.status === 'occupied' && (
                                    <span className="text-blue-700">มีลูกค้า</span>
                                )}
                                {table.status === 'cleaning' && (
                                    <span className="text-yellow-700">ทำความสะอาด</span>
                                )}
                            </div>
                            {table.status === 'available' && (
                                <button
                                    onClick={() => handleStartSession(table.id)}
                                    className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                >
                                    เริ่มรอบโต๊ะ
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
