'use client';

import { useState, useEffect } from 'react';
import { settings } from '@/lib/api';
import { useDynamicTitle } from '@/hooks/useDynamicTitle';
import { getAssetUrl } from '@/lib/env';

interface SettingsData {
    restaurant_name: string;
    logo_url: string;
    vat_percent: number;
    service_charge_percent: number;
    promptpay_id: string;
    promptpay_type: 'phone' | 'id';
}

export default function SettingsPage() {
    useDynamicTitle('ตั้งค่าระบบ');
    const [formData, setFormData] = useState<SettingsData>({
        restaurant_name: 'ร้านบุฟเฟ่ต์',
        logo_url: '',
        vat_percent: 7,
        service_charge_percent: 10,
        promptpay_id: '',
        promptpay_type: 'phone',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await settings.get();
            setFormData({
                restaurant_name: response.data.restaurant_name || 'ร้านบุฟเฟ่ต์',
                logo_url: response.data.logo_url || '',
                vat_percent: response.data.vat_percent || 7,
                service_charge_percent: response.data.service_charge_percent || 10,
                promptpay_id: response.data.promptpay_id || '',
                promptpay_type: response.data.promptpay_type || 'phone',
            });
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        try {
            const response = await settings.uploadLogo(file);
            setFormData({ ...formData, logo_url: response.data.url });
        } catch (error) {
            console.error('Failed to upload logo:', error);
            alert('Failed to upload logo');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            await settings.update(formData);
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const getPromptPayPreviewUrl = () => {
        if (!formData.promptpay_id) return null;
        return `https://promptpay.io/${formData.promptpay_id}/100.png`;
    };

    if (loading) {
        return <div className="p-6">Loading settings...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">⚙️ System Settings</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Restaurant Branding */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">🏪 Shop Information</h2>

                        {/* Restaurant Name */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Restaurant Name / ชื่อร้าน
                            </label>
                            <input
                                type="text"
                                value={formData.restaurant_name}
                                onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="ร้านบุฟเฟ่ต์"
                                required
                            />
                            <p className="text-sm text-gray-500 mt-1">This will be displayed throughout the system</p>
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Restaurant Logo / โลโก้ร้าน (Optional)
                            </label>

                            {formData.logo_url && (
                                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                                    <img
                                        src={getAssetUrl(formData.logo_url)}
                                        alt="Restaurant Logo"
                                        className="h-20 object-contain rounded border border-gray-200"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <label className="cursor-pointer px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                                    {uploadingLogo ? 'Uploading...' : '📤 Upload Logo'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                        disabled={uploadingLogo}
                                    />
                                </label>
                                {formData.logo_url && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, logo_url: '' })}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                        🗑️ Remove Logo
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Recommended: Square image, max 2MB (PNG, JPG, SVG)
                            </p>
                        </div>
                    </div>

                    {/* Billing Settings */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">🧮 Billing Configuration</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* VAT Percent */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    VAT Percentage (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.vat_percent}
                                    onChange={(e) => setFormData({ ...formData, vat_percent: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">Default: 7%</p>
                            </div>

                            {/* Service Charge Percent */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Service Charge (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={formData.service_charge_percent}
                                    onChange={(e) => setFormData({ ...formData, service_charge_percent: parseFloat(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">Default: 10%</p>
                            </div>
                        </div>
                    </div>

                    {/* PromptPay Settings */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">💰 PromptPay Configuration</h2>

                        {/* PromptPay Type */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                PromptPay Type
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="phone"
                                        checked={formData.promptpay_type === 'phone'}
                                        onChange={(e) => setFormData({ ...formData, promptpay_type: 'phone' })}
                                        className="mr-2"
                                    />
                                    <span>Phone Number</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="id"
                                        checked={formData.promptpay_type === 'id'}
                                        onChange={(e) => setFormData({ ...formData, promptpay_type: 'id' })}
                                        className="mr-2"
                                    />
                                    <span>Citizen ID</span>
                                </label>
                            </div>
                        </div>

                        {/* PromptPay ID */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {formData.promptpay_type === 'phone' ? 'Phone Number' : 'Citizen ID'}
                            </label>
                            <input
                                type="text"
                                value={formData.promptpay_id}
                                onChange={(e) => setFormData({ ...formData, promptpay_id: e.target.value })}
                                placeholder={formData.promptpay_type === 'phone' ? '0812345678' : '1234567890123'}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {formData.promptpay_type === 'phone'
                                    ? 'Enter 10-digit phone number without dashes'
                                    : 'Enter 13-digit citizen ID without dashes'}
                            </p>
                        </div>

                        {/* QR Code Preview */}
                        {getPromptPayPreviewUrl() && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold text-center mb-2">QR Code Preview</h3>
                                <div className="flex justify-center">
                                    <img
                                        src={getPromptPayPreviewUrl()!}
                                        alt="PromptPay QR Preview"
                                        className="w-48 h-48 border-2 border-blue-200 rounded"
                                    />
                                </div>
                                <p className="text-center text-sm text-gray-600 mt-2">
                                    Sample: 100.00 ฿
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={loadSettings}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            disabled={saving}
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : '💾 Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
