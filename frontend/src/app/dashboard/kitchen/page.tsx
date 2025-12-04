'use client';

import { useEffect, useState } from 'react';
import { orders } from '@/lib/api';
import { useSettings } from '@/hooks/useSettings';
import { useDynamicTitle } from '@/hooks/useDynamicTitle';

interface OrderItem {
    id: string;
    menu_item: {
        name: string;
        name_th?: string;
    };
    quantity: number;
    notes?: string;
}

interface Order {
    id: string;
    session: {
        table: {
            table_number: string;
        };
    };
    items: OrderItem[];
    status: string;
    created_at: string;
}

export default function KitchenPage() {
    const { settings: shopSettings } = useSettings();
    useDynamicTitle('ครัว');
    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const loadOrders = async () => {
        try {
            const response = await orders.getPending();
            setPendingOrders(response.data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        try {
            await orders.updateStatus(orderId, newStatus);
            loadOrders();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'preparing':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'ready':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'รอทำ';
            case 'preparing':
                return 'กำลังทำ';
            case 'ready':
                return 'เสร็จแล้ว';
            default:
                return status;
        }
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">🍳 {shopSettings?.restaurant_name || 'ระบบจัดการร้านบุฟเฟ่ต์'} - ครัว</h1>
                    <div className="flex items-center gap-4">
                        <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
                            {pendingOrders.filter(o => o.status === 'pending').length} รอทำ
                        </span>
                        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold">
                            {pendingOrders.filter(o => o.status === 'preparing').length} กำลังทำ
                        </span>
                    </div>
                </div>

                {pendingOrders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="text-6xl mb-4">✨</div>
                        <h3 className="text-xl font-semibold text-gray-700">ไม่มีรายการอาหารที่ต้องทำ</h3>
                        <p className="text-gray-500 mt-2">รายการใหม่จะปรากฏที่นี่</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 hover:shadow-xl transition-shadow"
                            >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-2xl font-bold">
                                                โต๊ะ {order.session.table.table_number}
                                            </h3>
                                            <p className="text-sm opacity-90">
                                                {new Date(order.created_at).toLocaleTimeString('th-TH')}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="p-4">
                                    <div className="space-y-3">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-start border-b border-gray-100 pb-2">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">
                                                        {item.menu_item.name_th || item.menu_item.name}
                                                    </p>
                                                    {item.notes && (
                                                        <p className="text-sm text-orange-600 mt-1">
                                                            📝 {item.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="ml-4 px-3 py-1 bg-gray-100 text-gray-800 rounded-full font-bold">
                                                    x{item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-4 bg-gray-50 border-t border-gray-200">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, 'preparing')}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                                        >
                                            ✋ เริ่มทำ
                                        </button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, 'ready')}
                                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                                        >
                                            ✅ เสร็จแล้ว
                                        </button>
                                    )}
                                    {order.status === 'ready' && (
                                        <div className="text-center py-3 text-green-600 font-semibold">
                                            ✅ พร้อมเสิร์ฟแล้ว
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
