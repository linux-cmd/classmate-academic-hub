import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, BookOpen, Award, Calendar, Target } from "lucide-react";

const Grades = () => {
  const [selectedSemester, setSelectedSemester] = useState("current");

  const courses: Array<{ id: number; name: string; code: string; grade: string; percentage: number; credits: number; trend: string; professor?: string; assignments?: Array<{ name: string; grade: string; weight: number }>; }> = [];

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

  const currentGPA = "0.0";
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const creditGoal = 15;

  return (
    <div className="min-h-screen bg-gradient-subtle pt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Academic Performance</h1>
          <p className="text-muted-foreground">Track your grades and academic progress</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Current GPA</p>
                  <p className="text-2xl font-bold text-primary">{currentGPA}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm text-muted-foreground">Credits</p>
                  <p className="text-2xl font-bold">{totalCredits}/{creditGoal}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Courses</p>
                  <p className="text-2xl font-bold">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Dean's List</p>
                  <p className="text-lg font-bold text-accent">Eligible</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedSemester} onValueChange={setSelectedSemester}>
          <TabsList className="mb-6">
            <TabsTrigger value="current">Current Semester</TabsTrigger>
            <TabsTrigger value="previous">Previous Semesters</TabsTrigger>
            <TabsTrigger value="analytics">Grade Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {courses.length === 0 ? (
                <Card className="lg:col-span-2">
                  <CardContent className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                    <p className="text-muted-foreground">Add your courses to start tracking grades.</p>
                  </CardContent>
                </Card>
              ) : (
                courses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{course.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{course.code}</Badge>
                          <span className={`font-bold text-lg ${getGradeColor(course.percentage)}`}>
                            {course.grade}
                          </span>
                          <span className="text-lg">{getTrendIcon(course.trend)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {course.professor} • {course.credits} credits
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Overall Grade</span>
                          <span>{course.percentage}%</span>
                        </div>
                        <Progress value={course.percentage} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Grade Breakdown</h4>
                        {course.assignments?.map((assignment, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{assignment.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">{assignment.weight}%</span>
                              <span className="font-medium">{assignment.grade}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="previous">
            <Card>
              <CardHeader>
                <CardTitle>Previous Semesters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Previous semester data will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Grade Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Grade trends and analytics will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Grades;