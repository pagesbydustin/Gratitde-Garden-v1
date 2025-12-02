
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getSettings as apiGetSettings, updateSettings as apiUpdateSettings } from '@/lib/actions';

export type Settings = {
    gratitudePrompt: string;
    showExplanation: boolean;
};

type SettingsContextType = {
    settings: Settings | null;
    loading: boolean;
    updateSettings: (data: Settings) => Promise<any>;
};

export const SettingsContext = createContext<SettingsContextType>({
    settings: null,
    loading: true,
    updateSettings: async () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        const fetchedSettings = await apiGetSettings();
        setSettings(fetchedSettings);
        setLoading(false);
        return fetchedSettings;
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSettings = useCallback(async (data: Settings) => {
        const result = await apiUpdateSettings(data);
        if (result.success) {
            setSettings(result.settings);
        }
        return result;
    }, []);

    const value = {
        settings,
        loading,
        updateSettings,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}
