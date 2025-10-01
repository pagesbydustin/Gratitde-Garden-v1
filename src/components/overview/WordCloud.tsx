'use client';

type AdjectiveData = {
  adjective: string;
  count: number;
};

type WordCloudProps = {
  data: AdjectiveData[];
};

// Function to scale a value from one range to another
const scale = (num: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
    return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

export function WordCloud({ data }: WordCloudProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const counts = data.map(d => d.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);

  // Define font size and weight ranges
  const minFontSize = 1; // Corresponds to 'rem', so 1rem
  const maxFontSize = 6; // Corresponds to 'rem', so 6rem
  const minFontWeight = 300;
  const maxFontWeight = 900;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 text-center p-4">
      {data.map(({ adjective, count }) => {
        // Handle the case where all counts are the same
        const isSingleCount = minCount === maxCount;
        
        const fontSize = isSingleCount 
          ? (minFontSize + maxFontSize) / 2 
          : scale(count, minCount, maxCount, minFontSize, maxFontSize);
          
        const fontWeight = isSingleCount
          ? (minFontWeight + maxFontWeight) / 2
          : Math.round(scale(count, minCount, maxCount, minFontWeight, maxFontWeight) / 100) * 100;

        return (
          <span
            key={adjective}
            className="transition-all duration-300 ease-in-out hover:scale-110 opacity-75 hover:opacity-100"
            style={{
              fontSize: `${fontSize}rem`,
              fontWeight: fontWeight,
              lineHeight: '1',
              color: 'hsl(var(--primary))'
            }}
          >
            {adjective}
          </span>
        );
      })}
    </div>
  );
}
