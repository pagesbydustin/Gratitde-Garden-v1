
'use server';

import { initializeApp, getApps, getApp, App, cert, AppOptions } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const firebaseAdminConfig: AppOptions = {
    credential: cert({
        project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        client_email: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL!,
        // Correctly format the private key by replacing escaped newlines.
        private_key: (process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    })
};


let app: App;
if (!getApps().length) {
    app = initializeApp(firebaseAdminConfig);
} else {
    app = getApp();
}

const firestore: Firestore = getFirestore(app);

export { app, firestore };
