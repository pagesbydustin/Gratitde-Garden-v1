
import type { FirebaseOptions } from 'firebase/app';

// This configuration is hardcoded to ensure it is always available on the client-side
// and to prevent the persistent "auth/invalid-api-key" error.
export const firebaseConfig: FirebaseOptions = {
  projectId: "studio-2457564384-1d9c3",
  appId: "1:1032195231209:web:770b100796fd5dbbb58f78",
  apiKey: "AIzaSyBT4ivZXOr3vRwntE3LSsG-Wtj53s6w6Fs",
  authDomain: "studio-2457564384-1d9c3.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "1032195231209",
  storageBucket: "studio-2457564384-1d9c3.appspot.com",
};
