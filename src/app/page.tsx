
'use client';

import { Suspense, useContext, useEffect, useState } from 'react';
import { GratitudeIcon } from '@/components/icons';
import { getEntries } from '@/lib/actions';
import { NewEntryForm } from '@/components/gratitude/NewEntryForm';
import { EntryList } from '@/components/gratitude/EntryList';
import { endOfWeek, isWithinInterval, startOfWeek } from 'date-fns';
import { UserContext } from '@/context/UserContext';
import { type JournalEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Notebook, BarChart } from 'lucide-react';


/**
 * The main page of the application.
 * It displays the header, a form for new entries, and a list of this week's entries.
 */
export default function Home() {
  return (
    <div className="flex justify-center min-h-screen bg-background text-foreground font-body">
      <main className="w-full max-w-2xl px-4 py-8 md:py-12 space-y-12">
        <header className="text-center space-y-4">
          <GratitudeIcon className="mx-auto h-24 w-24 text-primary" />
          <h1 className="text-4xl font-headline font-bold text-primary">Gratitude Garden</h1>
          <p className="text-muted-foreground">Cultivate joy, one entry at a time.</p>
        </header>
        
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-headline">How to Get Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <p>
                  <strong className="text-foreground">1. Select Your Profile:</strong> Use the dropdown menu in the top right to choose your user profile.
                </p>
              </div>
              <div className="flex items-start gap-4">
                 <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Notebook className="h-5 w-5" />
                </div>
                <p>
                  <strong className="text-foreground">2. Record Your Gratitude:</strong> Each day, reflect on what you're thankful for and add a new entry.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <BarChart className="h-5 w-5" />
                </div>
                <p>
                  <strong className="text-foreground">3. Review Your Journey:</strong> Visit the 'Weekly Archive' and 'Yearly Overview' to see your progress.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

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

/**
 * A component that conditionally renders the new entry form.
 * It checks if the current user has already posted today.
 */
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

/**
 * A component that fetches and displays the journal entries from the current week.
 */
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
