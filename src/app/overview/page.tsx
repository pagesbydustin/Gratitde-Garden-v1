import { getEntries } from '@/lib/actions';
import { WordCloud } from '@/components/overview/WordCloud';
import { analyzeAdjectives } from '@/ai/flows/analyze-adjectives-flow';
import { GratitudeIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const revalidate = 0; // Re-evaluate on every request

export default async function OverviewPage() {
  const entries = await getEntries();
  const entryTexts = entries.map((entry) => entry.text);
  const analysis = await analyzeAdjectives({ entries: entryTexts });

  return (
    <div className="flex justify-center min-h-screen bg-background text-foreground font-body">
      <main className="w-full max-w-4xl px-4 py-8 md:py-12 space-y-12">
        <header className="relative text-center space-y-2">
          <Button asChild variant="ghost" className="absolute left-0 top-0">
            <Link href="/">
              <ArrowLeft />
              Back
            </Link>
          </Button>
          <GratitudeIcon className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-4xl font-headline font-bold text-primary">Yearly Overview</h1>
          <p className="text-muted-foreground">A linguistic look at your year in gratitude.</p>
        </header>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Adjective Word Cloud</CardTitle>
              <CardDescription>
                The adjectives you've used most frequently. The larger and bolder the word, the more you've used it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analysis && analysis.adjectives.length > 0 ? (
                <WordCloud data={analysis.adjectives} />
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground">Not enough data to create an analysis.</p>
                  <p className="text-muted-foreground">
                    Write a few more entries to see your adjective map.
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
