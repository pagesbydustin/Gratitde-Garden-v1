import type { User as FirebaseUser } from 'firebase/auth';

/**
 * Represents a single journal entry.
 */
export type JournalEntry = {
  /** A unique identifier for the entry. */
  id: string;
  /** The ISO 8601 date string of when the entry was created. */
  date: string;
  /** A numerical score from 1 to 5 representing the user's mood. */
  moodScore: number;
  /** The text content of the journal entry. */
  text: string;
  /** An optional prompt that inspired the entry. */
  prompt?: string;
  /** The ID of the user who created the entry. */
  userId: string;
};

/**
 * Represents a user of the application.
 */
export interface User extends Partial<FirebaseUser> {
  /** A unique identifier for the user. */
  id?: string;
  /** The name of the user. */
  name?: string | null;
  /** A flag indicating whether the user has permission to edit entries. */
  'can-edit'?: boolean;
}
