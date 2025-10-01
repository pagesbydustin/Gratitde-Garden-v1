'use client';

type AdjectiveData = {
  adjective: string;
  count: number;
};

type WordCloudProps = {
  data: AdjectiveData[];
};

// Use a non-linear scale for a more balanced visual effect
const scale = (num: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
    if (in_min === in_max) {
      return (out_min + out_max) / 2;
    }
    const normalized = (num - in_min) / (in_max - in_min);
    // Use a square root curve to make the size increase less dramatically
    const scaled = Math.sqrt(normalized); 
    return scaled * (out_max - out_min) + out_min;
}

export function WordCloud({ data }: WordCloudProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const counts = data.map(d => d.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);

  // Define font size and weight ranges
  const minFontSize = 1.2; // in rem
  const maxFontSize = 5; // in rem
  const minFontWeight = 300;
  const maxFontWeight = 800;

  // Sort words to place larger ones in the center
  const sortedData: AdjectiveData[] = [];
  const originalData = [...data]; // data is already sorted by count descending
  while(originalData.length > 0) {
    // Add the largest remaining
    if (originalData.length > 0) {
      sortedData.push(originalData.shift()!);
    }
    // Add the smallest remaining to the end
    if (originalData.length > 0) {
      sortedData.push(originalData.pop()!);
    }
  }


  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-center">
      {sortedData.map(({ adjective, count }) => {
        const fontSize = scale(count, minCount, maxCount, minFontSize, maxFontSize);
        const fontWeight = Math.round(scale(count, minCount, maxCount, minFontWeight, maxFontWeight) / 100) * 100;

        return (
          <span
            key={adjective}
            className="transition-all duration-300 ease-in-out opacity-75 hover:opacity-100 hover:scale-110"
            style={{
              fontSize: `${fontSize}rem`,
              fontWeight: fontWeight,
              lineHeight: '1.2',
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
