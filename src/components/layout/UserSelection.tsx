'use client';

import { useContext } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User as UserIcon, ChevronsUpDown } from 'lucide-react';
import { UserContext } from '@/context/UserContext';

/**
 * A dropdown menu component that allows the user to select a user profile.
 * The selected user is managed through the `UserContext`.
 */
export function UserSelection() {
  const { users, currentUser, setCurrentUser } = useContext(UserContext);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[180px] justify-between">
          {currentUser ? (
            <>
              <UserIcon className="mr-2 h-4 w-4" />
              {currentUser.name}
            </>
          ) : (
            'Select User'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[180px]">
        {users.map((user) => (
          <DropdownMenuItem key={user.id} onSelect={() => setCurrentUser(user)}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>{user.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
