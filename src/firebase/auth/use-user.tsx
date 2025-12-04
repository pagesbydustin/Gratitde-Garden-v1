
'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import type { User as AppUser } from '@/lib/types';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError, SecurityRuleContext } from '../errors';

export const useUser = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const db = useFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snapshot = onSnapshot(
          userRef,
          (doc) => {
            if (doc.exists()) {
              const appUser: AppUser = {
                id: doc.id,
                ...doc.data(),
                ...firebaseUser,
              };
              setUser(appUser);
            } else {
              setUser(firebaseUser); // User exists in Auth but not Firestore
            }
            setLoading(false);
          },
          async (err: Error) => {
            const permissionError = new FirestorePermissionError({
              path: userRef.path,
              operation: 'get',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
            setUser(null);
            setLoading(false);
          }
        );
        return () => snapshot();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  return { user, setUser, loading };
};
