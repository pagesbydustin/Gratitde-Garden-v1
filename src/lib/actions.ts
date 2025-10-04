
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { JournalEntry, User } from '@/lib/types';
import usersData from './users.json';
import initialEntries from './entries.json';

// In-memory store for entries to simulate a database.
// This will reset when the server instance restarts.
let entriesData: JournalEntry[] = initialEntries.map(entry => ({
  ...entry,
  date: new Date(entry.date).toISOString(),
}));

/**
 * Fetches the list of all users.
 * @returns A promise that resolves to an array of users.
 */
export async function getUsers(): Promise<User[]> {
    return usersData as User[];
}

/**
 * Fetches all journal entries for a specific user, sorted by date in descending order.
 * In a real application, this would fetch from a database.
 * @param userId - The ID of the user whose entries are to be fetched.
 * @returns A promise that resolves to an array of the user's journal entries.
 */
export async function getEntries(userId: number): Promise<JournalEntry[]> {
  const userEntries = entriesData.filter(entry => entry.userId === userId);
  return userEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const entrySchema = z.object({
  text: z.string().min(10, 'Your entry must be at least 10 characters long.').max(1000),
  moodScore: z.number().min(1).max(5),
  userId: z.number(),
});

/**
 * Adds a new journal entry to the in-memory store.
 * @param data - The data for the new entry, including text, mood score, and user ID.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function addEntry(data: { text: string; moodScore: number; userId: number; }) {
  const parsedData = entrySchema.safeParse(data);

  if (!parsedData.success) {
    return { success: false, error: parsedData.error.flatten().fieldErrors };
  }

  const newEntry: JournalEntry = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    ...parsedData.data,
  };

  // Add the new entry to our in-memory store
  entriesData.push(newEntry);

  revalidatePath('/');
  revalidatePath('/overview');
  revalidatePath('/archive');
  return { success: true, entry: newEntry };
}

const updateEntrySchema = entrySchema.extend({
  id: z.string(),
});

/**
 * Updates an existing journal entry in the in-memory store.
 * @param data - The updated data for the entry.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function updateEntry(data: { id: string, text: string; moodScore: number; userId: number; }) {
    const parsedData = updateEntrySchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, error: parsedData.error.flatten().fieldErrors };
    }

    const { id, ...values } = parsedData.data;

    const entryIndex = entriesData.findIndex(entry => entry.id === id);

    if (entryIndex === -1) {
      return { success: false, error: { form: ['Entry not found.'] } };
    }

    // Update the entry in our in-memory store
    const updatedEntry = { ...entriesData[entryIndex], ...values };
    entriesData[entryIndex] = updatedEntry;


    revalidatePath('/');
    revalidatePath('/overview');
    revalidatePath('/archive');
    return { success: true, entry: updatedEntry };
}
