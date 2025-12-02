
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { JournalEntry, User } from '@/lib/types';
import initialUsersData from './users.json';
import initialEntriesData from './entries.json';
import fs from 'fs/promises';
import path from 'path';

// Define the paths to the JSON files
const entriesFilePath = path.join(process.cwd(), 'src', 'lib', 'entries.json');
const usersFilePath = path.join(process.cwd(), 'src', 'lib', 'users.json');
const settingsFilePath = path.join(process.cwd(), 'src', 'lib', 'settings.json');


/**
 * Reads all entries from the JSON file.
 * @returns A promise that resolves to an array of journal entries.
 */
async function readEntries(): Promise<JournalEntry[]> {
    try {
        const data = await fs.readFile(entriesFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.warn(`Could not read ${entriesFilePath}. Returning initial entry data. This is expected on first run or in a read-only environment.`);
        return initialEntriesData as JournalEntry[];
    }
}

/**
 * Writes an array of entries to the JSON file.
 * @param entries - The array of journal entries to write.
 */
async function writeEntries(entries: JournalEntry[]): Promise<void> {
    try {
        await fs.writeFile(entriesFilePath, JSON.stringify(entries, null, 2), 'utf-8');
    } catch (writeError) {
        console.warn(`Could not write to ${entriesFilePath}. This is expected in a read-only production environment.`);
    }
}

/**
 * Reads all users from the JSON file.
 * @returns A promise that resolves to an array of users.
 */
async function readUsers(): Promise<User[]> {
     try {
        const data = await fs.readFile(usersFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.warn(`Could not read ${usersFilePath}. Returning initial user data. This is expected on first run or in a read-only environment.`);
        return initialUsersData;
    }
}

/**
 * Writes an array of users to the JSON file.
 * @param users - The array of users to write.
 */
async function writeUsers(users: User[]): Promise<void> {
    try {
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
    } catch (writeError) {
        console.warn(`Could not write to ${usersFilePath}. This is expected in a read-only production environment.`);
    }
}

const defaultSettings = {
  gratitudePrompt: "What are you grateful for?",
  showExplanation: true,
};

async function readSettings() {
    try {
        const data = await fs.readFile(settingsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.warn(`Could not read ${settingsFilePath}. Returning default settings. This is expected on first run or in a read-only environment.`);
        return defaultSettings;
    }
}

async function writeSettings(settings: any) {
    try {
        await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
    } catch (writeError) {
        console.warn(`Could not write to ${settingsFilePath}. This is expected in a read-only production environment.`);
    }
}

export async function getSettings() {
    return await readSettings();
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

    await writeSettings(parsedData.data);
    
    revalidatePath('/');
    revalidatePath('/admin/dashboard');
    return { success: true, settings: parsedData.data };
}


/**
 * Fetches the list of all users.
 * @returns A promise that resolves to an array of users.
 */
export async function getUsers(): Promise<User[]> {
    return await readUsers();
}

/**
 * Fetches all journal entries for a specific user, sorted by date in descending order.
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
 * Adds a new journal entry.
 * @param data - The data for the new entry.
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
 * Updates an existing journal entry.
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

    const updatedEntry = { ...allEntries[entryIndex], ...values };
    allEntries[entryIndex] = updatedEntry;
    
    await writeEntries(allEntries);


    revalidatePath('/');
    revalidatePath('/overview');
    revalidatePath('/archive');
    return { success: true, entry: updatedEntry };
}

const userSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long.'),
    'can-edit': z.boolean(),
});

/**
 * Adds a new user.
 * @param data - The data for the new user.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function addUser(data: { name: string; 'can-edit': boolean }) {
    const parsedData = userSchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, error: parsedData.error.flatten().fieldErrors };
    }

    const users = await readUsers();
    if (parsedData.data.name.toLowerCase() === 'admin') {
      return { success: false, error: { name: ['"Admin" is a reserved name.'] } };
    }
    
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

    const newUser: User = {
        id: newId,
        ...parsedData.data,
    };

    users.push(newUser);
    await writeUsers(users);

    revalidatePath('/admin/dashboard');
    return { success: true, user: newUser };
}

const updateUserSchema = userSchema.extend({
    id: z.number(),
});

/**
 * Updates an existing user.
 * @param data - The updated data for the user.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function updateUser(data: { id: number, name: string; 'can-edit': boolean }) {
    const parsedData = updateUserSchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, error: parsedData.error.flatten().fieldErrors };
    }

    const users = await readUsers();
    const { id, ...values } = parsedData.data;

    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
        return { success: false, error: { form: ['User not found.'] } };
    }
    
    const userToUpdate = users[userIndex];
    if (userToUpdate.name === 'Admin' && values.name !== 'Admin') {
        return { success: false, error: { name: ['Cannot rename the Admin user.'] } };
    }

    const updatedUser = { ...userToUpdate, ...values };
    users[userIndex] = updatedUser;

    await writeUsers(users);

    revalidatePath('/admin/dashboard');
    return { success: true, user: updatedUser };
}


/**
 * Deletes a user.
 * @param userId - The ID of the user to delete.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function deleteUser(userId: number) {
    const users = await readUsers();

    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) {
        return { success: false, error: 'User not found.' };
    }
    if (userToDelete.name === 'Admin') {
        return { success: false, error: 'Cannot delete the Admin user.' };
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    await writeUsers(updatedUsers);
    
    // Also delete associated entries
    const allEntries = await readEntries();
    const updatedEntries = allEntries.filter(entry => entry.userId !== userId);
    await writeEntries(updatedEntries);

    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    revalidatePath('/overview');
    revalidatePath('/archive');
    return { success: true };
}
