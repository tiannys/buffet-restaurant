'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tables, sessions, billing, loyalty, orders, users, packages, menus } from '@/lib/api';
import UserManagement from '@/components/UserManagement';
import MenuManagement from '@/components/MenuManagement';
import PackageManagement from '@/components/PackageManagement';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Admin stats
    const [adminStats, setAdminStats] = useState({
        totalUsers: 0,
        totalTables: 0,
        totalPackages: 0,
        totalMenuItems: 0,
    });

    // Staff data
    const [tableDashboard, setTableDashboard] = useState<any>(null);

    // Cashier data
    const [activeSessions, setActiveSessions] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [billCalculation, setBillCalculation] = useState<any>(null);

    // Kitchen data
    const [pendingOrders, setPendingOrders] = useState<any[]>([]);

    // Management modals
    const [showUserManagement, setShowUserManagement] = useState(false);
    const [showMenuManagement, setShowMenuManagement] = useState(false);
    const [showPackageManagement, setShowPackageManagement] = useState(false);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);
        setLoading(false);

        // Load data based on role
        const roleName = userData.role?.name || userData.role;
        loadDataForRole(roleName);
    }, [router]);

    const loadDataForRole = async (role: string) => {
        switch (role) {
            case 'Admin':
                loadAdminData();
                break;
            case 'Staff':
                loadStaffData();
                break;
            case 'Cashier':
                loadCashierData();
                break;
            case 'Kitchen':
                loadKitchenData();
                break;
        }
    };

    const loadAdminData = async () => {
        try {
            // Load real data from APIs
            const [usersRes, tablesRes, packagesRes, menusRes] = await Promise.all([
                users.getAll(),
                tables.getAll(),
                packages.getAll(),
                menus.getAll(),
            ]);

            setAdminStats({
                totalUsers: usersRes.data.length,
                totalTables: tablesRes.data.length,
                totalPackages: packagesRes.data.length,
                totalMenuItems: menusRes.data.length,
            });
        } catch (error) {
            console.error('Failed to load admin stats:', error);
        }
    };

    const loadStaffData = async () => {
        try {
            const response = await tables.getDashboard();
            setTableDashboard(response.data);
        } catch (error) {
            console.error('Failed to load table dashboard:', error);
        }
    };

    const loadCashierData = async () => {
        try {
            const response = await sessions.getActive();
            setActiveSessions(response.data);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    };

    const loadKitchenData = async () => {
        try {
            const response = await orders.getPending();
            setPendingOrders(response.data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    const roleName = user.role?.name || user.role;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Buffet Restaurant Management System
                        </h1>
                        <p className="text-sm text-gray-600">Role: {roleName}</p>
                    </div>
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
                {roleName === 'Admin' && <AdminDashboard
                    stats={adminStats}
                    onShowUserManagement={() => setShowUserManagement(true)}
                    onShowMenuManagement={() => setShowMenuManagement(true)}
                    onShowPackageManagement={() => setShowPackageManagement(true)}
                />}
                {roleName === 'Staff' && <StaffDashboard dashboard={tableDashboard} />}
                {roleName === 'Cashier' && (
                    <CashierDashboard
                        sessions={activeSessions}
                        selectedSession={selectedSession}
                        setSelectedSession={setSelectedSession}
                        billCalculation={billCalculation}
                        setBillCalculation={setBillCalculation}
}

// Admin Dashboard Component
                function AdminDashboard({stats, onShowUserManagement, onShowMenuManagement, onShowPackageManagement}: any) {
    return (
                <div>
                    <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="text-sm text-gray-600">Total Users</div>
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
                            <h3 className="text-lg font-bold mb-2">User Management</h3>
                            <p className="text-gray-600 text-sm mb-4">Manage user accounts and permissions</p>
                            <button
                                onClick={onShowUserManagement}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Manage Users
                            </button>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-bold mb-2">Menu Management</h3>
                            <p className="text-gray-600 text-sm mb-4">Add, edit, delete menu items</p>
                            <button
                                onClick={onShowMenuManagement}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Menu Management
                            </button>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-bold mb-2">Package Management</h3>
                            <p className="text-gray-600 text-sm mb-4">Manage buffet packages</p>
                            <button
                                onClick={onShowPackageManagement}
                                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                Package Management
                            </button>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-bold mb-2">Table Management</h3>
                            <p className="text-gray-600 text-sm mb-4">Add, edit, delete tables</p>
                            <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                                Table Management
                            </button>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-bold mb-2">Reports</h3>
                            <p className="text-gray-600 text-sm mb-4">View sales reports and statistics</p>
                            <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                View Reports
                            </button>
                        </div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-bold mb-2">System Settings</h3>
                            <p className="text-gray-600 text-sm mb-4">Settings VAT, Service Charge</p>
                            <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                                Settings
                            </button>
                        </div>
                    </div>
                </div>
                );
}

                // Staff Dashboard Component
                function StaffDashboard({dashboard}: any) {
    if (!dashboard) {
        return <div>Loading tables...</div>;
    }

                return (
                <div>
                    <h2 className="text-xl font-bold mb-6">Table Dashboard</h2>

                    {/* Summary */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-2xl font-bold">{dashboard.summary?.total || 0}</div>
                            <div className="text-sm text-gray-600">Total Tables</div>
                        </div>
                        <div className="bg-green-50 rounded-lg shadow p-4">
                            <div className="text-2xl font-bold text-green-600">{dashboard.summary?.available || 0}</div>
                            <div className="text-sm text-green-700">ว่าง</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg shadow p-4">
                            <div className="text-2xl font-bold text-blue-600">{dashboard.summary?.occupied || 0}</div>
                            <div className="text-sm text-blue-700">มีลูกค้า</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg shadow p-4">
                            <div className="text-2xl font-bold text-yellow-600">{dashboard.summary?.cleaning || 0}</div>
                            <div className="text-sm text-yellow-700">ทำความสะอาด</div>
                        </div>
                    </div>

                    {/* Tables Grid */}
                    <div className="grid grid-cols-4 gap-4">
                        {dashboard.tables?.map((table: any) => (
                            <div
                                key={table.id}
                                className={`rounded-lg p-6 shadow-lg text-center ${table.status === 'available'
                                    ? 'bg-green-100 border-2 border-green-300'
                                    : table.status === 'occupied'
                                        ? 'bg-blue-100 border-2 border-blue-300'
                                        : 'bg-gray-100 border-2 border-gray-300'
                                    }`}
                            >
                                <div className="text-2xl font-bold">Table {table.table_number}</div>
                                <div className="text-sm text-gray-600 mt-2">{table.zone}</div>
                                <div className="text-sm font-medium mt-2">
                                    {table.status === 'available' && <span className="text-green-700">ว่าง</span>}
                                    {table.status === 'occupied' && <span className="text-blue-700">มีลูกค้า</span>}
                                    {table.status === 'cleaning' && <span className="text-yellow-700">ทำความสะอาด</span>}
                                </div>
                                {table.status === 'available' && (
                                    <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                        Start Session
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                );
}

                // Cashier Dashboard Component
                function CashierDashboard({sessions, selectedSession, setSelectedSession, billCalculation, setBillCalculation, onReload}: any) {
    const handleSelectSession = async (session: any) => {
                    setSelectedSession(session);
                try {
            const response = await billing.calculateBill(session.id);
                setBillCalculation(response.data);
        } catch (error) {
                    console.error('Failed to calculate bill:', error);
        }
    };

                return (
                <div>
                    <h2 className="text-xl font-bold mb-6">ระบบแคชเชียร์</h2>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Active Sessions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-bold mb-4">Active Tables</h3>
                            <div className="space-y-2">
                                {sessions.map((session: any) => (
                                    <button
                                        key={session.id}
                                        onClick={() => handleSelectSession(session)}
                                        className={`w-full text-left p-4 rounded-lg border hover:bg-blue-50 ${selectedSession?.id === session.id ? 'border-blue-500 bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="font-medium">Table {session.table?.table_number}</div>
                                        <div className="text-sm text-gray-600">{session.package?.name}</div>
                                        <div className="text-sm text-gray-600">
                                            ผู้ใหญ่ {session.adult_count} / เด็ก {session.child_count}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Bill Calculation */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-bold mb-4">คำนวณบิล</h3>
                            {billCalculation ? (
                                <div className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>ผู้ใหญ่ {billCalculation.adult_count} x {billCalculation.adult_price}</span>
                                            <span>{billCalculation.adult_count * billCalculation.adult_price} บาท</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>เด็ก {billCalculation.child_count} x {billCalculation.child_price}</span>
                                            <span>{billCalculation.child_count * billCalculation.child_price} บาท</span>
                                        </div>
                                        <div className="border-t pt-2">
                                            <div className="flex justify-between font-medium">
                                                <span>ยอดรวม</span>
                                                <span>{billCalculation.subtotal} บาท</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Service Charge ({billCalculation.service_charge_percent}%)</span>
                                            <span>{billCalculation.service_charge?.toFixed(2)} บาท</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>VAT ({billCalculation.vat_percent}%)</span>
                                            <span>{billCalculation.vat?.toFixed(2)} บาท</span>
                                        </div>
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between text-2xl font-bold text-blue-600">
                                            <span>ยอดชำระ</span>
                                            <span>{billCalculation.grand_total?.toFixed(2)} บาท</span>
                                        </div>
                                    </div>
                                    <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium">
                                        ชำระเงิน
                                    </button>
                                </div>
                            ) : (
                                <p className="text-gray-600">Select a table to calculate bill</p>
                            )}
                        </div>
                    </div>
                </div>
                );
}

                // Kitchen Dashboard Component
                function KitchenDashboard({orders, onReload}: any) {
    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
                    await orders.updateStatus(orderId, status);
                onReload();
        } catch (error) {
                    console.error('Failed to update order status:', error);
        }
    };

                return (
                <div>
                    <h2 className="text-xl font-bold mb-6">รายการออเดอร์</h2>

                    <div className="grid grid-cols-1 gap-4">
                        {orders.map((order: any) => (
                            <div key={order.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="text-lg font-bold">Table {order.session?.table?.table_number}</div>
                                        <div className="text-sm text-gray-600">
                                            {new Date(order.created_at).toLocaleTimeString('th-TH')}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                        {order.status === 'pending' ? 'รอทำ' :
                                            order.status === 'preparing' ? 'กำลังทำ' : 'เสร็จแล้ว'}
                                    </span>
                                </div>
                                <div className="space-y-2 mb-4">
                                    {order.items?.map((item: any) => (
                                        <div key={item.id} className="flex justify-between">
                                            <span>{item.menu_item?.name}</span>
                                            <span className="text-gray-600">x{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            เริ่มทำ
                                        </button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, 'ready')}
                                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                        >
                                            เสร็จแล้ว
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                );
}
