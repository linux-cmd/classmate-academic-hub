import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BookOpen, Plus, Award } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { supabase } from "@/integrations/supabase/client";

interface Grade {
  id: string;
  subject: string;
  assignment_name: string;
  grade: number;
  max_grade: number;
  weight: number;
  semester: string | null;
  date_graded: string;
}

const NotionGrades = () => {
  const { user } = useSupabaseAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGrades = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('user_id', user.id)
        .order('date_graded', { ascending: false })
        .limit(6);

      if (error) throw error;
      setGrades(data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [user]);

  const calculateGPA = () => {
    if (grades.length === 0) return 0;
    const totalPoints = grades.reduce((sum, grade) => {
      const percentage = (grade.grade / grade.max_grade) * 100;
      let points = 0;
      if (percentage >= 90) points = 4.0;
      else if (percentage >= 80) points = 3.0;
      else if (percentage >= 70) points = 2.0;
      else if (percentage >= 60) points = 1.0;
      return sum + points * grade.weight;
    }, 0);
    const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
    return totalWeight > 0 ? (totalPoints / totalWeight).toFixed(2) : 0;
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "info";
    if (percentage >= 70) return "warning";
    return "destructive";
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Academic Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded"></div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentGPA = calculateGPA();

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp className="h-5 w-5" />
            Academic Performance
          </CardTitle>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Grade
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* GPA Overview */}
            <div className="p-4 bg-gradient-subtle rounded-lg mb-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Current GPA</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{currentGPA}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                  <p className="text-xl font-semibold">{new Set(grades.map(g => g.subject)).size}</p>
                </div>
              </div>
            </div>

        {grades.length === 0 ? (
          <div className="py-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">No grades recorded yet</p>
            <p className="text-sm text-muted-foreground">Add grades to track your academic performance</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-muted-foreground">Recent Grades</h4>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                View All
              </Button>
            </div>
            
            {grades.map((grade) => {
              const percentage = (grade.grade / grade.max_grade) * 100;
              const letterGrade = getLetterGrade(percentage);
              
              return (
                <div
                  key={grade.id}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{grade.assignment_name}</h4>
                          <p className="text-xs text-muted-foreground">{grade.subject}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-sm">
                          {grade.grade}/{grade.max_grade}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                      <Badge variant={getGradeColor(percentage) as any} className="text-xs">
                        {letterGrade}
                      </Badge>
                    </div>
                  </div>
                  
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotionGrades;