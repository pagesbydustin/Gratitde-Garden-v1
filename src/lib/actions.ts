'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { JournalEntry } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

const entriesFilePath = path.join(process.cwd(), 'src/lib/entries.json');

// A more robust way to handle file reading and writing.
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

async function writeEntries(entries: JournalEntry[]): Promise<void> {
  try {
    const data = JSON.stringify(entries, null, 2);
    await fs.writeFile(entriesFilePath, data, 'utf-8');
  } catch (error) {
    throw new Error('Failed to write journal entries.');
  }
}


export async function getEntries(): Promise<JournalEntry[]> {
  const entries = await readEntries();
  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const entrySchema = z.object({
  text: z.string().min(10, 'Your entry must be at least 10 characters long.').max(1000),
  moodScore: z.number().min(1).max(5),
});

export async function addEntry(data: { text: string; moodScore: number; }) {
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

export async function updateEntry(data: { id: string, text: string; moodScore: number; }) {
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

    entries[entryIndex] = { ...entries[entryIndex], text, moodScore };
    await writeEntries(entries);

    revalidatePath('/');
    revalidatePath('/overview');
    revalidatePath('/archive');
    return { success: true, entry: entries[entryIndex] };
}
