import { type JournalEntry } from '@/lib/types';
import { EntryCard } from './EntryCard';
import { Skeleton } from '../ui/skeleton';

type EntryListProps = {
  /** An array of journal entries to display. */
  entries: JournalEntry[];
};

/**
 * Renders a list of journal entries using the `EntryCard` component.
 * Displays a message if the list is empty.
 */
export function EntryList({ entries }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
        <p className="text-muted-foreground">No entries yet.</p>
        <p className="text-muted-foreground">Your past reflections will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry, index) => (
        <EntryCard key={entry.id} entry={entry} priority={index < 3} />
      ))}
    </div>
  );
}

/**
 * A skeleton loader component for the `EntryList`.
 * Used to provide a loading state while entries are being fetched.
 */
EntryList.Skeleton = function EntryListSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
    )
}
