'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

export default function Home() {
    const router = useRouter();
    const { settings: shopSettings } = useSettings();

    useEffect(() => {
        // Redirect to login page
        router.push('/login');
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800">
                    {shopSettings?.restaurant_name || 'ระบบจัดการร้านบุฟเฟ่ต์'}
                </h1>
                <p className="mt-4 text-gray-600">กำลังโหลด...</p>
            </div>
        </div>
    );
}
