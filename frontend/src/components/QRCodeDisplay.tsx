'use client';

interface QRCodeDisplayProps {
    session: {
        id: string;
        table: { table_number: string };
        package: { name: string };
        qr_code?: string;
        end_time: string;
    };
    onClose: () => void;
}

export default function QRCodeDisplay({ session, onClose }: QRCodeDisplayProps) {
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - Table ${session.table.table_number}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                    }
                    h1 { margin: 10px 0; }
                    img { max-width: 400px; margin: 20px 0; }
                    .info { text-align: center; margin: 10px 0; }
                    @media print {
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>Table ${session.table.table_number}</h1>
                <div class="info">
                    <p><strong>Package:</strong> ${session.package.name}</p>
                    <p><strong>Session ID:</strong> ${session.id}</p>
                    <p><strong>Valid until:</strong> ${new Date(session.end_time).toLocaleString()}</p>
                </div>
                <img src="${session.qr_code}" alt="QR Code" />
                <p>Scan this QR code to order</p>
                <button onclick="window.print()">Print</button>
            </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-2xl font-bold mb-4 text-center">
                    QR Code - Table {session.table.table_number}
                </h3>

                <div className="text-center space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Package</p>
                        <p className="font-semibold">{session.package.name}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Valid Until</p>
                        <p className="font-semibold">{new Date(session.end_time).toLocaleString()}</p>
                    </div>

                    {session.qr_code && (
                        <div className="flex justify-center my-6">
                            <img
                                src={session.qr_code}
                                alt="QR Code"
                                className="max-w-sm border-4 border-gray-200 rounded-lg shadow-lg"
                            />
                        </div>
                    )}

                    <p className="text-sm text-gray-600">
                        Customers can scan this QR code to view the menu and place orders
                    </p>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                        ⚠️ This QR code will expire when the session ends
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <button
                        onClick={handlePrint}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        🖨️ Print QR Code
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
