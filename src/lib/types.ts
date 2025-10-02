export type JournalEntry = {
  id: string;
  date: string;
  moodScore: number;
  text: string;
  prompt?: string;
  userId: number;
};

export type User = {
  id: number;
  name: string;
  "can-edit": boolean;
};
