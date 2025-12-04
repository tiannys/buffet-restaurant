"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { packages, sessions } from "@/lib/api";

export default function StartSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get("table_id");

  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState("");
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await packages.getAll();
      setPackagesList(res.data);
      if (res.data.length > 0) setSelectedPackage(res.data[0].id);
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await sessions.start({
        table_id: tableId,
        package_id: selectedPackage,
        adult_count: adultCount,
        child_count: childCount,
      });
      router.push(`/staff/session/${res.data.id}`);
    } catch (error) {
      alert("Cannot start session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h1 className="text-xl font-bold text-slate-800">Start Session</h1>
          <p className="text-sm text-slate-500">
            Configure table settings before starting
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Select Package
            </label>
            <div className="grid grid-cols-1 gap-3">
              {packagesList.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${selectedPackage === pkg.id ? "border-primary-500 bg-primary-50" : "border-gray-100 hover:border-gray-200"}`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`font-bold ${selectedPackage === pkg.id ? "text-primary-700" : "text-slate-700"}`}
                    >
                      {pkg.name}
                    </span>
                    <span className="text-sm font-medium bg-white px-2 py-1 rounded border border-gray-100">
                      {pkg.adult_price} ฿
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">
                Adults
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold text-slate-600"
                >
                  -
                </button>
                <span className="flex-1 text-center font-bold text-2xl text-slate-800">
                  {adultCount}
                </span>
                <button
                  type="button"
                  onClick={() => setAdultCount(adultCount + 1)}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold text-slate-600"
                >
                  +
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600">
                Children
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setChildCount(Math.max(0, childCount - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold text-slate-600"
                >
                  -
                </button>
                <span className="flex-1 text-center font-bold text-2xl text-slate-800">
                  {childCount}
                </span>
                <button
                  type="button"
                  onClick={() => setChildCount(childCount + 1)}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg font-bold text-slate-600"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 text-slate-600 font-medium hover:bg-gray-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-200 transition-all disabled:opacity-50"
            >
              {loading ? "Starting..." : "Confirm Start"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
