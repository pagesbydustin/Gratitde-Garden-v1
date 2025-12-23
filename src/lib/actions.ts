
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { JournalEntry, User } from '@/lib/types';
import { promises as fs } from 'fs';
import path from 'path';

// Change the data file path to be outside of the `src` directory
const dataFilePath = path.join(process.cwd(), 'data', 'data.json');
const dataDir = path.dirname(dataFilePath);

type Data = {
  users: User[];
  entries: JournalEntry[];
  settings: {
    gratitudePrompt: string;
    showExplanation: boolean;
  };
};

async function readData(): Promise<Data> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file doesn't exist, return default structure
    return {
      users: [
        { id: 'default-user', name: 'Grateful User', email: 'user@example.com', 'can-edit': true },
        { id: 'admin-user', name: 'Admin', email: 'admin@example.com', 'can-edit': true },
      ],
      entries: [],
      settings: {
        gratitudePrompt: 'What are you grateful for today?',
        showExplanation: true,
      },
    };
  }
}

async function writeData(data: Data): Promise<void> {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write data file:', error);
  }
}


/**
 * Fetches the list of all users from the JSON file.
 * @returns A promise that resolves to an array of users.
 */
export async function getUsers(): Promise<User[]> {
    const data = await readData();
    return data.users;
}

/**
 * Fetches all journal entries for all users.
 * @returns A promise that resolves to an array of all journal entries.
 */
export async function getAllEntries(): Promise<JournalEntry[]> {
    const data = await readData();
    return data.entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Fetches all journal entries for a specific user from the JSON file.
 * @param userId - The ID of the user whose entries are to be fetched.
 * @returns A promise that resolves to an array of the user's journal entries.
 */
export async function getEntries(userId: string): Promise<JournalEntry[]> {
    if (!userId) return [];
    const data = await readData();
    return data.entries
        .filter(entry => entry.userId === userId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const entrySchema = z.object({
  text: z.string().min(10, 'Your entry must be at least 10 characters long.').max(1000),
  moodScore: z.number().min(1).max(5),
  userId: z.string(),
});

/**
 * Adds a new journal entry to the JSON file.
 * @param data - The data for the new entry.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function addEntry(data: { text: string; moodScore: number; userId: string; }) {
    const parsedData = entrySchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, error: parsedData.error.flatten().fieldErrors };
    }
    
    const db = await readData();
    const newEntry: JournalEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        ...parsedData.data,
    };
    
    db.entries.push(newEntry);
    await writeData(db);

    revalidatePath('/');
    revalidatePath('/overview');
    revalidatePath('/archive');
    return { success: true, entry: newEntry };
}

const updateEntrySchema = entrySchema.extend({
  id: z.string(),
});

/**
 * Updates an existing journal entry in the JSON file.
 * @param data - The updated data for the entry.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function updateEntry(data: { id: string, text: string; moodScore: number; userId: string; }) {
    const parsedData = updateEntrySchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, error: parsedData.error.flatten().fieldErrors };
    }
    
    const db = await readData();
    const entryIndex = db.entries.findIndex(e => e.id === parsedData.data.id && e.userId === parsedData.data.userId);

    if (entryIndex === -1) {
        return { success: false, error: { form: ['Entry not found or user mismatch.']}};
    }
    
    db.entries[entryIndex] = { ...db.entries[entryIndex], ...parsedData.data };
    await writeData(db);

    revalidatePath('/');
    revalidatePath('/overview');
    revalidatePath('/archive');
    return { success: true, entry: db.entries[entryIndex] };
}


const userSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, 'Name must be at least 2 characters.'),
    email: z.string().email('Please enter a valid email.'),
    'can-edit': z.boolean(),
})

/**
 * Adds a new user to the JSON file.
 * @param user - The user data to add.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function addUser(user: User) {
    const parsedData = userSchema.safeParse(user);
    if (!parsedData.success) {
        return { success: false, error: parsedData.error.flatten().fieldErrors };
    }

    const db = await readData();
    if (db.users.some(u => u.email === parsedData.data.email)) {
        return { success: false, error: { form: ['A user with this email already exists.'] } };
    }
    
    const newUser: User = { ...parsedData.data, id: crypto.randomUUID() };
    db.users.push(newUser);
    await writeData(db);
    
    revalidatePath('/admin/dashboard');
    return { success: true, user: newUser };
}

const updateUserSchema = z.object({
    id: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters long.'),
    email: z.string().email(),
    'can-edit': z.boolean(),
});

export async function updateUser(data: User) {
    const parsedData = updateUserSchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, error: parsedData.error.flatten().fieldErrors };
    }
    
    const db = await readData();
    const userIndex = db.users.findIndex(u => u.id === parsedData.data.id);
    
    if (userIndex === -1) {
        return { success: false, error: { form: ['User not found.'] }};
    }
    
    const originalUser = db.users[userIndex];
    if (originalUser.email === 'admin@example.com' && originalUser.email !== parsedData.data.email) {
        return { success: false, error: { form: ['Cannot change the admin\'s email.'] } };
    }

    db.users[userIndex] = { ...db.users[userIndex], ...parsedData.data };
    await writeData(db);

    revalidatePath('/admin/dashboard');
    return { success: true, user: db.users[userIndex] };
}

export async function deleteUser(userId: string) {
    const db = await readData();
    
    const user = db.users.find(u => u.id === userId);
    if (user?.email === 'admin@example.com') {
        return { success: false, error: 'Cannot delete the Admin user.' };
    }
    
    db.users = db.users.filter(u => u.id !== userId);
    db.entries = db.entries.filter(e => e.userId !== userId);
    
    await writeData(db);

    revalidatePath('/admin/dashboard');
    return { success: true };
}


const settingsSchema = z.object({
    gratitudePrompt: z.string().min(5, 'Prompt must be at least 5 characters.'),
    showExplanation: z.boolean(),
});

export async function getSettings() {
    const db = await readData();
    return db.settings;
}

export async function updateSettings(data: { gratitudePrompt: string, showExplanation: boolean }) {
    const parsedData = settingsSchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, error: parsedData.error.flatten().fieldErrors };
    }

    const db = await readData();
    db.settings = parsedData.data;
    await writeData(db);
    
    revalidatePath('/');
    revalidatePath('/admin/dashboard');
    return { success: true, settings: parsedData.data };
}
