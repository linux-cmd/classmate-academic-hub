import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Clock, TrendingUp, CalendarDays } from "lucide-react";

const DashboardStats = () => {
  const stats = [
    {
      title: "Assignments Due",
      value: "8",
      subtitle: "This week",
      icon: CheckSquare,
      color: "text-warning"
    },
    {
      title: "Upcoming Events",
      value: "12",
      subtitle: "Next 7 days",
      icon: CalendarDays,
      color: "text-info"
    },
    {
      title: "Study Hours",
      value: "24h",
      subtitle: "This week",
      icon: Clock,
      color: "text-success"
    },
    {
      title: "GPA Trend",
      value: "3.7",
      subtitle: "+0.2 from last sem",
      icon: TrendingUp,
      color: "text-primary"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;