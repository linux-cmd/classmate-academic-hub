import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, BookOpen } from "lucide-react";

const GradesOverview = () => {
  const courses = [
    {
      id: 1,
      name: "Calculus I",
      code: "MATH 101",
      grade: "A-",
      percentage: 92,
      credits: 4,
      trend: "up"
    },
    {
      id: 2,
      name: "Physics II",
      code: "PHYS 201",
      grade: "B+",
      percentage: 87,
      credits: 4,
      trend: "up"
    },
    {
      id: 3,
      name: "Art History",
      code: "HIST 150",
      grade: "A",
      percentage: 95,
      credits: 3,
      trend: "stable"
    },
    {
      id: 4,
      name: "English Literature",
      code: "ENG 201",
      grade: "B",
      percentage: 83,
      credits: 3,
      trend: "down"
    }
  ];

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-success";
    if (percentage >= 80) return "text-warning";
    return "text-destructive";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "↗️";
      case "down": return "↘️";
      default: return "→";
    }
  };

  const currentGPA = "3.7";
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>Academic Performance</span>
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => window.location.hash = '#grades'}>
          View Details
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* GPA Summary */}
        <div className="flex items-center justify-between p-4 bg-gradient-subtle rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Current GPA</p>
            <p className="text-2xl font-bold text-primary">{currentGPA}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Credits</p>
            <p className="text-xl font-semibold">{totalCredits}</p>
          </div>
        </div>

        {/* Course Grades */}
        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-muted/20 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium truncate">{course.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold ${getGradeColor(course.percentage)}`}>
                      {course.grade}
                    </span>
                    <span className="text-lg">{getTrendIcon(course.trend)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{course.code} • {course.credits} credits</p>
                  <span className="text-sm text-muted-foreground">{course.percentage}%</span>
                </div>
                
                <Progress 
                  value={course.percentage} 
                  className="h-2 mt-2"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GradesOverview;