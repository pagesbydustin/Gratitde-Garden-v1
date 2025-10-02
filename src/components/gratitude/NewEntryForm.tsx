'use client';

import { useState, useTransition, useContext } from 'react';
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

import { MoodSelector } from './MoodSelector';
import { UserContext } from '@/context/UserContext';

const formSchema = z.object({
  moodScore: z.number().min(1).max(5).default(3),
  text: z.string().min(10, 'Please write at least 10 characters.').max(1000),
});

type NewEntryFormProps = {
  /** Whether the user has already posted an entry today. */
  hasPostedToday: boolean;
};

/**
 * A form for creating a new journal entry.
 * It includes a mood selector and a text area for the gratitude reflection.
 * If the user has already posted today, it displays a "see you tomorrow" message.
 */
export function NewEntryForm({ hasPostedToday }: NewEntryFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { currentUser } = useContext(UserContext);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moodScore: 3,
      text: '',
    },
  });

  /**
   * Handles the submission of the new entry form.
   * @param values - The form values.
   */
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!currentUser) return;
    
    startTransition(async () => {
      const result = await addEntry({ ...values, userId: currentUser.id });
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

  if (!currentUser) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Welcome!</CardTitle>
          <CardDescription>Please select a user to begin.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (hasPostedToday) {
    return (
        <Card className="text-center">
            <CardHeader>
                <CardTitle>See you tomorrow!</CardTitle>
                <CardDescription>You've already recorded your gratitude for today. Come back tomorrow to write a new entry.</CardDescription>
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
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="moodScore"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-lg">how did you feel when you woke up?</FormLabel>
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
