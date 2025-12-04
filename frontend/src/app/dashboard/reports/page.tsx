'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reports } from '@/lib/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    });

    const [summary, setSummary] = useState<any>(null);
    const [dailySales, setDailySales] = useState<any[]>([]);
    const [packageData, setPackageData] = useState<any[]>([]);
    const [paymentData, setPaymentData] = useState<any[]>([]);
    const [topItems, setTopItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, [dateRange]);

    const loadReports = async () => {
        setLoading(true);
        try {
            // Use API functions that automatically include auth token
            const [summaryRes, dailyRes, packageRes, paymentRes, topItemsRes] = await Promise.all([
                reports.getDashboardSummary(dateRange.startDate, dateRange.endDate),
                reports.getDailySales(dateRange.startDate, dateRange.endDate),
                reports.getRevenueByPackage(dateRange.startDate, dateRange.endDate),
                reports.getPaymentMethods(dateRange.startDate, dateRange.endDate),
                reports.getTopItems(dateRange.startDate, dateRange.endDate, 10),
            ]);

            setSummary(summaryRes.data);
            setDailySales(dailyRes.data);
            setPackageData(packageRes.data);
            setPaymentData(paymentRes.data);
            setTopItems(topItemsRes.data);
        } catch (error) {
            console.error('Failed to load reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const setQuickRange = (days: number) => {
        const end = new Date();
        end.setHours(23, 59, 59, 999); // End of today
        const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        start.setHours(0, 0, 0, 0); // Start of day
        setDateRange({
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
        });
    };

    if (loading) {
        return <div className="p-6">Loading reports...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">📊 Reports & Analytics</h1>
                    <p className="text-gray-600 mt-1">Comprehensive sales and menu statistics</p>
                </div>

                {/* Date Range Picker */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <button
                            onClick={loadReports}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Apply
                        </button>
                        <div className="flex gap-2">
                            <button onClick={() => setQuickRange(1)} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm">Today</button>
                            <button onClick={() => setQuickRange(7)} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm">7 Days</button>
                            <button onClick={() => setQuickRange(30)} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm">30 Days</button>
                            <button onClick={() => setQuickRange(90)} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm">90 Days</button>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
                            <div className="text-sm opacity-90">Total Revenue</div>
                            <div className="text-3xl font-bold mt-2">{summary.total_revenue?.toFixed(2)} ฿</div>
                            <div className="text-sm mt-1">💰</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
                            <div className="text-sm opacity-90">Total Sessions</div>
                            <div className="text-3xl font-bold mt-2">{summary.total_sessions}</div>
                            <div className="text-sm mt-1">📋</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
                            <div className="text-sm opacity-90">Total Customers</div>
                            <div className="text-3xl font-bold mt-2">{summary.total_customers}</div>
                            <div className="text-sm mt-1">👥</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
                            <div className="text-sm opacity-90">Average Bill</div>
                            <div className="text-3xl font-bold mt-2">{summary.average_bill?.toFixed(2)} ฿</div>
                            <div className="text-sm mt-1">📈</div>
                        </div>
                    </div>
                )}

                {/* Revenue Trend Line Chart */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailySales}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Revenue (฿)" />
                            <Line type="monotone" dataKey="sessions" stroke="#82ca9d" name="Sessions" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue by Package & Payment Methods */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Package Bar Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">📦 Revenue by Package</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={packageData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="package_name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#8884d8" name="Revenue (฿)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Payment Pie Chart */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">💳 Payment Methods</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={paymentData}
                                    dataKey="amount"
                                    nameKey="method"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label
                                >
                                    {paymentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Selling Items Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                        <h3 className="text-lg font-bold">🏆 Top Selling Items</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Menu Item</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Orders</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Qty</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {topItems.map((item) => (
                                    <tr key={item.rank} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${item.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                                item.rank === 2 ? 'bg-gray-100 text-gray-800' :
                                                    item.rank === 3 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'
                                                } font-bold`}>
                                                {item.rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {item.menu_item.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {item.menu_item.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900">
                                            {item.order_count}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                                            {item.total_quantity}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
