
'use client';

import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

const ADMIN_PASSCODE = 'admin123';

type AdminAuthContextType = {
  isAdminLoggedIn: boolean;
  login: () => Promise<boolean>;
  logout: () => void;
};

export const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdminLoggedIn: false,
  login: async () => false,
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const { toast } = useToast();

  const login = useCallback(async (): Promise<boolean> => {
    if (isAdminLoggedIn) {
      return true;
    }

    const passcode = prompt('Please enter the admin passcode:');
    
    if (passcode === ADMIN_PASSCODE) {
      setIsAdminLoggedIn(true);
      toast({
        title: 'Admin Access Granted',
        description: 'Welcome, Admin!',
      });
      return true;
    } else if (passcode !== null) { // User entered something incorrect
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'The passcode you entered is incorrect.',
      });
    }
    // If passcode is null, user cancelled the prompt. No toast needed.
    
    setIsAdminLoggedIn(false);
    return false;
  }, [isAdminLoggedIn, toast]);

  const logout = useCallback(() => {
    setIsAdminLoggedIn(false);
  }, []);

  const value = {
    isAdminLoggedIn,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
