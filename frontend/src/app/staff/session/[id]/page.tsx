'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { sessions } from '@/lib/api';
import Image from 'next/image';

export default function SessionDetailPage() {
    const params = useParams();
    const sessionId = params.id as string;
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSession();
    }, [sessionId]);

    const loadSession = async () => {
        try {
            const response = await sessions.getForCustomer(sessionId);
            setSession(response.data);
        } catch (error) {
            console.error('Failed to load session:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8">กำลังโหลด...</div>;
    }

    if (!session) {
        return <div className="p-8">ไม่พบข้อมูลรอบโต๊ะ</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-4xl">
                <div className="rounded-lg bg-white p-8 shadow-lg">
                    <h1 className="mb-6 text-2xl font-bold text-gray-800">
                        รอบโต๊ะ - โต๊ะ {session.session.table_number}
                    </h1>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h2 className="mb-4 text-lg font-semibold">ข้อมูลรอบโต๊ะ</h2>
                            <div className="space-y-2 text-sm">
                                <p><strong>แพ็กเกจ:</strong> {session.session.package_name}</p>
                                <p><strong>เวลาเริ่ม:</strong> {new Date(session.session.start_time).toLocaleString('th-TH')}</p>
                                <p><strong>เวลาสิ้นสุด:</strong> {new Date(session.session.end_time).toLocaleString('th-TH')}</p>
                                <p><strong>เวลาที่เหลือ:</strong> {session.session.remaining_minutes} นาที</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            {session.session.qr_code && (
                                <div className="text-center">
                                    <p className="mb-2 text-sm font-medium">QR Code สำหรับลูกค้า</p>
                                    <img
                                        src={session.session.qr_code}
                                        alt="QR Code"
                                        className="mx-auto h-48 w-48"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="mb-4 text-lg font-semibold">ออเดอร์</h2>
                        {session.orders && session.orders.length > 0 ? (
                            <div className="space-y-4">
                                {session.orders.map((order: any) => (
                                    <div key={order.id} className="rounded border p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="font-medium">ออเดอร์ #{order.id.slice(0, 8)}</span>
                                            <span className={`rounded px-2 py-1 text-sm ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.status === 'served' ? 'bg-green-100 text-green-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            {order.items.map((item: any) => (
                                                <div key={item.id}>
                                                    {item.menu_item.name} x {item.quantity}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">ยังไม่มีออเดอร์</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
