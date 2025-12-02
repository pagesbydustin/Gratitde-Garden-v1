
'use client';

import { useState, useTransition, useContext, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, RotateCcw, Mic, MicOff } from 'lucide-react';
import { format } from 'date-fns';

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
import { cn } from '@/lib/utils';
import { MoodSelector } from './MoodSelector';
import { UserContext } from '@/context/UserContext';
import { SettingsContext } from '@/context/SettingsContext';

const formSchema = z.object({
  moodScore: z.number().min(1).max(5).default(3),
  text: z.string().min(10, 'Please write at least 10 characters.').max(1000),
});

type NewEntryFormProps = {
    hasPostedToday: boolean;
};

// Declare the SpeechRecognition type for browser compatibility
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

/**
 * A form for creating a new journal entry.
 * It includes a mood selector and a text area for the gratitude reflection.
 * If the user has already posted today, it displays a "see you tomorrow" message.
 * @param {object} props - The component props.
 * @param {boolean} props.hasPostedToday - Whether the user has already posted an entry today.
 */
export function NewEntryForm({ hasPostedToday }: NewEntryFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { currentUser, addEntry } = useContext(UserContext);
  const { settings, loading: settingsLoading } = useContext(SettingsContext);
  const [currentDate, setCurrentDate] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');


  useEffect(() => {
    setCurrentDate(format(new Date(), 'MMMM d, yyyy'));
  }, []);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moodScore: 3,
      text: '',
    },
  });

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscriptRef.current += event.results[i][0].transcript + '. ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            form.setValue('text', finalTranscriptRef.current + interimTranscript);
        };
        
        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
    }
  }, [form]);


  /**
   * Handles the submission of the new entry form.
   * @param values - The form values.
   */
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const result = await addEntry(values);
      if (result.success) {
        toast({
          title: 'Entry Saved!',
          description: 'Your gratitude has been recorded.',
        });
        form.reset();
        finalTranscriptRef.current = '';
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'There was a problem saving your entry.',
        });
      }
    });
  };

  /**
   * Handles resetting the form to its default values.
   */
  const handleReset = () => {
    form.reset();
    finalTranscriptRef.current = '';
  };

  const handleToggleRecording = () => {
      if (!recognitionRef.current) {
          toast({
              variant: 'destructive',
              title: 'Not Supported',
              description: 'Your browser does not support speech-to-text.',
          });
          return;
      }

      if (isRecording) {
          recognitionRef.current.stop();
          setIsRecording(false);
      } else {
          finalTranscriptRef.current = form.getValues('text');
          recognitionRef.current.start();
          setIsRecording(true);
      }
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
                    <CardDescription>{currentDate}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="moodScore"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel className="text-lg">How did you feel when you woke up?</FormLabel>
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
                            <div className="flex justify-between items-center">
                                <FormLabel className="text-lg">{settingsLoading ? '...' : settings?.gratitudePrompt}</FormLabel>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleToggleRecording}
                                    className={cn(isRecording && 'text-red-500 hover:text-red-600')}
                                >
                                    {isRecording ? <MicOff /> : <Mic />}
                                    <span className="sr-only">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                                </Button>
                            </div>
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
                        <Button type="button" variant="ghost" onClick={handleReset} disabled={isPending}>
                            Reset
                            <RotateCcw className="ml-2 h-4 w-4" />
                        </Button>
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
