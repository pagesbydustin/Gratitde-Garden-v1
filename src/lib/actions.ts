
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { JournalEntry, User } from '@/lib/types';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, orderBy, writeBatch } from 'firebase-admin/firestore';
import { firestore } from '@/firebase/server';

/**
 * Fetches the list of all users from Firestore.
 * @returns A promise that resolves to an array of users.
 */
export async function getUsers(): Promise<User[]> {
    const usersCol = collection(firestore, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    return userList;
}

/**
 * Fetches all journal entries for all users.
 * @returns A promise that resolves to an array of all journal entries.
 */
export async function getAllEntries(): Promise<JournalEntry[]> {
    const users = await getUsers();
    const allEntries: JournalEntry[] = [];
    for (const user of users) {
        if (user.id) {
            const entriesCol = collection(firestore, 'users', user.id, 'entries');
            const entriesSnapshot = await getDocs(entriesCol);
            const userEntries = entriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));
            allEntries.push(...userEntries);
        }
    }
    return allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Fetches all journal entries for a specific user from Firestore.
 * @param userId - The ID of the user whose entries are to be fetched.
 * @returns A promise that resolves to an array of the user's journal entries.
 */
export async function getEntries(userId: string): Promise<JournalEntry[]> {
    if (!userId) return [];
    const entriesCol = collection(firestore, 'users', userId, 'entries');
    const q = query(entriesCol, orderBy('date', 'desc'));
    const entriesSnapshot = await getDocs(q);
    const entriesList = entriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));
    return entriesList;
}

const entrySchema = z.object({
  text: z.string().min(10, 'Your entry must be at least 10 characters long.').max(1000),
  moodScore: z.number().min(1).max(5),
  userId: z.string(),
});

/**
 * Adds a new journal entry to Firestore.
 * @param data - The data for the new entry.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function addEntry(data: { text: string; moodScore: number; userId: string; }) {
    const parsedData = entrySchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, error: parsedData.error.flatten().fieldErrors };
    }

    const { userId, text, moodScore } = parsedData.data;

    const newEntry = {
        date: new Date().toISOString(),
        text,
        moodScore,
        userId,
    };

    const entriesCol = collection(firestore, 'users', userId, 'entries');
    const docRef = await addDoc(entriesCol, newEntry);

    const createdEntry: JournalEntry = { id: docRef.id, ...newEntry };

    revalidatePath('/');
    revalidatePath('/overview');
    revalidatePath('/archive');
    return { success: true, entry: createdEntry };
}

const updateEntrySchema = entrySchema.extend({
  id: z.string(),
});

/**
 * Updates an existing journal entry in Firestore.
 * @param data - The updated data for the entry.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function updateEntry(data: { id: string, text: string; moodScore: number; userId: string; }) {
    const parsedData = updateEntrySchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, error: parsedData.error.flatten().fieldErrors };
    }
    
    const { id, userId, ...values } = parsedData.data;
    const entryRef = doc(firestore, 'users', userId, 'entries', id);

    await updateDoc(entryRef, values);

    const updatedEntryDoc = await getDoc(entryRef);
    const updatedEntry = { id: updatedEntryDoc.id, ...updatedEntryDoc.data() } as JournalEntry;

    revalidatePath('/');
    revalidatePath('/overview');
    revalidatePath('/archive');
    return { success: true, entry: updatedEntry };
}


// These actions now interact with Firestore instead of JSON files.
// User creation is primarily handled by Firebase Authentication on the client.
// This function can be used to create the user document in Firestore after auth.
export async function addUser(user: User) {
    if (!user.id) return { success: false, error: 'User ID is required' };
    const userRef = doc(firestore, 'users', user.id);
    // Use setDoc here to create the document if it doesn't exist.
    await updateDoc(userRef, { ...user }, { merge: true });
    revalidatePath('/admin/dashboard');
    return { success: true, user };
}

const updateUserSchema = z.object({
    id: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters long.'),
    'can-edit': z.boolean(),
});

export async function updateUser(data: { id: string, name: string; 'can-edit': boolean }) {
    const parsedData = updateUserSchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, error: parsedData.error.flatten().fieldErrors };
    }
    
    const { id, ...values } = parsedData.data;
    const userRef = doc(firestore, 'users', id);
    
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (userData?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && values.name !== userData.name) {
        return { success: false, error: { name: ['Cannot rename the Admin user.'] } };
    }

    await updateDoc(userRef, values);
    
    const updatedUserDoc = await getDoc(userRef);
    const updatedUser = { id: updatedUserDoc.id, ...updatedUserDoc.data() } as User;

    revalidatePath('/admin/dashboard');
    return { success: true, user: updatedUser };
}

export async function deleteUser(userId: string) {
    const userRef = doc(firestore, 'users', userId);
    
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    if (userData?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        return { success: false, error: 'Cannot delete the Admin user.' };
    }
    
    // Delete user's entries subcollection
    const entriesCol = collection(firestore, 'users', userId, 'entries');
    const entriesSnapshot = await getDocs(entriesCol);
    const batch = writeBatch(firestore);
    entriesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete the user document itself
    await deleteDoc(userRef);

    revalidatePath('/admin/dashboard');
    return { success: true };
}


// Settings are now stored in a 'settings' collection.
const settingsDocRef = doc(firestore, 'app-settings', 'global');

export async function getSettings() {
    try {
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            // Default settings
            return {
                gratitudePrompt: "What are you grateful for today?",
                showExplanation: true,
            };
        }
    } catch (error) {
        console.error("Error fetching settings:", error);
         return {
            gratitudePrompt: "What are you grateful for today?",
            showExplanation: true,
        };
    }
}

const settingsSchema = z.object({
    gratitudePrompt: z.string().min(5, 'Prompt must be at least 5 characters.'),
    showExplanation: z.boolean(),
});

export async function updateSettings(data: { gratitudePrompt: string, showExplanation: boolean }) {
    const parsedData = settingsSchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, error: parsedData.error.flatten().fieldErrors };
    }

    await updateDoc(settingsDocRef, parsedData.data, { merge: true });
    
    revalidatePath('/');
    revalidatePath('/admin/dashboard');
    return { success: true, settings: parsedData.data };
}
