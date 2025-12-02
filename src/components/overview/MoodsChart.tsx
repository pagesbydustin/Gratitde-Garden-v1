
'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

type MoodChartProps = {
  /** The data for the chart, an array of objects with 'name' and 'count' or dynamic keys. */
  data: { name: string; [key: string]: any }[];
};

const chartConfig = {
  count: {
    label: 'Count',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

/**
 * A bar chart component that displays the distribution of moods.
 * Uses Recharts for rendering the chart.
 */
export function MoodsChart({ data }: MoodChartProps) {

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
                bottom: 5,
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
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="count" radius={5} fill="hsl(var(--primary))" barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
