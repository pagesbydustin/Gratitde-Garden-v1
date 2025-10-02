
'use client';

import { Suspense, useContext, useEffect, useState } from 'react';
import { getEntries } from '@/lib/actions';
import { NewEntryForm } from '@/components/gratitude/NewEntryForm';
import { EntryList } from '@/components/gratitude/EntryList';
import { endOfWeek, isWithinInterval, startOfWeek } from 'date-fns';
import Image from 'next/image';
import placeholderImageData from '@/lib/placeholder-images.json';
import { UserContext } from '@/context/UserContext';
import { type JournalEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { hero } = placeholderImageData;
  return (
    <div className="flex justify-center min-h-screen bg-background text-foreground font-body">
      <main className="w-full max-w-2xl px-4 py-8 md:py-12 space-y-12">
        <header className="text-center space-y-4">
            <div className="w-48 h-48 mx-auto text-primary">
              <Image
                src={hero.src}
                alt="A beautiful flower representing growth and gratitude"
                width={hero.width}
                height={hero.height}
                className="rounded-full object-cover w-full h-full"
                data-ai-hint="flower"
              />
            </div>
            <h1 className="text-4xl font-headline font-bold text-primary">Gratitude Garden</h1>
            <p className="text-muted-foreground">Cultivate joy, one entry at a time.</p>
        </header>
        
        <NewEntrySection />

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-headline font-semibold">This Week's Entries</h2>
          </div>
          <Suspense fallback={<EntryList.Skeleton />}>
            <PastEntriesSection />
          </Suspense>
        </section>
      </main>
    </div>
  );
}

function NewEntrySection() {
  const { currentUser } = useContext(UserContext);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      getEntries(currentUser.id).then((userEntries) => {
        setEntries(userEntries);
        setLoading(false);
      });
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }
  
  const latestEntryDate = entries.length > 0 ? new Date(entries[0].date) : new Date(0);
  const today = new Date();
  const hasPostedToday = 
    latestEntryDate.getDate() === today.getDate() &&
    latestEntryDate.getMonth() === today.getMonth() &&
    latestEntryDate.getFullYear() === today.getFullYear();

  return <NewEntryForm hasPostedToday={hasPostedToday} />;
}

function PastEntriesSection() {
  const { currentUser } = useContext(UserContext);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
   const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      getEntries(currentUser.id).then((userEntries) => {
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
        const weekEnd = endOfWeek(today, { weekStartsOn: 0 }); // Saturday

        const currentWeekEntries = userEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
        });
        setEntries(currentWeekEntries);
        setLoading(false);
      });
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) {
    return <EntryList.Skeleton />;
  }

  return <EntryList entries={entries} />;
}
