
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { type User, type JournalEntry } from '@/lib/types';
import { getEntries as apiGetEntries, addEntry as apiAddEntry, updateEntry as apiUpdateEntry, deleteUser as apiDeleteUser, updateUser as apiUpdateUser, getUsers as apiGetUsers } from '@/lib/actions';

/**
 * The shape of the UserContext.
 */
type UserContextType = {
  /** The list of all available users (for admin). */
  users: User[];
  /** The currently selected user. */
  currentUser: User | null;
  /** The journal entries for the current user. */
  entries: JournalEntry[];
  /** Function to add a new journal entry. */
  addEntry: (data: { text: string; moodScore: number; }) => Promise<any>;
  /** Function to update an existing journal entry. */
  updateEntry: (data: { id: string, text: string; moodScore: number; }) => Promise<any>;
  /** Loading state for entries */
  loading: boolean;
  /** Function to update an existing user. */
  updateUser: (data: { id: string, name: string; 'can-edit': boolean }) => Promise<any>;
  /** Function to delete a user. */
  deleteUser: (userId: string) => Promise<any>;
  /** Function to refresh the list of users. */
  refreshUsers: () => Promise<void>;
  /** Function to switch the current user. */
  setCurrentUser: (user: User | null) => void;
};

/**
 * React context for managing user state, including the list of users and the currently selected user.
 */
export const UserContext = createContext<UserContextType>({
  users: [],
  currentUser: null,
  entries: [],
  addEntry: async () => {},
  updateEntry: async () => {},
  loading: true,
  updateUser: async () => {},
  deleteUser: async () => {},
  refreshUsers: async () => {},
  setCurrentUser: () => {},
});

/**
 * Provider component for the UserContext.
 * It fetches the list of users and manages the state of the current user.
 * The current user is persisted to localStorage.
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The child components to be wrapped by the provider.
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUsers = useCallback(async () => {
      setLoading(true);
      const fetchedUsers = await apiGetUsers();
      setUsers(fetchedUsers);
      if (!currentUser && fetchedUsers.length > 0) {
        setCurrentUser(fetchedUsers[0]);
      }
      setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    refreshUsers();
  }, []);

  // Fetch entries when the current user changes
  useEffect(() => {
    if (currentUser?.id) {
      setLoading(true);
      apiGetEntries(currentUser.id).then((userEntries) => {
        setEntries(userEntries);
        setLoading(false);
      });
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [currentUser]);

  const addEntry = useCallback(async (data: { text: string; moodScore: number; }) => {
    if (!currentUser?.id) return { success: false, error: 'No user selected' };
    
    const result = await apiAddEntry({ ...data, userId: currentUser.id });
    if (result.success) {
      // Re-fetch entries to get the latest list
      const userEntries = await apiGetEntries(currentUser.id);
      setEntries(userEntries);
    }
    return result;
  }, [currentUser]);

  const updateEntry = useCallback(async (data: { id: string; text: string; moodScore: number; }) => {
    if (!currentUser?.id) return { success: false, error: 'No user selected' };

    const result = await apiUpdateEntry({ ...data, userId: currentUser.id });
    if (result.success) {
       // Re-fetch entries to get the latest list
      const userEntries = await apiGetEntries(currentUser.id);
      setEntries(userEntries);
    }
    return result;
  }, [currentUser]);
  
  const value = {
    users,
    currentUser,
    setCurrentUser,
    entries,
    addEntry,
    updateEntry,
    loading,
    updateUser: apiUpdateUser,
    deleteUser: apiDeleteUser,
    refreshUsers,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
