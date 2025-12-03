
'use client';

import { useContext, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User as UserIcon, ChevronsUpDown } from 'lucide-react';
import { UserContext } from '@/context/UserContext';
import { AdminPasscodeDialog } from './AdminPasscodeDialog';
import type { User } from '@/lib/types';

/**
 * A dropdown menu component that allows the user to select a user profile.
 * The selected user is managed through the `UserContext`.
 */
export function UserSelection() {
  const { users, currentUser, setCurrentUser } = useContext(UserContext);
  const [isPasscodeDialogOpen, setIsPasscodeDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleUserSelect = (user: User) => {
    if (user.name === 'Admin') {
      setSelectedUser(user);
      setIsPasscodeDialogOpen(true);
    } else {
      setCurrentUser(user);
    }
  };

  const handlePasscodeSuccess = () => {
    if (selectedUser) {
      setCurrentUser(selectedUser);
    }
    setIsPasscodeDialogOpen(false);
  };
  
  const adminUser = users.find(u => u.name === 'Admin');
  const displayUser = currentUser ?? adminUser;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[180px] justify-between">
            {displayUser ? (
              <>
                <UserIcon className="mr-2 h-4 w-4" />
                {displayUser.name}
              </>
            ) : (
              'Select User'
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[180px]">
          {users.map((user) => (
            <DropdownMenuItem key={user.id} onSelect={() => handleUserSelect(user)}>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>{user.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <AdminPasscodeDialog
        isOpen={isPasscodeDialogOpen}
        onClose={() => setIsPasscodeDialogOpen(false)}
        onSuccess={handlePasscodeSuccess}
      />
    </>
  );
}
