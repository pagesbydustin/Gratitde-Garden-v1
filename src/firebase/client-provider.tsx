'use client';

import { ReactNode } from 'react';
// Correctly import the *types* not the instances
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { FirebaseProvider } from './provider';

/**
 * Wraps the main FirebaseProvider to ensure Firebase is only initialized
 * on the client-side. This is the provider that should be used in the
 * root layout of the application.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  // Import and initialize Firebase only on the client side.
  // This prevents server-side rendering (SSR) from trying to initialize
  // the client SDK, which was the root cause of the 'invalid-api-key' error.
  const { app, auth, firestore } = require('./client');

  return (
    <FirebaseProvider app={app as FirebaseApp} auth={auth as Auth} firestore={firestore as Firestore}>
      {children}
    </FirebaseProvider>
  );
}
