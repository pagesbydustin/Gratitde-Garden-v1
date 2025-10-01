import { getEntries } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type JournalEntry } from '@/lib/types';
import { MoodsChart } from '@/components/overview/MoodsChart';

export const revalidate = 0; // Re-evaluate on every request

const moodMap = {
  1: { label: 'Awful' },
  2: { label: 'Okay' },
  3: { label: 'Good' },
  4: { label: 'Great' },
  5: { label: 'Awesome' },
};

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

export default async function OverviewPage() {
  const entries = await getEntries();
  const moodData = processMoodData(entries);

  return (
    <div className="flex justify-center min-h-screen bg-background text-foreground font-body">
      <main className="w-full max-w-4xl px-4 py-8 md:py-12 space-y-12">
        <header className="relative text-center space-y-2">
          <h1 className="text-4xl font-headline font-bold text-primary">Yearly Overview</h1>
          <p className="text-muted-foreground">A look at your moods throughout the year.</p>
        </header>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Your Moods This Year</CardTitle>
              <CardDescription>
                This chart shows the number of times you've recorded each mood in the current year.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {entries.length > 0 ? (
                <MoodsChart data={moodData} />
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground">Not enough data to create an analysis.</p>
                  <p className="text-muted-foreground">
                    Write a few more entries to see your mood summary.
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
