'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { type User } from '@/lib/types';
import { getUsers } from '@/lib/actions';

type UserContextType = {
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
};

export const UserContext = createContext<UserContextType>({
  users: [],
  currentUser: null,
  setCurrentUser: () => {},
});

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
