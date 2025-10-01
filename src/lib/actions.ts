'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { JournalEntry } from '@/lib/types';

// This is a mock in-memory store. In a real app, you would use a database like Firestore.
const mockEntries: JournalEntry[] = [
  {
    id: '1',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    moodScore: 4,
    text: 'I had a wonderful video call with an old friend I hadn’t seen in years. It was so good to catch up and laugh about old times. Feeling very connected and happy.',
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000).toISOString(),
    moodScore: 5,
    text: 'Finished a big project at work that I was really passionate about. Seeing it all come together is incredibly satisfying. Proud of what our team accomplished.',
  },
  {
    id: '3',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    moodScore: 2,
    text: 'Feeling a bit down today. It was rainy and I got stuck in traffic for over an hour. Just one of those days where nothing seems to go right. Grateful for a warm cup of tea and a cozy blanket tonight, though.',
  },
];

let entries: JournalEntry[] = [...mockEntries];

export async function getEntries(): Promise<JournalEntry[]> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));
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

  const newEntry: JournalEntry = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    ...parsedData.data,
  };

  entries.unshift(newEntry);
  revalidatePath('/');
  return { success: true, entry: newEntry };
}
