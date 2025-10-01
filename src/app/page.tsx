import { Suspense } from 'react';
import Link from 'next/link';
import { getEntries } from '@/lib/actions';
import { NewEntryForm } from '@/components/gratitude/NewEntryForm';
import { EntryList } from '@/components/gratitude/EntryList';
import { GratitudeIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { endOfWeek, isWithinInterval, startOfWeek } from 'date-fns';

export const revalidate = 0;

export default function Home() {
  return (
    <div className="flex justify-center min-h-screen bg-background text-foreground font-body">
      <main className="w-full max-w-2xl px-4 py-8 md:py-12 space-y-12">
        <header className="text-center space-y-2">
            <GratitudeIcon className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-4xl font-headline font-bold text-primary">Gratitude Garden</h1>
            <p className="text-muted-foreground">Cultivate joy, one entry at a time.</p>
        </header>
        
        <NewEntrySection />

        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-headline font-semibold">This Week's Entries</h2>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/overview">Yearly Overview</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/archive">View Archive</Link>
              </Button>
            </div>
          </div>
          <Suspense fallback={<EntryList.Skeleton />}>
            <PastEntriesSection />
          </Suspense>
        </section>
      </main>
    </div>
  );
}

async function NewEntrySection() {
  const entries = await getEntries();

  const latestEntryDate = entries.length > 0 ? new Date(entries[0].date) : new Date(0);
  const today = new Date();
  const hasPostedToday = 
    latestEntryDate.getDate() === today.getDate() &&
    latestEntryDate.getMonth() === today.getMonth() &&
    latestEntryDate.getFullYear() === today.getFullYear();

  return <NewEntryForm hasPostedToday={hasPostedToday} />;
}

async function PastEntriesSection() {
  const entries = await getEntries();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(today, { weekStartsOn: 0 }); // Saturday

  const currentWeekEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
  });

  return <EntryList entries={currentWeekEntries} />;
}
