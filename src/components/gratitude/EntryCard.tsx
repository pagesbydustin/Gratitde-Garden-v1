'use client';

import { useEffect, useState, useTransition } from 'react';
import { Frown, Meh, Smile, SmilePlus, Laugh, Calendar, Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { MoodSelector } from './MoodSelector';
import { useToast } from '@/hooks/use-toast';
import { updateEntry } from '@/lib/actions';
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

const formSchema = z.object({
    text: z.string().min(10, 'Please write at least 10 characters.').max(1000),
    moodScore: z.number().min(1).max(5),
});

export function EntryCard({ entry, priority = false }: EntryCardProps) {
    const [isVisible, setIsVisible] = useState(priority);
    const [isEditing, setIsEditing] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [formattedDate, setFormattedDate] = useState('');
    const [isToday, setIsToday] = useState(false);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            text: entry.text,
            moodScore: entry.moodScore,
        },
    });

    const MoodIcon = moodMap[entry.moodScore as keyof typeof moodMap].icon;
    const moodColor = moodMap[entry.moodScore as keyof typeof moodMap].color;
    const moodLabel = moodMap[entry.moodScore as keyof typeof moodMap].label;
    
    useEffect(() => {
        if (!priority) {
            const timer = setTimeout(() => setIsVisible(true), 100);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(true);
        }
    }, [priority]);

    useEffect(() => {
        const entryDate = new Date(entry.date);
        const today = new Date();

        // Check if the entry is from today, ignoring the time part.
        const isEntryDateToday = entryDate.getFullYear() === today.getFullYear() &&
                                 entryDate.getMonth() === today.getMonth() &&
                                 entryDate.getDate() === today.getDate();
        setIsToday(isEntryDateToday);

        setFormattedDate(
            entryDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        );
    }, [entry.date]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        startTransition(async () => {
            const result = await updateEntry({ id: entry.id, ...values });
            if (result.success) {
                toast({
                    title: 'Entry Updated!',
                    description: 'Your changes have been saved.',
                });
                setIsEditing(false);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'There was a problem saving your changes.',
                });
            }
        });
    };
    
    const handleCancel = () => {
        form.reset({ text: entry.text, moodScore: entry.moodScore });
        setIsEditing(false);
    };

    return (
        <article
            className={cn(
                "transition-all duration-700 ease-out",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
        >
            <Card className="w-full overflow-hidden">
                {isEditing ? (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardHeader>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <time dateTime={entry.date}>{formattedDate}</time>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="moodScore"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <MoodSelector value={field.value} onChange={field.onChange} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="text"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    className="min-h-[120px] text-base"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter className="justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={handleCancel}>Cancel</Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                ) : (
                    <>
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <time dateTime={entry.date}>{formattedDate}</time>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={cn("border-none", moodColor)}>
                                        <MoodIcon className={cn("mr-2 h-4 w-4", moodColor)} />
                                        {moodLabel}
                                    </Badge>
                                    {isToday && (
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
                                            <Pencil className="h-4 w-4" />
                                            <span className="sr-only">Edit Entry</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground/90 whitespace-pre-wrap text-base">{entry.text}</p>
                        </CardContent>
                    </>
                )}
            </Card>
        </article>
    );
}
