'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { type JournalEntry } from '@/lib/types';
import { Bot } from 'lucide-react';

type InspirationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: JournalEntry[];
  isLoading: boolean;
};

export function InspirationDialog({ open, onOpenChange, entries, isLoading }: InspirationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot /> AI-Powered Inspiration
          </DialogTitle>
          <DialogDescription>
            Here are some of your past entries with a similar mood.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-6">
          <div className="space-y-4 my-4">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : entries.length > 0 ? (
              entries.map((entry, index) => (
                <div key={entry.id}>
                  <div className="text-sm text-muted-foreground mb-2">
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                  <p className="text-foreground/90">{entry.text}</p>
                  {index < entries.length - 1 && <Separator className="my-4" />}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No similar entries found.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
