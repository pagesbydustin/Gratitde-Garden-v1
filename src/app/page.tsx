
'use client';

import { Suspense, useContext, useEffect, useState } from 'react';
import { GratitudeIcon } from '@/components/icons';
import { NewEntryForm } from '@/components/gratitude/NewEntryForm';
import { EntryList } from '@/components/gratitude/EntryList';
import { endOfWeek, isWithinInterval, startOfWeek, parseISO } from 'date-fns';
import { UserContext } from '@/context/UserContext';
import { SettingsContext } from '@/context/SettingsContext';
import { type JournalEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Notebook, BarChart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminPortal } from '@/components/admin/AdminPortal';


/**
 * The main page of the application.
 * It displays the header, a form for new entries, and a list of this week's entries.
 * For Admins, it shows a dedicated admin portal.
 */
export default function Home() {
  const { settings } = useContext(SettingsContext);
  const { currentUser, loading: userLoading } = useContext(UserContext);
  const [showExplanation, setShowExplanation] = useState(true);

  useEffect(() => {
    if (settings) {
      setShowExplanation(settings.showExplanation);
    }
  }, [settings]);

  if (userLoading) {
    return <LoadingState />;
  }
  
  const isAdmin = currentUser?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (isAdmin) {
    return <AdminPortal />;
  }

  return (
    <div className="flex justify-center min-h-screen bg-background text-foreground font-body">
      <main className="w-full max-w-2xl px-4 py-8 md:py-12 space-y-12">
        <header className="text-center space-y-4">
          <GratitudeIcon className="mx-auto h-24 w-24 text-primary" />
          <h1 className="text-4xl font-headline font-bold text-primary">Gratitude Garden</h1>
          <p className="text-muted-foreground">Cultivate joy, one entry at a time.</p>
        </header>
        
        {showExplanation && (
          <section>
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl font-headline">How to Get Started</CardTitle>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 h-8 w-8"
                    onClick={() => setShowExplanation(false)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <p>
                    <strong className="text-foreground">1. Choose a Profile:</strong> Use the user switcher in the header to select a profile (or leave it as default).
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
        )}

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

function LoadingState() {
    return (
        <div className="flex justify-center min-h-screen">
          <main className="w-full max-w-2xl px-4 py-8 md:py-12 space-y-12">
            <Skeleton className="h-24 w-24 mx-auto rounded-full" />
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-5 w-1/2 mx-auto" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </main>
        </div>
    );
}

/**
 * A component that conditionally renders the new entry form.
 * It checks if the current user has already posted today.
 */
function NewEntrySection() {
  const { entries, loading } = useContext(UserContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading || !isClient) {
    return <Skeleton className="h-64 w-full" />;
  }
  
  const hasPostedToday = entries.some(entry => {
    const entryDate = parseISO(entry.date);
    const today = new Date();
    return entryDate.getFullYear() === today.getFullYear() &&
           entryDate.getMonth() === today.getMonth() &&
           entryDate.getDate() === today.getDate();
  });

  return <NewEntryForm hasPostedToday={hasPostedToday} />;
}

/**
 * A component that fetches and displays the journal entries from the current week.
 */
function PastEntriesSection() {
  const { entries, loading } = useContext(UserContext);
  const [weekEntries, setWeekEntries] = useState<JournalEntry[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 }); // Saturday

    const currentWeekEntries = entries.filter(entry => {
        const entryDate = parseISO(entry.date);
        return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
    });
    setWeekEntries(currentWeekEntries);
  }, [entries]);

  if (loading || !isClient) {
    return <EntryList.Skeleton />;
  }

  return <EntryList entries={weekEntries} />;
}
