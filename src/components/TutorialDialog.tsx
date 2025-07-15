import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  Users, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  X
} from "lucide-react";

interface TutorialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TutorialDialog = ({ open, onOpenChange }: TutorialDialogProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to ClassMate!",
      description: "Your all-in-one academic dashboard to stay organized and on top of your studies.",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Get Started with ClassMate</h3>
            <p className="text-muted-foreground">
              Let's take a quick tour of your new academic companion. This tutorial will show you 
              the key features to help you succeed in your studies.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Dashboard Overview",
      description: "Your central hub for all academic activities and quick insights.",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Assignments</span>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">Schedule</span>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">Grades</span>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Events</span>
              </div>
            </Card>
          </div>
          <p className="text-sm text-muted-foreground">
            Your dashboard provides a quick overview of assignments due, upcoming events, 
            recent grades, and today's schedule.
          </p>
        </div>
      )
    },
    {
      title: "Assignment Tracker",
      description: "Keep track of all your assignments with priorities and due dates.",
      icon: CheckSquare,
      content: (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <CheckSquare className="w-6 h-6 text-primary" />
            <h3 className="font-semibold">Assignment Management</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">Physics Lab Report</span>
              <Badge variant="destructive" className="text-xs">High</Badge>
            </div>
            <div className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">Math Problem Set</span>
              <Badge variant="warning" className="text-xs">Medium</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Add new assignments, set priorities, track due dates, and mark them complete 
            when finished. Click "Add Assignment" to get started!
          </p>
        </div>
      )
    },
    {
      title: "Schedule & Calendar",
      description: "View your daily schedule and integrate with Google Calendar.",
      icon: Calendar,
      content: (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="w-6 h-6 text-success" />
            <h3 className="font-semibold">Schedule Management</h3>
          </div>
          <div className="space-y-2">
            <div className="p-2 border rounded bg-primary/5">
              <div className="text-sm font-medium">Physics Lecture</div>
              <div className="text-xs text-muted-foreground">9:00 AM - 10:30 AM</div>
            </div>
            <div className="p-2 border rounded bg-success/5">
              <div className="text-sm font-medium">Study Group</div>
              <div className="text-xs text-muted-foreground">2:00 PM - 4:00 PM</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            View your daily schedule, connect your Google Calendar, and never miss a class 
            or important academic event.
          </p>
        </div>
      )
    },
    {
      title: "Grades & Performance",
      description: "Track your academic performance and GPA across all courses.",
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-6 h-6 text-warning" />
            <h3 className="font-semibold">Academic Performance</h3>
          </div>
          <div className="text-center p-4 bg-gradient-subtle rounded-lg">
            <div className="text-2xl font-bold text-primary">3.7</div>
            <div className="text-sm text-muted-foreground">Current GPA</div>
          </div>
          <p className="text-sm text-muted-foreground">
            Monitor your grades, track trends, and see detailed breakdowns for each course. 
            View the full grades page for comprehensive analytics.
          </p>
        </div>
      )
    },
    {
      title: "Campus Events & Study Groups",
      description: "Stay connected with campus life and find study partners.",
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Users className="w-6 h-6 text-accent" />
            <h3 className="font-semibold">Campus Engagement</h3>
          </div>
          <div className="space-y-2">
            <div className="p-2 border rounded">
              <div className="text-sm font-medium">Spring Career Fair</div>
              <div className="text-xs text-muted-foreground">Mar 20 • Student Union</div>
            </div>
            <div className="p-2 border rounded">
              <div className="text-sm font-medium">Math Study Group</div>
              <div className="text-xs text-muted-foreground">Weekly • Library</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Discover campus events, join study groups, and connect with classmates. 
            RSVP to events and participate in group chats.
          </p>
        </div>
      )
    },
    {
      title: "You're All Set!",
      description: "Start exploring ClassMate and make the most of your academic journey.",
      icon: BookOpen,
      content: (
        <div className="space-y-4 text-center">
          <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ready to Get Started!</h3>
          <p className="text-muted-foreground mb-4">
            You're now ready to use ClassMate to stay organized and excel in your studies. 
            Remember to check back regularly for updates and new features.
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium">Quick tips:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Add your first assignment to get started</li>
              <li>• Connect your Google Calendar for full integration</li>
              <li>• Explore campus events to stay engaged</li>
              <li>• Check your grades regularly to track progress</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeTutorial = () => {
    onOpenChange(false);
    localStorage.setItem('classmate-tutorial-completed', 'true');
  };

  const skipTutorial = () => {
    closeTutorial();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <span>Getting Started</span>
              <Badge variant="outline" className="text-xs">
                {currentStep + 1} of {tutorialSteps.length}
              </Badge>
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={closeTutorial}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress bar */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>

          {/* Step content */}
          <div className="min-h-[300px]">
            <h3 className="text-lg font-semibold mb-2">
              {tutorialSteps[currentStep].title}
            </h3>
            <p className="text-muted-foreground mb-4">
              {tutorialSteps[currentStep].description}
            </p>
            {tutorialSteps[currentStep].content}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <div className="space-x-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              )}
            </div>

            <div className="space-x-2">
              <Button variant="ghost" onClick={skipTutorial}>
                Skip
              </Button>
              {currentStep < tutorialSteps.length - 1 ? (
                <Button onClick={nextStep}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={closeTutorial}>
                  Get Started!
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialDialog;