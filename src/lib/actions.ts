
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { JournalEntry, User } from '@/lib/types';
import usersData from './users.json';
import fs from 'fs/promises';
import path from 'path';

// Define the path to the entries.json file
const entriesFilePath = path.join(process.cwd(), 'src', 'lib', 'entries.json');

/**
 * Reads all entries from the JSON file.
 * @returns A promise that resolves to an array of journal entries.
 */
async function readEntries(): Promise<JournalEntry[]> {
    try {
        const data = await fs.readFile(entriesFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist or is empty, return an empty array
        return [];
    }
}

/**
 * Writes an array of entries to the JSON file.
 * @param entries - The array of journal entries to write.
 */
async function writeEntries(entries: JournalEntry[]): Promise<void> {
    await fs.writeFile(entriesFilePath, JSON.stringify(entries, null, 2), 'utf-8');
}


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
  const allEntries = await readEntries();
  const userEntries = allEntries.filter(entry => entry.userId === userId);
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

  const allEntries = await readEntries();
  allEntries.unshift(newEntry);
  await writeEntries(allEntries);

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
    
    const allEntries = await readEntries();
    const { id, ...values } = parsedData.data;

    const entryIndex = allEntries.findIndex(entry => entry.id === id);

    if (entryIndex === -1) {
      return { success: false, error: { form: ['Entry not found.'] } };
    }

    // Update the entry in our in-memory store
    const updatedEntry = { ...allEntries[entryIndex], ...values };
    allEntries[entryIndex] = updatedEntry;
    
    await writeEntries(allEntries);


    revalidatePath('/');
    revalidatePath('/overview');
    revalidatePath('/archive');
    return { success: true, entry: updatedEntry };
}

