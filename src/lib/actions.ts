'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { JournalEntry } from '@/lib/types';
import fs from 'fs/promises';
import path from 'path';

const entriesFilePath = path.join(process.cwd(), 'src/lib/entries.json');

async function readEntries(): Promise<JournalEntry[]> {
  try {
    const data = await fs.readFile(entriesFilePath, 'utf-8');
    const entries = JSON.parse(data);
    // Ensure date objects are correctly parsed
    return entries.map((entry: JournalEntry) => ({
      ...entry,
      date: new Date(entry.date).toISOString(),
    }));
  } catch (error) {
    // If the file doesn't exist or is empty, return an empty array
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Error reading entries file:', error);
    return [];
  }
}

async function writeEntries(entries: JournalEntry[]): Promise<void> {
  try {
    const data = JSON.stringify(entries, null, 2);
    await fs.writeFile(entriesFilePath, data, 'utf-8');
  } catch (error) {
    console.error('Error writing entries file:', error);
  }
}


export async function getEntries(): Promise<JournalEntry[]> {
  const entries = await readEntries();
  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const addEntrySchema = z.object({
  text: z.string().min(10, 'Your entry must be at least 10 characters long.'),
  moodScore: z.number().min(1).max(5),
});

export async function addEntry(data: { text: string; moodScore: number; }) {
  const parsedData = addEntrySchema.safeParse(data);

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
  return { success: true, entry: newEntry };
}
