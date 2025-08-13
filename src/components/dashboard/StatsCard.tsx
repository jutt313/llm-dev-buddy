
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
    <Card className="group bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground/80">
              {title}
            </p>
            <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground/60">
                {description}
              </p>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center">
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                trend.isPositive
                  ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30"
                  : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30"
              }`}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground/60 ml-2">
              from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
