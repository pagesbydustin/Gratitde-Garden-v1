
'use client';

import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { type User, type JournalEntry } from '@/lib/types';
import { getUsers as apiGetUsers, getEntries as fetchEntries, addEntry as apiAddEntry, updateEntry as apiUpdateEntry, addUser as apiAddUser, updateUser as apiUpdateUser, deleteUser as apiDeleteUser } from '@/lib/actions';

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
  /** Function to add a new user. */
  addUser: (data: { name: string; 'can-edit': boolean }) => Promise<any>;
  /** Function to update an existing user. */
  updateUser: (data: { id: number, name: string; 'can-edit': boolean }) => Promise<any>;
  /** Function to delete a user. */
  deleteUser: (userId: number) => Promise<any>;
  /** Function to refresh the list of users. */
  refreshUsers: () => Promise<void>;
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
  addUser: async () => {},
  updateUser: async () => {},
  deleteUser: async () => {},
  refreshUsers: async () => {},
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

  const fetchUsers = useCallback(async () => {
    const fetchedUsers = await apiGetUsers();
    setUsers(fetchedUsers);
    return fetchedUsers;
  }, []);

  // Fetch users on initial load
  useEffect(() => {
    fetchUsers().then(fetchedUsers => {
        if (fetchedUsers.length > 0) {
            const storedUserId = localStorage.getItem('currentUser');
            let userToSet: User | null = null;
            
            if (storedUserId) {
                const storedUser = fetchedUsers.find(u => u.id === parseInt(storedUserId));
                // Only auto-login if the stored user is NOT Admin
                if (storedUser && storedUser.name !== 'Admin') {
                    userToSet = storedUser;
                }
            }
            
            // If no user is set yet (either no stored user, or stored user was Admin)
            if (!userToSet) {
                // Default to the first non-admin user
                userToSet = fetchedUsers.find(u => u.name !== 'Admin') || fetchedUsers[0] || null;
            }

            setCurrentUser(userToSet);
        }
    });
  }, [fetchUsers]);

  // Fetch entries when the current user changes
  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      // Persist current user to localStorage, but only in the browser
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', currentUser.id.toString());
      }
      fetchEntries(currentUser.id).then((userEntries) => {
        setEntries(userEntries);
        setLoading(false);
      });
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser');
      }
      setEntries([]);
      setLoading(false);
    }
  }, [currentUser]);

  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
  }

  const addEntry = useCallback(async (data: { text: string; moodScore: number; }) => {
    if (!currentUser) return { success: false, error: 'No user selected' };
    
    const result = await apiAddEntry({ ...data, userId: currentUser.id });
    if (result.success) {
      setEntries(prevEntries => [result.entry, ...prevEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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
  
  const addUser = useCallback(async (data: { name: string; 'can-edit': boolean }) => {
    const result = await apiAddUser(data);
    if (result.success) {
      await fetchUsers();
    }
    return result;
  }, [fetchUsers]);
  
  const updateUser = useCallback(async (data: { id: number; name: string; 'can-edit': boolean }) => {
    const result = await apiUpdateUser(data);
    if (result.success) {
      await fetchUsers();
       // If the updated user is the current user, update the context
      if (currentUser && currentUser.id === data.id) {
          setCurrentUser(result.user);
      }
    }
    return result;
  }, [fetchUsers, currentUser]);

  const deleteUser = useCallback(async (userId: number) => {
    const result = await apiDeleteUser(userId);
    if (result.success) {
      const remainingUsers = await fetchUsers();
      // If the deleted user was the current user, clear it or set to first available
      if (currentUser && currentUser.id === userId) {
        handleSetCurrentUser(remainingUsers.length > 0 ? remainingUsers[0] : null);
      }
    }
    return result;
  }, [fetchUsers, currentUser]);


  const value = {
    users,
    currentUser,
    setCurrentUser: handleSetCurrentUser,
    entries,
    addEntry,
    updateEntry,
    loading,
    addUser,
    updateUser,
    deleteUser,
    refreshUsers: fetchUsers,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
