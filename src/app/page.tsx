import { Suspense } from 'react';
import { getEntries } from '@/lib/actions';
import { NewEntryForm } from '@/components/gratitude/NewEntryForm';
import { EntryList } from '@/components/gratitude/EntryList';
import { GratitudeIcon } from '@/components/icons';

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
        
        <Suspense fallback={<NewEntryForm.Skeleton />}>
          <NewEntrySection />
        </Suspense>

        <section className="space-y-6">
          <h2 className="text-3xl font-headline font-semibold">Past Entries</h2>
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
  return <EntryList entries={entries} />;
}
