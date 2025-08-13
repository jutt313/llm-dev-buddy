
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer 
} from "recharts";

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface DashboardChartProps {
  title: string;
  data: ChartData[];
  type: "line" | "area" | "bar";
  color?: string;
  description?: string;
}

const chartConfig = {
  value: {
    label: "Value",
  },
};

const DashboardChart = ({ 
  title, 
  data, 
  type, 
  color = "#06b6d4", 
  description 
}: DashboardChartProps) => {
  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <LineChart data={data}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={3} 
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: color }}
            />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={data}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              fill={color} 
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        );
      case "bar":
        return (
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
          </BarChart>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white">
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-slate-400">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="pb-6">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          {renderChart()}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default DashboardChart;
