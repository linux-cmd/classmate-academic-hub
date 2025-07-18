import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Clock, TrendingUp, CalendarDays } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";

const DashboardStats = () => {
  const { stats, loading } = useUserData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-card animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-12 mb-2"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Pending Assignments",
      value: stats.pendingAssignments.toString(),
      subtitle: stats.totalAssignments === 0 ? "No assignments yet" : `${stats.totalAssignments} total`,
      icon: CheckSquare,
      color: stats.pendingAssignments > 5 ? "text-warning" : "text-success"
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents.toString(),
      subtitle: "Next 7 days",
      icon: CalendarDays,
      color: "text-info"
    },
    {
      title: "Completed Tasks",
      value: stats.completedAssignments.toString(),
      subtitle: stats.totalAssignments > 0 ? `${Math.round((stats.completedAssignments / stats.totalAssignments) * 100)}% complete` : "Start your first task",
      icon: Clock,
      color: "text-success"
    },
    {
      title: "Average Grade",
      value: stats.averageGrade > 0 ? `${stats.averageGrade.toFixed(1)}%` : "N/A",
      subtitle: stats.averageGrade > 0 ? (stats.averageGrade >= 85 ? "Excellent!" : "Keep it up!") : "Add your first grade",
      icon: TrendingUp,
      color: stats.averageGrade >= 85 ? "text-success" : stats.averageGrade >= 70 ? "text-primary" : "text-warning"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsData.map((stat) => (
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