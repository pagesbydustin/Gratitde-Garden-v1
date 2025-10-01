import { type JournalEntry } from '@/lib/types';
import { EntryCard } from './EntryCard';
import { Skeleton } from '../ui/skeleton';

type EntryListProps = {
  entries: JournalEntry[];
};

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

EntryList.Skeleton = function EntryListSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
    )
}
