'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTables: 0,
        totalPackages: 0,
        totalMenuItems: 0,
    });

    useEffect(() => {
        // Check authentication and role
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(userStr);

        // Check if user is Admin (support both string and object format)
        const roleName = userData.role?.name || userData.role;
        if (roleName !== 'Admin') {
            alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
            router.push('/login');
            return;
        }

        setUser(userData);
        loadStats();
    }, [router]);

    const loadStats = async () => {
        // Load dashboard statistics
        // This is a placeholder - implement actual API calls
        setStats({
            totalUsers: 10,
            totalTables: 10,
            totalPackages: 3,
            totalMenuItems: 50,
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        ระบบActions - Admin Dashboard
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700">{user.full_name}</span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-600">ผู้ใช้งานทั้งหมด</div>
                        <div className="text-3xl font-bold text-blue-600 mt-2">{stats.totalUsers}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-600">Total Tables</div>
                        <div className="text-3xl font-bold text-green-600 mt-2">{stats.totalTables}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-600">Packages</div>
                        <div className="text-3xl font-bold text-purple-600 mt-2">{stats.totalPackages}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-sm text-gray-600">Menu Items</div>
                        <div className="text-3xl font-bold text-orange-600 mt-2">{stats.totalMenuItems}</div>
                    </div>
                </div>

                {/* Management Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">User Management</h2>
                        <p className="text-gray-600 mb-4">Manage user accounts and permissionsการเข้าถึง</p>
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Actionsผู้ใช้
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Menu Management</h2>
                        <p className="text-gray-600 mb-4">Add, edit, delete menu items</p>
                        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            Menu Management
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Package Management</h2>
                        <p className="text-gray-600 mb-4">Manage buffet packages</p>
                        <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                            Package Management
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Table Management</h2>
                        <p className="text-gray-600 mb-4">Add, edit, delete tables</p>
                        <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                            Table Management
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Reports</h2>
                        <p className="text-gray-600 mb-4">View sales reports and statistics</p>
                        <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            View Reports
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">System Settings</h2>
                        <p className="text-gray-600 mb-4">ตั้งค่า VAT, Service Charge, Points</p>
                        <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                            ตั้งค่า
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
