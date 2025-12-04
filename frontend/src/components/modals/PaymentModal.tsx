'use client';

import { useState } from 'react';
import { sessions } from '@/lib/api';

interface PaymentModalProps {
    sessionId: string;
    billCalculation: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentModal({ sessionId, billCalculation, onClose, onSuccess }: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr_promptpay'>('cash');
    const [loading, setLoading] = useState(false);

    const handleConfirmPayment = async () => {
        setLoading(true);
        try {
            const paymentData = {
                payments: [
                    {
                        payment_method: paymentMethod,
                        amount: billCalculation.grand_total,
                    }
                ]
            };

            await sessions.end(sessionId, paymentData);
            alert('Payment confirmed! Session ended successfully.');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <h3 className="text-2xl font-bold">💳 เลือกช่องทางชำระเงิน</h3>
                    <p className="text-sm opacity-90 mt-1">Select Payment Method</p>
                </div>

                {/* Bill Summary */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{billCalculation.subtotal.toFixed(2)} ฿</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Service Charge ({billCalculation.service_charge_percent}%):</span>
                        <span className="font-medium">{billCalculation.service_charge.toFixed(2)} ฿</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">VAT ({billCalculation.vat_percent}%):</span>
                        <span className="font-medium">{billCalculation.vat.toFixed(2)} ฿</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
                        <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                        <span className="text-2xl font-bold text-purple-600">{billCalculation.grand_total.toFixed(2)} ฿</span>
                    </div>
                </div>

                {/* Payment Method Selection */}
                <div className="p-6 space-y-4">
                    <h4 className="font-semibold text-gray-900 mb-3">เลือกวิธีการชำระเงิน:</h4>

                    {/* CASH Option */}
                    <div
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cash'
                                ? 'border-green-500 bg-green-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${paymentMethod === 'cash' ? 'bg-green-500' : 'bg-gray-200'
                                }`}>
                                💵
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-gray-900">เงินสด (CASH)</div>
                                <div className="text-sm text-gray-600">ชำระด้วยเงินสดให้แคชเชียร์</div>
                            </div>
                            {paymentMethod === 'cash' && (
                                <div className="text-green-600 font-bold text-xl">✓</div>
                            )}
                        </div>
                    </div>

                    {/* QR PromptPay Option */}
                    <div
                        onClick={() => setPaymentMethod('qr_promptpay')}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'qr_promptpay'
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${paymentMethod === 'qr_promptpay' ? 'bg-blue-500' : 'bg-gray-200'
                                }`}>
                                📱
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-gray-900">QR พร้อมเพย์ (QR PromptPay)</div>
                                <div className="text-sm text-gray-600">สแกน QR Code ด้วยแอพธนาคาร</div>
                            </div>
                            {paymentMethod === 'qr_promptpay' && (
                                <div className="text-blue-600 font-bold text-xl">✓</div>
                            )}
                        </div>
                    </div>

                    {/* QR Code Display (when QR selected) */}
                    {paymentMethod === 'qr_promptpay' && billCalculation.promptpay_qr_url && (
                        <div className="mt-4 p-6 bg-white border-2 border-blue-300 rounded-xl text-center">
                            <p className="text-sm font-medium text-gray-700 mb-3">📱 สแกน QR Code เพื่อชำระเงิน</p>
                            <img
                                src={billCalculation.promptpay_qr_url}
                                alt="PromptPay QR Code"
                                className="mx-auto w-64 h-64 border-4 border-gray-200 rounded-lg"
                            />
                            <p className="text-xs text-gray-500 mt-3">จำนวนเงิน: {billCalculation.grand_total.toFixed(2)} บาท</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
                        disabled={loading}
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleConfirmPayment}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'กำลังดำเนินการ...' : '✓ ยืนยันชำระเงิน'}
                    </button>
                </div>
            </div>
        </div>
    );
}
