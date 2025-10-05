'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { type User, type JournalEntry } from '@/lib/types';
import { getUsers, getEntries as fetchEntries, addEntry as apiAddEntry, updateEntry as apiUpdateEntry } from '@/lib/actions';

/**
 * The shape of the UserContext.
 */
type UserContextType = {
  /** The list of all available users. */
  users: User[];
  /** The currently selected user. */
  currentUser: User | null;
  /** Function to set the current user. */
  setCurrentUser: (user: User | null) => void;
  /** The journal entries for the current user. */
  entries: JournalEntry[];
  /** Function to add a new journal entry. */
  addEntry: (data: { text: string; moodScore: number; }) => Promise<any>;
  /** Function to update an existing journal entry. */
  updateEntry: (data: { id: string, text: string; moodScore: number; }) => Promise<any>;
  /** Loading state for entries */
  loading: boolean;
};

/**
 * React context for managing user state, including the list of users and the currently selected user.
 */
export const UserContext = createContext<UserContextType>({
  users: [],
  currentUser: null,
  setCurrentUser: () => {},
  entries: [],
  addEntry: async () => {},
  updateEntry: async () => {},
  loading: true,
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

  // Fetch users on initial load
  useEffect(() => {
    async function fetchUsers() {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
      if (fetchedUsers.length > 0) {
        // Try to load from localStorage first
        const storedUserId = localStorage.getItem('currentUser');
        const user = storedUserId ? fetchedUsers.find(u => u.id === parseInt(storedUserId)) : fetchedUsers[0];
        setCurrentUser(user || fetchedUsers[0]);
      }
    }
    fetchUsers();
  }, []);

  // Fetch entries when the current user changes
  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      fetchEntries(currentUser.id).then((userEntries) => {
        setEntries(userEntries);
        setLoading(false);
      });
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [currentUser]);

  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
        localStorage.setItem('currentUser', user.id.toString());
    } else {
        localStorage.removeItem('currentUser');
    }
  }

  const addEntry = useCallback(async (data: { text: string; moodScore: number; }) => {
    if (!currentUser) return { success: false, error: 'No user selected' };
    
    const result = await apiAddEntry({ ...data, userId: currentUser.id });
    if (result.success) {
      setEntries(prevEntries => [result.entry, ...prevEntries]);
    }
    return result;
  }, [currentUser]);

  const updateEntry = useCallback(async (data: { id: string; text: string; moodScore: number; }) => {
    if (!currentUser) return { success: false, error: 'No user selected' };

    const result = await apiUpdateEntry({ ...data, userId: currentUser.id });
    if (result.success) {
      setEntries(prevEntries => 
        prevEntries.map(entry => entry.id === data.id ? result.entry : entry)
      );
    }
    return result;
  }, [currentUser]);

  const value = {
    users,
    currentUser,
    setCurrentUser: handleSetCurrentUser,
    entries,
    addEntry,
    updateEntry,
    loading,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
