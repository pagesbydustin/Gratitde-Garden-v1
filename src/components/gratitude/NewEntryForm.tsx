'use client';

import { useState, useTransition, useContext, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, RotateCcw, Mic, MicOff } from 'lucide-react';

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
import { cn } from '@/lib/utils';
import { MoodSelector } from './MoodSelector';
import { UserContext } from '@/context/UserContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const formSchema = z.object({
  moodScore: z.number().min(1).max(5).default(3),
  text: z.string().min(10, 'Please write at least 10 characters.').max(1000),
});

type NewEntryFormProps = {
    hasPostedToday: boolean;
};

// Extend window type for SpeechRecognition
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
  const { currentUser } = useContext(UserContext);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recognitionRef = useRef<any>(null);


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

  /**
   * Handles resetting the form to its default values.
   */
  const handleReset = () => {
    form.reset();
  };

  /**
   * Toggles the speech-to-text transcription.
   */
  const toggleTranscription = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        toast({
            variant: 'destructive',
            title: 'Browser Not Supported',
            description: 'Speech recognition is not supported in your browser.',
        });
        return;
    }

    if (isTranscribing) {
        recognitionRef.current?.stop();
        return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        setIsTranscribing(true);
        toast({ title: 'Listening...', description: 'Start speaking your entry.' });
    };

    recognition.onend = () => {
        setIsTranscribing(false);
    };

    recognition.onerror = (event: any) => {
        setIsTranscribing(false);
        toast({
            variant: 'destructive',
            title: 'Transcription Error',
            description: event.error === 'not-allowed' ? 'Microphone access denied.' : `An error occurred: ${event.error}`,
        });
    };

    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const currentText = form.getValues('text');
        form.setValue('text', currentText ? `${currentText} ${transcript}` : transcript);
    };
    
    recognition.start();
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
                                <FormLabel className="text-lg">What are you grateful for?</FormLabel>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button type="button" size="icon" variant={isTranscribing ? 'destructive' : 'outline'} onClick={toggleTranscription}>
                                          {isTranscribing ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                          <span className="sr-only">{isTranscribing ? 'Stop Transcribing' : 'Start Transcribing'}</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{isTranscribing ? 'Stop voice transcription' : 'Transcribe with voice'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
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
