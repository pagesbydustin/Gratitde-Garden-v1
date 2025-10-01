'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSimilarMoodEntries } from '@/ai/flows/ai-mood-entry-inspiration';
import type { JournalEntry } from '@/lib/types';

// This is a mock in-memory store. In a real app, you would use a database like Firestore.
const mockEntries: JournalEntry[] = [
  {
    id: '1',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    moodScore: 4,
    text: 'I had a wonderful video call with an old friend I hadn’t seen in years. It was so good to catch up and laugh about old times. Feeling very connected and happy.',
    prompt: 'What relationship are you most grateful for right now?',
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000).toISOString(),
    moodScore: 5,
    text: 'Finished a big project at work that I was really passionate about. Seeing it all come together is incredibly satisfying. Proud of what our team accomplished.',
    prompt: 'What is an accomplishment, big or small, that you are proud of?',
  },
  {
    id: '3',
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    moodScore: 2,
    text: 'Feeling a bit down today. It was rainy and I got stuck in traffic for over an hour. Just one of those days where nothing seems to go right. Grateful for a warm cup of tea and a cozy blanket tonight, though.',
    prompt: 'What is a simple comfort that you appreciate?',
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
  prompt: z.string().optional(),
});

export async function addEntry(data: { text: string; moodScore: number; prompt?: string }) {
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

export async function getInspiration(currentMoodScore: number) {
  if (entries.length < 2) {
    return { similarEntries: [] };
  }
  
  const pastEntriesForAI = entries.map(({ id, moodScore, text }) => ({ id, moodScore, text }));

  try {
    const result = await getSimilarMoodEntries({
      currentMoodScore,
      pastEntries: pastEntriesForAI,
    });
    return result;
  } catch (error) {
    console.error('Error getting AI inspiration:', error);
    return { similarEntries: [] };
  }
}
