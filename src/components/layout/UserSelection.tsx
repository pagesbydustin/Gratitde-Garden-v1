
'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User as UserIcon, ChevronsUpDown } from 'lucide-react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { addUser } from '@/lib/actions';

/**
 * A dropdown menu component that allows the user to sign in anonymously.
 */
export function UserSelection() {
  const { toast } = useToast();

  const handleSignIn = async () => {
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      
      // Create a user document in Firestore
      await addUser({
        id: user.uid,
        name: `User ${user.uid.substring(0, 5)}`,
        email: user.email || 'anonymous',
        'can-edit': true,
      });

      toast({
        title: 'Welcome!',
        description: 'You are now signed in anonymously.',
      });
    } catch (error) {
      console.error('Anonymous sign-in failed', error);
      toast({
        variant: 'destructive',
        title: 'Sign-in Failed',
        description: 'Could not sign in. Please try again.',
      });
    }
  };

  return (
    <Button onClick={handleSignIn}>
        <UserIcon className="mr-2 h-4 w-4" />
        Sign In to Start
    </Button>
  );
}
