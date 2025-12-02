
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type JournalEntry, type User } from '@/lib/types';
import { MoodsChart } from '@/components/overview/MoodsChart';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { Skeleton } from '@/components/ui/skeleton';
import { getAllEntries, getUsers } from '@/lib/actions';
import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const moodMap: Record<number, { label: string }> = {
  1: { label: 'Awful' },
  2: { label: 'Okay' },
  3: { label: 'Good' },
  4: { label: 'Great' },
  5: { label: 'Awesome' },
};

/**
 * Processes journal entries to count mood occurrences for the current year,
 * broken down by user.
 * @param entries - An array of journal entries.
 * @param users - An array of all users.
 * @returns An object containing `chartData` for the mood chart and `userKeys` for the legend.
 */
function processMoodData(entries: JournalEntry[], users: User[]) {
  const currentYear = new Date().getFullYear();
  
  const moodData = Object.entries(moodMap).reduce((acc, [score, { label }]) => {
    acc[label] = { name: label };
    return acc;
  }, {} as Record<string, { name: string; [key: string]: any }>);
  
  const userKeys: { id: number; name: string }[] = [];

  entries
    .filter(entry => new Date(entry.date).getFullYear() === currentYear)
    .forEach(entry => {
      const moodLabel = moodMap[entry.moodScore]?.label;
      const user = users.find(u => u.id === entry.userId);

      if (moodLabel && user) {
        if (!moodData[moodLabel][user.name]) {
          moodData[moodLabel][user.name] = 0;
        }
        moodData[moodLabel][user.name]++;
        
        if (!userKeys.some(u => u.id === user.id)) {
            userKeys.push({ id: user.id, name: user.name });
        }
      }
    });

  return {
    chartData: Object.values(moodData).reverse(), // Reverse to show Awesome at the top
    userKeys: userKeys,
  };
}


/**
 * Renders the admin overview page, which displays a chart summarizing all non-admin user moods.
 */
export default function AdminOverviewPage() {
  const { currentUser, loading: userLoading } = useContext(UserContext);
  const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !userLoading) {
      if (currentUser?.name !== 'Admin') {
        router.push('/');
        return;
      }
    
      Promise.all([getAllEntries(), getUsers()]).then(([entries, users]) => {
        const adminUser = users.find(u => u.name === 'Admin');
        const nonAdminUsers = users.filter(u => u.name !== 'Admin');
        const nonAdminEntries = entries.filter(e => e.userId !== adminUser?.id);
        setAllEntries(nonAdminEntries);
        setAllUsers(nonAdminUsers);
        setLoading(false);
      });
    }
  }, [currentUser, userLoading, router, isMounted]);

  const { chartData, userKeys } = processMoodData(allEntries, allUsers);
  const hasEntries = allEntries.length > 0;

  if (!isMounted || loading || userLoading) {
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

  if (currentUser?.name !== 'Admin') {
    return (
        <div className="flex justify-center min-h-screen items-center">
            <Card className="max-w-md text-center">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2"><ShieldAlert /> Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You do not have permission to view this page.</p>
                    <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
                </CardContent>
            </Card>
        </div>
    );
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
                <MoodsChart data={chartData} userKeys={userKeys} />
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
