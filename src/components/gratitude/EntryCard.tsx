'use client';

import { useEffect, useState } from 'react';
import { Frown, Meh, Smile, SmilePlus, Laugh, Calendar, Quote } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { type JournalEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

type EntryCardProps = {
  entry: JournalEntry;
  priority?: boolean;
};

const moodMap = {
  1: { icon: Frown, color: 'text-red-400', label: 'Awful' },
  2: { icon: Meh, color: 'text-yellow-400', label: 'Okay' },
  3: { icon: Smile, color: 'text-green-400', label: 'Good' },
  4: { icon: SmilePlus, color: 'text-blue-400', label: 'Great' },
  5: { icon: Laugh, color: 'text-purple-400', label: 'Awesome' },
};

export function EntryCard({ entry, priority = false }: EntryCardProps) {
    const [isVisible, setIsVisible] = useState(priority);
    const MoodIcon = moodMap[entry.moodScore as keyof typeof moodMap].icon;
    const moodColor = moodMap[entry.moodScore as keyof typeof moodMap].color;
    const moodLabel = moodMap[entry.moodScore as keyof typeof moodMap].label;
    
    useEffect(() => {
        if (priority) return;
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, [priority]);

  return (
    <article
        className={cn(
            "transition-all duration-700 ease-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
    >
        <Card className="w-full overflow-hidden">
        <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <time dateTime={entry.date}>
                {new Date(entry.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}
                </time>
            </div>
            <Badge variant="outline" className={cn("border-none", moodColor)}>
                <MoodIcon className={cn("mr-2 h-4 w-4", moodColor)} />
                {moodLabel}
            </Badge>
            </div>
        </CardHeader>
        <CardContent>
            {entry.prompt && (
                <blockquote className="mb-4 pl-4 border-l-2 border-primary italic text-muted-foreground">
                    <Quote className="inline-block h-4 w-4 mr-2" />
                    {entry.prompt}
                </blockquote>
            )}
            <p className="text-foreground/90 whitespace-pre-wrap">{entry.text}</p>
        </CardContent>
        </Card>
    </article>
  );
}
