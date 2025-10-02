'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { type User } from '@/lib/types';
import { getUsers } from '@/lib/actions';

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
};

/**
 * React context for managing user state, including the list of users and the currently selected user.
 */
export const UserContext = createContext<UserContextType>({
  users: [],
  currentUser: null,
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

  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
        localStorage.setItem('currentUser', user.id.toString());
    } else {
        localStorage.removeItem('currentUser');
    }
  }

  return (
    <UserContext.Provider value={{ users, currentUser, setCurrentUser: handleSetCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}
