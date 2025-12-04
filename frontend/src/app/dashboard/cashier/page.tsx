'use client';

import { useEffect, useState } from 'react';
import { sessions, billing } from '@/lib/api';
import PaymentModal from '@/components/modals/PaymentModal';
import { useSettings } from '@/hooks/useSettings';
import { useDynamicTitle } from '@/hooks/useDynamicTitle';

interface Session {
    id: string;
    table: {
        id: string;
        table_number: string;
    };
    package: {
        name: string;
    };
    adult_count: number;
    child_count: number;
    start_time: string;
    status: string;
}

interface BillCalculation {
    session_id: string;
    adult_count: number;
    child_count: number;
    adult_price: number;
    child_price: number;
    subtotal: number;
    service_charge: number;
    service_charge_percent: number;
    vat: number;
    vat_percent: number;
    grand_total: number;
    promptpay_qr_url?: string;
}

export default function CashierPage() {
    const { settings: shopSettings } = useSettings();
    useDynamicTitle('แคชเชียร์');
    const [activeSessions, setActiveSessions] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [billCalculation, setBillCalculation] = useState<BillCalculation | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        loadSessions();
        const interval = setInterval(loadSessions, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadSessions = async () => {
        try {
            const response = await sessions.getActive();
            setActiveSessions(response.data);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSession = async (session: Session) => {
        setSelectedSession(session);
        try {
            const response = await billing.calculateBill(session.id);
            setBillCalculation(response.data);
        } catch (error) {
            console.error('Failed to calculate bill:', error);
            alert('Failed to calculate bill');
        }
    };

    const handlePaymentSuccess = () => {
        setShowPaymentModal(false);
        setSelectedSession(null);
        setBillCalculation(null);
        loadSessions();
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">💰 {shopSettings?.restaurant_name || 'ระบบจัดการร้านบุฟเฟ่ต์'} - แคชเชียร์</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Active Sessions */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-4 bg-purple-600 text-white">
                            <h3 className="font-bold text-lg">Active Sessions</h3>
                            <p className="text-sm opacity-90">{activeSessions.length} sessions</p>
                        </div>
                        <div className="divide-y divide-gray-200 max-h-[calc(100vh-250px)] overflow-y-auto">
                            {activeSessions.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <div className="text-4xl mb-2">📋</div>
                                    <p>No active sessions</p>
                                </div>
                            ) : (
                                activeSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        onClick={() => handleSelectSession(session)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSession?.id === session.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-900">
                                                    โต๊ะ {session.table.table_number}
                                                </h4>
                                                <p className="text-sm text-gray-600">{session.package.name}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {session.adult_count} Adults
                                                    {session.child_count > 0 && `, ${session.child_count} Kids`}
                                                </p>
                                            </div>
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                                                Active
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Started: {new Date(session.start_time).toLocaleTimeString('th-TH')}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Bill Details */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
                        {billCalculation && selectedSession ? (
                            <div className="flex flex-col h-full">
                                {/* Header */}
                                <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                                    <h3 className="font-bold text-2xl">Bill Details</h3>
                                    <p className="text-sm opacity-90 mt-1">
                                        โต๊ะ {selectedSession.table.table_number} • {selectedSession.package.name}
                                    </p>
                                </div>

                                {/* Bill Items */}
                                <div className="flex-1 p-8 overflow-y-auto">
                                    <div className="space-y-6">
                                        {/* Package Details */}
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-3">Package Details</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                                                    <span className="text-gray-600">
                                                        Adults ({billCalculation.adult_count} x {billCalculation.adult_price} ฿)
                                                    </span>
                                                    <span className="font-semibold">
                                                        {(billCalculation.adult_count * billCalculation.adult_price).toFixed(2)} ฿
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                                                    <span className="text-gray-600">
                                                        Children ({billCalculation.child_count} x {billCalculation.child_price} ฿)
                                                    </span>
                                                    <span className="font-semibold">
                                                        {(billCalculation.child_count * billCalculation.child_price).toFixed(2)} ฿
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Charges */}
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-3">Charges & Taxes</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>Subtotal</span>
                                                    <span>{billCalculation.subtotal.toFixed(2)} ฿</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>Service Charge ({billCalculation.service_charge_percent}%)</span>
                                                    <span>{billCalculation.service_charge.toFixed(2)} ฿</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>VAT ({billCalculation.vat_percent}%)</span>
                                                    <span>{billCalculation.vat.toFixed(2)} ฿</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer: Total & Actions */}
                                <div className="p-6 bg-gray-50 border-t border-gray-200">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-xl font-bold text-gray-700">Grand Total</span>
                                        <span className="text-4xl font-bold text-purple-600">
                                            {billCalculation.grand_total.toFixed(2)} ฿
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => {
                                                setSelectedSession(null);
                                                setBillCalculation(null);
                                            }}
                                            className="py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors"
                                        >
                                            ยกเลิก
                                        </button>
                                        <button
                                            onClick={() => setShowPaymentModal(true)}
                                            className="py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg transition-colors"
                                        >
                                            💳 เลือกช่องทางชำระเงิน
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full p-12">
                                <div className="text-center text-gray-400">
                                    <div className="text-6xl mb-4">🧾</div>
                                    <h3 className="text-xl font-semibold">เลือก Session เพื่อคำนวณบิล</h3>
                                    <p className="text-sm mt-2">คลิกที่รายการด้านซ้าย</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedSession && billCalculation && (
                <PaymentModal
                    sessionId={selectedSession.id}
                    billCalculation={billCalculation}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}
