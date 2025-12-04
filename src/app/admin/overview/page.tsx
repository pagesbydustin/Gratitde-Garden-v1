
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type JournalEntry } from '@/lib/types';
import { MoodsChart } from '@/components/overview/MoodsChart';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllEntries } from '@/lib/actions';
import { AdminAuth } from '@/components/admin/AdminAuth';


const moodMap: Record<number, { label: string }> = {
  1: { label: 'Awful' },
  2: { label: 'Okay' },
  3: { label: 'Good' },
  4: { label: 'Great' },
  5: { label: 'Awesome' },
};

/**
 * Processes journal entries to count mood occurrences for the current year.
 * @param entries - An array of journal entries.
 * @returns An array of objects formatted for the mood chart, with each object containing a mood name and its count.
 */
function processMoodData(entries: JournalEntry[]) {
  const currentYear = new Date().getFullYear();
  
  const moodCounts = entries
    .filter(entry => new Date(entry.date).getFullYear() === currentYear)
    .reduce((acc, entry) => {
      const mood = entry.moodScore;
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

  const chartData = Object.entries(moodMap)
    .map(([score, { label }]) => ({
      name: label,
      count: moodCounts[parseInt(score, 10)] || 0,
    }))
    .reverse(); // Reverse to show Awesome at the top

  return chartData;
}

function AdminOverviewPageContent() {
  const { users } = useContext(UserContext);
  const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const adminUser = users.find(u => u.email === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@example.com'));

  useEffect(() => {
    getAllEntries().then((entries) => {
      // Filter out admin entries
      const nonAdminEntries = entries.filter(entry => entry.userId !== adminUser?.id);
      setAllEntries(nonAdminEntries);
      setLoading(false);
    });
  }, [adminUser]);

  const chartData = processMoodData(allEntries);
  const hasEntries = allEntries.length > 0;

  if (loading) {
    return (
        <div className="flex justify-center min-h-screen">
          <main className="w-full max-w-4xl px-4 py-8 md:py-12 space-y-12">
            <header className="space-y-2">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-5 w-3/4" />
            </header>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
          </main>
        </div>
    )
  }
  
  return (
    <div className="flex justify-center min-h-screen bg-background text-foreground font-body">
      <main className="w-full max-w-4xl px-4 py-8 md:py-12 space-y-12">
        <header className="relative text-center space-y-2">
          <h1 className="text-4xl font-headline font-bold text-primary">All Users Overview</h1>
          <p className="text-muted-foreground">A look at the moods of all non-admin users throughout the year.</p>
        </header>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Moods This Year (All Users)</CardTitle>
              <CardDescription>
                This chart shows the combined number of times users have recorded each mood.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {hasEntries ? (
                <MoodsChart data={chartData} />
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground">Not enough data to create an analysis.</p>
                  <p className="text-muted-foreground">
                    Once users add entries, their mood summary will appear here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

export default function AdminOverviewPage() {
    return (
        <AdminAuth>
            <AdminOverviewPageContent />
        </AdminAuth>
    )
}
