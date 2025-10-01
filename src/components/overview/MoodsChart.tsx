'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, LabelList } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

type MoodChartProps = {
  data: { name: string; count: number }[];
};

const chartConfig = {
  count: {
    label: 'Count',
  },
  awesome: {
    label: 'Awesome',
    color: 'hsl(var(--chart-5))',
  },
  great: {
    label: 'Great',
    color: 'hsl(var(--chart-4))',
  },
  good: {
    label: 'Good',
    color: 'hsl(var(--chart-3))',
  },
  okay: {
    label: 'Okay',
    color: 'hsl(var(--chart-2))',
  },
  awful: {
    label: 'Awful',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function MoodsChart({ data }: MoodChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
            data={data}
            layout="vertical"
            margin={{
                top: 5,
                right: 30, // Increased right margin for label
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
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar
            dataKey="count"
            radius={5}
            fill="hsl(var(--primary))"
            barSize={32}
          >
            <LabelList
                dataKey="count"
                position="right"
                offset={8}
                className="fill-foreground text-sm"
                formatter={(value: number) => (value > 0 ? value : '')}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
