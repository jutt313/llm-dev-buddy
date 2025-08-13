
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = ({ title, value, icon: Icon, description, trend }: StatsCardProps) => {
  return (
    <Card className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all duration-300">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-400/30">
            <Icon className="h-6 w-6 text-cyan-400" />
          </div>
          {trend && (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                trend.isPositive
                  ? "text-emerald-400 bg-emerald-500/20 border border-emerald-500/30"
                  : "text-red-400 bg-red-500/20 border border-red-500/30"
              }`}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-300">
            {title}
          </p>
          <p className="text-2xl font-bold text-white">
            {value}
          </p>
          {description && (
            <p className="text-xs text-slate-400">
              {description}
            </p>
          )}
          {trend && (
            <p className="text-xs text-slate-400">
              from last month
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
