
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { JournalEntry, User } from '@/lib/types';
import usersData from './users.json';
import entriesData from './entries.json';

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
  const entries = (entriesData as JournalEntry[]).map(entry => ({
    ...entry,
    date: new Date(entry.date).toISOString(),
  }));
  const userEntries = entries.filter(entry => entry.userId === userId);
  return userEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const entrySchema = z.object({
  text: z.string().min(10, 'Your entry must be at least 10 characters long.').max(1000),
  moodScore: z.number().min(1).max(5),
  userId: z.number(),
});

/**
 * Adds a new journal entry.
 * Note: This function is a placeholder and does not persist data on a read-only filesystem.
 * @param data - The data for the new entry, including text, mood score, and user ID.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function addEntry(data: { text: string; moodScore: number; userId: number; }) {
  const parsedData = entrySchema.safeParse(data);

  if (!parsedData.success) {
    return { success: false, error: parsedData.error.flatten().fieldErrors };
  }

  // In a real application, this would write to a database.
  // On a read-only filesystem like Netlify, we simulate success without writing.
  const newEntry: JournalEntry = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    ...parsedData.data,
  };

  revalidatePath('/');
  revalidatePath('/overview');
  revalidatePath('/archive');
  return { success: true, entry: newEntry };
}

const updateEntrySchema = entrySchema.extend({
  id: z.string(),
});

/**
 * Updates an existing journal entry.
 * Note: This function is a placeholder and does not persist data on a read-only filesystem.
 * @param data - The updated data for the entry.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function updateEntry(data: { id: string, text: string; moodScore: number; userId: number; }) {
    const parsedData = updateEntrySchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, error: parsedData.error.flatten().fieldErrors };
    }

    // In a real application, you would find and update the entry in a database.
    // We will simulate success.
    const { id, text, moodScore, userId } = parsedData.data;

    const updatedEntry: JournalEntry = {
        id,
        text,
        moodScore,
        userId,
        date: new Date().toISOString(), // This would typically be the original date
    };

    revalidatePath('/');
    revalidatePath('/overview');
    revalidatePath('/archive');
    return { success: true, entry: updatedEntry };
}
