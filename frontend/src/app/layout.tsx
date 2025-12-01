import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'ระบบจัดการร้านบุฟเฟ่ต์',
    description: 'Buffet Restaurant QR Ordering System',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="th">
            <body className="font-sans antialiased">{children}</body>
        </html>
    );
}
