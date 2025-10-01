'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { addEntry } from '@/lib/actions';
import { type JournalEntry } from '@/lib/types';

import { MoodSelector } from './MoodSelector';
import { Skeleton } from '../ui/skeleton';

const formSchema = z.object({
  moodScore: z.number().min(1).max(5).default(3),
  text: z.string().min(10, 'Please write at least 10 characters.').max(1000),
});

type NewEntryFormProps = {
  dailyPrompt: string;
  hasPostedToday: boolean;
};

export function NewEntryForm({ dailyPrompt, hasPostedToday }: NewEntryFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moodScore: 3,
      text: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const result = await addEntry({ ...values, prompt: dailyPrompt });
      if (result.success) {
        toast({
          title: 'Entry Saved!',
          description: 'Your gratitude has been recorded.',
        });
        form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'There was a problem saving your entry.',
        });
      }
    });
  };

  if (hasPostedToday) {
    return (
        <Card className="text-center">
            <CardHeader>
                <CardTitle>See you tomorrow!</CardTitle>
                <CardDescription>You've already recorded your gratitude for today. Come back tomorrow for a new prompt.</CardDescription>
            </CardHeader>
        </Card>
    );
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Today's Reflection</CardTitle>
                    <CardDescription className="pt-2 text-lg italic">"{dailyPrompt}"</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="moodScore"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-lg">How are you feeling today?</FormLabel>
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
                            <FormLabel className="text-lg">What are you grateful for?</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell me about something that brought you joy, a challenge you overcame, or a simple pleasure..."
                                    className="min-h-[150px] text-base"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col sm:flex-row justify-end gap-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save Entry'}
                            <Sparkles className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
      </Form>
    </>
  );
}

NewEntryForm.Skeleton = function NewEntryFormSkeleton() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-full mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-1/4" />
                        <Skeleton className="h-36 w-full" />
                    </div>
                    <div className="flex justify-end gap-4">
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
