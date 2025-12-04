
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { type User, type JournalEntry } from '@/lib/types';
import { getEntries as apiGetEntries, addEntry as apiAddEntry, updateEntry as apiUpdateEntry, deleteUser as apiDeleteUser, updateUser as apiUpdateUser, getUsers as apiGetUsers, getAllEntries as apiGetAllEntries } from '@/lib/actions';

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
  updateUser: (data: { id: string, name: string; email: string, 'can-edit': boolean }) => Promise<any>;
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
  updateUser: async () => ({ success: false, error: 'Not implemented' }),
  deleteUser: async () => ({ success: false, error: 'Not implemented' }),
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
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);
  const [currentUserEntries, setCurrentUserEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUsers = useCallback(async () => {
      const fetchedUsers = await apiGetUsers();
      setUsers(fetchedUsers);
      return fetchedUsers;
  }, []);

  const refreshAllEntries = useCallback(async () => {
    const allEntries = await apiGetAllEntries();
    setAllEntries(allEntries);
  }, []);

  const setCurrentUser = useCallback((user: User | null) => {
    try {
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
      setCurrentUserState(user);
    } catch (error) {
      console.error("Could not access localStorage. User session will not be persisted.", error);
      setCurrentUserState(user);
    }
  }, []);


  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      const fetchedUsers = await refreshUsers();
      await refreshAllEntries();
      
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (fetchedUsers.some(u => u.id === parsedUser.id)) {
            setCurrentUserState(parsedUser);
          } else if (fetchedUsers.length > 0) {
            setCurrentUser(fetchedUsers[0]);
          }
        } else if (fetchedUsers.length > 0) {
          setCurrentUser(fetchedUsers[0]);
        }
      } catch (error) {
          console.error("Could not access localStorage. Defaulting to first user.", error);
          if(fetchedUsers.length > 0) {
            setCurrentUserState(fetchedUsers[0]);
          }
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [refreshUsers, refreshAllEntries, setCurrentUser]);


  // Filter entries when the current user or all entries change
  useEffect(() => {
    if (currentUser?.id) {
      const userEntries = allEntries.filter(entry => entry.userId === currentUser.id);
      setCurrentUserEntries(userEntries);
    } else {
      setCurrentUserEntries([]);
    }
  }, [currentUser, allEntries]);

  const addEntry = useCallback(async (data: { text: string; moodScore: number; }) => {
    if (!currentUser?.id) return { success: false, error: 'No user selected' };
    
    const result = await apiAddEntry({ ...data, userId: currentUser.id });
    if (result.success) {
      await refreshAllEntries();
    }
    return result;
  }, [currentUser, refreshAllEntries]);

  const updateEntry = useCallback(async (data: { id: string; text: string; moodScore: number; }) => {
    if (!currentUser?.id) return { success: false, error: 'No user selected' };

    const result = await apiUpdateEntry({ ...data, userId: currentUser.id });
    if (result.success) {
      await refreshAllEntries();
    }
    return result;
  }, [currentUser, refreshAllEntries]);
  
  const value = {
    users,
    currentUser,
    setCurrentUser,
    entries: currentUserEntries,
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
