'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { JournalEntry, User } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

const entriesFilePath = path.join(process.cwd(), 'src/lib/entries.json');
const usersFilePath = path.join(process.cwd(), 'src/lib/users.json');


/**
 * Reads all journal entries from the JSON file.
 * Creates the file with an empty array if it doesn't exist.
 * @returns A promise that resolves to an array of journal entries.
 */
async function readEntries(): Promise<JournalEntry[]> {
  try {
    const data = await fs.readFile(entriesFilePath, 'utf-8');
    const entries = JSON.parse(data);
    return entries.map((entry: JournalEntry) => ({
      ...entry,
      date: new Date(entry.date).toISOString(),
    }));
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      // If the file doesn't exist, create it with an empty array.
      await writeEntries([]);
      return [];
    }
    // For other errors, re-throw to be handled by the caller.
    throw new Error('Failed to read journal entries.');
  }
}

/**
 * Writes an array of journal entries to the JSON file.
 * @param entries - The array of entries to write.
 */
async function writeEntries(entries: JournalEntry[]): Promise<void> {
  try {
    const data = JSON.stringify(entries, null, 2);
    await fs.writeFile(entriesFilePath, data, 'utf-8');
  } catch (error) {
    throw new Error('Failed to write journal entries.');
  }
}

/**
 * Fetches the list of all users from the JSON file.
 * @returns A promise that resolves to an array of users.
 */
export async function getUsers(): Promise<User[]> {
    try {
        const data = await fs.readFile(usersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        throw new Error('Failed to read users.');
    }
}

/**
 * Fetches all journal entries for a specific user, sorted by date in descending order.
 * @param userId - The ID of the user whose entries are to be fetched.
 * @returns A promise that resolves to an array of the user's journal entries.
 */
export async function getEntries(userId: number): Promise<JournalEntry[]> {
  const entries = await readEntries();
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
 * @param data - The data for the new entry, including text, mood score, and user ID.
 * @returns A promise that resolves to an object indicating success or failure, along with the new entry or error details.
 */
export async function addEntry(data: { text: string; moodScore: number; userId: number; }) {
  const parsedData = entrySchema.safeParse(data);

  if (!parsedData.success) {
    return { success: false, error: parsedData.error.flatten().fieldErrors };
  }
  
  const entries = await readEntries();

  const newEntry: JournalEntry = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    ...parsedData.data,
  };

  const updatedEntries = [newEntry, ...entries];
  await writeEntries(updatedEntries);

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
 * @param data - The updated data for the entry, including the entry ID, text, mood score, and user ID.
 * @returns A promise that resolves to an object indicating success or failure, along with the updated entry or error details.
 */
export async function updateEntry(data: { id: string, text: string; moodScore: number; userId: number; }) {
    const parsedData = updateEntrySchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, error: parsedData.error.flatten().fieldErrors };
    }

    const entries = await readEntries();
    const { id, text, moodScore } = parsedData.data;

    const entryIndex = entries.findIndex((e) => e.id === id);

    if (entryIndex === -1) {
        return { success: false, error: { form: ['Entry not found.'] } };
    }
    
    // Ensure the user owns the entry
    if (entries[entryIndex].userId !== parsedData.data.userId) {
        return { success: false, error: { form: ['Unauthorized.'] } };
    }

    entries[entryIndex] = { ...entries[entryIndex], text, moodScore };
    await writeEntries(entries);

    revalidatePath('/');
    revalidatePath('/overview');
    revalidatePath('/archive');
    return { success: true, entry: entries[entryIndex] };
}
