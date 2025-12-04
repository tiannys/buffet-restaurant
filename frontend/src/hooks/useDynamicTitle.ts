'use client';

import { useEffect } from 'react';
import { useSettings } from './useSettings';

export function useDynamicTitle(suffix?: string) {
    const { settings } = useSettings();

    useEffect(() => {
        if (settings?.restaurant_name) {
            document.title = suffix
                ? `${settings.restaurant_name} - ${suffix}`
                : settings.restaurant_name;
        }
    }, [settings, suffix]);
}
