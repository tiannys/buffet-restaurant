'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { packages, sessions } from '@/lib/api';

export default function StartSessionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tableId = searchParams.get('table_id');

    const [packagesList, setPackagesList] = useState<any[]>([]);
    const [selectedPackage, setSelectedPackage] = useState('');
    const [adultCount, setAdultCount] = useState(2);
    const [childCount, setChildCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        try {
            const response = await packages.getAll();
            setPackagesList(response.data);
            if (response.data.length > 0) {
                setSelectedPackage(response.data[0].id);
            }
        } catch (error) {
            console.error('Failed to load packages:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await sessions.start({
                table_id: tableId,
                package_id: selectedPackage,
                adult_count: adultCount,
                child_count: childCount,
            });

            const session = response.data;
            router.push(`/staff/session/${session.id}`);
        } catch (error) {
            console.error('Failed to start session:', error);
            alert('ไม่สามารถเริ่มรอบโต๊ะได้');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-2xl">
                <div className="rounded-lg bg-white p-8 shadow-lg">
                    <h1 className="mb-6 text-2xl font-bold text-gray-800">เริ่มรอบโต๊ะ</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                เลือกแพ็กเกจ
                            </label>
                            <select
                                value={selectedPackage}
                                onChange={(e) => setSelectedPackage(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                required
                            >
                                {packagesList.map((pkg) => (
                                    <option key={pkg.id} value={pkg.id}>
                                        {pkg.name} - ผู้ใหญ่ {pkg.adult_price} บาท / เด็ก {pkg.child_price} บาท
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    จำนวนผู้ใหญ่
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={adultCount}
                                    onChange={(e) => setAdultCount(parseInt(e.target.value))}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    จำนวนเด็ก
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={childCount}
                                    onChange={(e) => setChildCount(parseInt(e.target.value))}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {loading ? 'กำลังเริ่มรอบ...' : 'เริ่มรอบโต๊ะ'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
