'use client';

import { getEntries } from '@/lib/actions';
import { type JournalEntry } from '@/lib/types';
import { format, startOfWeek, parseISO } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { EntryCard } from '@/components/gratitude/EntryCard';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Groups journal entries by the starting date of their week.
 * @param entries - An array of journal entries.
 * @returns An object where keys are the first day of the week (YYYY-MM-DD) and values are arrays of entries for that week.
 */
function groupEntriesByWeek(entries: JournalEntry[]) {
  return entries.reduce((acc, entry) => {
    const entryDate = parseISO(entry.date);
    const weekStart = startOfWeek(entryDate, { weekStartsOn: 1 }); // Start week on Monday
    const weekKey = format(weekStart, 'yyyy-MM-dd');

    if (!acc[weekKey]) {
      acc[weekKey] = [];
    }
    acc[weekKey].push(entry);
    return acc;
  }, {} as Record<string, JournalEntry[]>);
}

/**
 * Renders the archive page, which displays past journal entries grouped by week.
 * Users can expand each week to see the entries within it.
 */
export default function ArchivePage() {
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

  const groupedEntries = groupEntriesByWeek(entries);
  const sortedWeeks = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex justify-center min-h-screen bg-background text-foreground font-body">
      <main className="w-full max-w-2xl px-4 py-8 md:py-12 space-y-12">
        <header className="relative text-center space-y-2">
          <h1 className="text-4xl font-headline font-bold text-primary">Weekly Archive</h1>
          <p className="text-muted-foreground">A look back at your journey.</p>
        </header>

        <section>
          {loading ? (
             <div className="w-full space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
             </div>
          ) : !currentUser ? (
             <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
              <p className="text-muted-foreground">Please select a user to see their archive.</p>
            </div>
          ) : sortedWeeks.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {sortedWeeks.map((weekKey) => {
                const weekEntries = groupedEntries[weekKey];
                const weekStartDate = parseISO(weekKey);
                const weekLabel = `Week of ${format(weekStartDate, 'MMMM d, yyyy')}`;

                return (
                  <AccordionItem value={weekKey} key={weekKey} className="border-b-0">
                    <AccordionTrigger className="text-xl font-semibold bg-muted hover:no-underline rounded-md px-4">
                      {weekLabel}
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-4">
                      {weekEntries.map((entry) => (
                        <EntryCard key={entry.id} entry={entry} />
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
              <p className="text-muted-foreground">No entries yet.</p>
              <p className="text-muted-foreground">Your past reflections will appear here.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
