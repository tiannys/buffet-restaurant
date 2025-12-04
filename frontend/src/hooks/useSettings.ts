'use client';

import { useState, useEffect } from 'react';
import { settings as settingsApi } from '@/lib/api';

interface Settings {
    restaurant_name: string;
    logo_url: string;
    vat_percent: number;
    service_charge_percent: number;
    promptpay_id: string;
    promptpay_type: 'phone' | 'id';
}

export function useSettings() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await settingsApi.get();
            setSettings(response.data);
        } catch (err) {
            setError(err as Error);
            console.error('Failed to load settings:', err);
        } finally {
            setLoading(false);
        }
    };

    return { settings, loading, error, reload: loadSettings };
}
