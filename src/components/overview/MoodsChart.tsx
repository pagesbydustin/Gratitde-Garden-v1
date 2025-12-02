
'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Legend } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useMemo } from 'react';

type MoodChartProps = {
  /** The data for the chart, an array of objects with 'name' and dynamic user keys. */
  data: { name: string; [key: string]: any }[];
  /** An array of user keys to render bars for. */
  userKeys?: { id: number; name: string }[];
};

const userColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--destructive))',
  'hsl(var(--primary))',
];

/**
 * A bar chart component that displays the distribution of moods.
 * Uses Recharts for rendering the chart. Can be a simple or stacked bar chart.
 */
export function MoodsChart({ data, userKeys }: MoodChartProps) {
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      count: {
        label: 'Count',
      },
    };
    if (userKeys) {
      userKeys.forEach((user, index) => {
        config[user.name] = {
          label: user.name,
          color: userColors[index % userColors.length],
        };
      });
    }
    return config;
  }, [userKeys]);

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
            data={data}
            layout="vertical"
            margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 20, // Add space for legend
            }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            dy={-2}
          />
          <XAxis dataKey="count" type="number" hide />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Legend contentStyle={{paddingTop: '20px'}} />
          {userKeys ? (
            userKeys.map((user) => (
              <Bar
                key={user.id}
                dataKey={user.name}
                stackId="a"
                fill={chartConfig[user.name]?.color}
                radius={0}
                barSize={32}
              />
            ))
          ) : (
             <Bar dataKey="count" radius={5} fill="hsl(var(--primary))" barSize={32} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
