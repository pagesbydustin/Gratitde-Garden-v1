
'use client';

import {
  onSnapshot,
  collection,
  query,
  where,
  CollectionReference,
  Query,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useFirestore } from '../provider';
import { FirestorePermissionError, SecurityRuleContext } from '../errors';
import { errorEmitter } from '../error-emitter';

export function useCollection<T>(path: string, uid: string | undefined) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const db = useFirestore();

  useEffect(() => {
    if (!uid) {
      setData([]);
      setLoading(false);
      return;
    }

    const collRef: CollectionReference = collection(db, path);
    const q: Query = query(collRef, where('uid', '==', uid));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const collectionData: T[] = [];
        querySnapshot.forEach((doc) => {
          collectionData.push({
            id: doc.id,
            ...doc.data(),
          } as T);
        });
        setData(collectionData);
        setLoading(false);
      },
      async (err: Error) => {
        const permissionError = new FirestorePermissionError({
          path: (q as Query).path,
          operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setError(permissionError);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path, db, uid]);

  return { data, loading, error };
}
