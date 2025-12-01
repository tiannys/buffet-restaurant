'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sessions, billing, loyalty } from '@/lib/api';

export default function CashierPage() {
    const router = useRouter();
    const [activeSessions, setActiveSessions] = useState<any[]>([]);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [billCalculation, setBillCalculation] = useState<any>(null);
    const [memberPhone, setMemberPhone] = useState('');
    const [member, setMember] = useState<any>(null);
    const [pointsToUse, setPointsToUse] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [discountReason, setDiscountReason] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadActiveSessions();
    }, []);

    const loadActiveSessions = async () => {
        try {
            const response = await sessions.getActive();
            setActiveSessions(response.data);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    };

    const handleSelectSession = async (session: any) => {
        setSelectedSession(session);
        try {
            const response = await billing.calculateBill(session.id);
            setBillCalculation(response.data);
        } catch (error) {
            console.error('Failed to calculate bill:', error);
        }
    };

    const handleSearchMember = async () => {
        if (!memberPhone) return;

        try {
            const response = await loyalty.findByPhone(memberPhone);
            setMember(response.data);
        } catch (error) {
            alert('ไม่พบสมาชิก');
            setMember(null);
        }
    };

    const handleCheckout = async () => {
        if (!selectedSession || !billCalculation) return;

        setLoading(true);
        try {
            const grandTotal = billCalculation.grand_total - discount - (pointsToUse * 1);

            await billing.createReceipt({
                session_id: selectedSession.id,
                member_id: member?.id,
                discount_amount: discount,
                discount_reason: discountReason,
                points_used: pointsToUse,
                payments: [
                    {
                        payment_method: paymentMethod,
                        amount: grandTotal,
                    },
                ],
            });

            alert('ชำระเงินสำเร็จ!');
            setSelectedSession(null);
            setBillCalculation(null);
            setMember(null);
            setMemberPhone('');
            setPointsToUse(0);
            setDiscount(0);
            loadActiveSessions();
        } catch (error) {
            console.error('Failed to create receipt:', error);
            alert('ไม่สามารถชำระเงินได้');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="mb-6 text-3xl font-bold text-gray-800">ระบบแคชเชียร์</h1>

            <div className="grid grid-cols-2 gap-6">
                {/* Active Sessions */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-semibold">โต๊ะที่มีลูกค้า</h2>
                    <div className="space-y-2">
                        {activeSessions.map(session => (
                            <button
                                key={session.id}
                                onClick={() => handleSelectSession(session)}
                                className={`w-full rounded-lg border p-4 text-left hover:bg-blue-50 ${selectedSession?.id === session.id ? 'border-blue-500 bg-blue-50' : ''
                                    }`}
                            >
                                <div className="font-medium">โต๊ะ {session.table.table_number}</div>
                                <div className="text-sm text-gray-600">{session.package.name}</div>
                                <div className="text-sm text-gray-600">
                                    ผู้ใหญ่ {session.adult_count} / เด็ก {session.child_count}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bill Calculation */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="mb-4 text-xl font-semibold">คำนวณบิล</h2>

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
                                    <span>{billCalculation.service_charge.toFixed(2)} บาท</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>VAT ({billCalculation.vat_percent}%)</span>
                                    <span>{billCalculation.vat.toFixed(2)} บาท</span>
                                </div>
                            </div>

                            {/* Member */}
                            <div className="border-t pt-4">
                                <label className="block text-sm font-medium">เบอร์โทรสมาชิก</label>
                                <div className="mt-1 flex gap-2">
                                    <input
                                        type="text"
                                        value={memberPhone}
                                        onChange={(e) => setMemberPhone(e.target.value)}
                                        className="flex-1 rounded border px-3 py-2"
                                        placeholder="0812345678"
                                    />
                                    <button
                                        onClick={handleSearchMember}
                                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                    >
                                        ค้นหา
                                    </button>
                                </div>
                                {member && (
                                    <div className="mt-2 text-sm">
                                        <p className="font-medium">{member.full_name}</p>
                                        <p className="text-gray-600">แต้มสะสม: {member.total_points} แต้ม</p>
                                        <div className="mt-2">
                                            <label className="block text-sm">ใช้แต้ม</label>
                                            <input
                                                type="number"
                                                max={member.total_points}
                                                value={pointsToUse}
                                                onChange={(e) => setPointsToUse(parseInt(e.target.value) || 0)}
                                                className="mt-1 w-full rounded border px-3 py-2"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Discount */}
                            <div>
                                <label className="block text-sm font-medium">ส่วนลด (บาท)</label>
                                <input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    className="mt-1 w-full rounded border px-3 py-2"
                                />
                                <input
                                    type="text"
                                    value={discountReason}
                                    onChange={(e) => setDiscountReason(e.target.value)}
                                    placeholder="เหตุผล"
                                    className="mt-2 w-full rounded border px-3 py-2"
                                />
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium">ช่องทางชำระเงิน</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="mt-1 w-full rounded border px-3 py-2"
                                >
                                    <option value="cash">เงินสด</option>
                                    <option value="transfer">โอนเงิน</option>
                                    <option value="qr_promptpay">QR PromptPay</option>
                                    <option value="credit_card">บัตรเครดิต</option>
                                </select>
                            </div>

                            {/* Grand Total */}
                            <div className="border-t pt-4">
                                <div className="flex justify-between text-2xl font-bold text-blue-600">
                                    <span>ยอดชำระ</span>
                                    <span>
                                        {(billCalculation.grand_total - discount - pointsToUse).toFixed(2)} บาท
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full rounded-md bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 disabled:bg-gray-400"
                            >
                                {loading ? 'กำลังชำระเงิน...' : 'ชำระเงิน'}
                            </button>
                        </div>
                    ) : (
                        <p className="text-gray-600">เลือกโต๊ะเพื่อคำนวณบิล</p>
                    )}
                </div>
            </div>
        </div>
    );
}
