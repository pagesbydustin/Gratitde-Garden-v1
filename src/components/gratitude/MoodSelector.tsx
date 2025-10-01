'use client';

import { Frown, Meh, Smile, SmilePlus, Laugh } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

type MoodSelectorProps = {
  value: number;
  onChange: (value: number) => void;
};

const moods = [
  { value: 1, icon: Frown, label: 'Awful' },
  { value: 2, icon: Meh, label: 'Okay' },
  { value: 3, icon: Smile, label: 'Good' },
  { value: 4, icon: SmilePlus, label: 'Great' },
  { value: 5, icon: Laugh, label: 'Awesome' },
];

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="space-y-4 pt-2">
      <Slider
        defaultValue={[3]}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={1}
        max={5}
        step={1}
      />
      <div className="flex justify-between">
        {moods.map((mood) => (
          <div
            key={mood.value}
            className="flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => onChange(mood.value)}
          >
            <mood.icon
              className={cn(
                'h-8 w-8 transition-colors',
                value === mood.value ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            />
            <span
              className={cn(
                'text-xs font-medium transition-colors',
                value === mood.value ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {mood.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
