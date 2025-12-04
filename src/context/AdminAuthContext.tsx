
'use client';

import { createContext, useState, ReactNode, useCallback } from 'react';

const ADMIN_PASSCODE = 'admin123';

type AdminAuthContextType = {
    isAdminAuthenticated: boolean;
    login: (passcode: string) => boolean;
    logout: () => void;
};

export const AdminAuthContext = createContext<AdminAuthContextType>({
    isAdminAuthenticated: false,
    login: () => false,
    logout: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

    const login = useCallback((passcode: string) => {
        if (passcode === ADMIN_PASSCODE) {
            setIsAdminAuthenticated(true);
            return true;
        }
        return false;
    }, []);

    const logout = useCallback(() => {
        setIsAdminAuthenticated(false);
    }, []);

    const value = { isAdminAuthenticated, login, logout };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
}
