"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { sessions } from "@/lib/api";

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    sessions
      .getForCustomer(params.id as string)
      .then((res) => setData(res.data))
      .catch(console.error);
  }, [params.id]);

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  const { session, orders } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 text-sm text-slate-500 hover:text-slate-800 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {session.table_number}
              </h1>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full tracking-wide">
                Active
              </span>

              <div className="mt-6 space-y-4 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Package</span>
                  <span className="font-medium">{session.package_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Time Left</span>
                  <span className="font-bold text-orange-500">
                    {session.remaining_minutes} mins
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Guests</span>
                  <span className="font-medium">
                    {session.adult_count + session.child_count}
                  </span>
                </div>
              </div>

              {session.qr_code && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-slate-400 mb-2">
                    Customer QR Code
                  </p>
                  <img
                    src={session.qr_code}
                    alt="QR"
                    className="w-32 h-32 mx-auto rounded-lg border p-2"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Orders Feed */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Order History</h3>
                <span className="text-xs text-slate-500">
                  {orders?.length || 0} Orders
                </span>
              </div>
              <div className="p-4 space-y-4">
                {orders && orders.length > 0 ? (
                  orders.map((order: any) => (
                    <div
                      key={order.id}
                      className="border border-gray-100 rounded-xl p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-mono text-slate-400">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded capitalize ${
                            order.status === "served"
                              ? "bg-green-100 text-green-700"
                              : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-slate-700">
                              {item.menu_item.name}
                            </span>
                            <span className="font-medium text-slate-900">
                              x{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400">
                    No orders yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
