import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  Calendar,
  TrendingUp,
  Users,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";

interface TutorialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TutorialDialog = ({ open, onOpenChange }: TutorialDialogProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Get current user from localStorage (supabase token)
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("supabase.auth.token") || "{}")?.user;
    } catch {
      return null;
    }
  };

  const getTutorialKey = () => {
    const user = getUser();
    return user?.id
      ? `classmate-tutorial-seen-${user.id}`
      : "classmate-tutorial-seen";
  };

  // Check completion on mount
  useEffect(() => {
    const key = getTutorialKey();
    if (localStorage.getItem(key) === "true") {
      onOpenChange(false);
      setCurrentStep(0);
    }
  }, [onOpenChange]);

  const tutorialSteps = [
    {
      title: "Welcome to ClassMate!",
      description: "Your all-in-one academic dashboard to stay organized and on top of your studies.",
      icon: BookOpen,
      content: (
        <div className="text-center space-y-4">
          <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Get Started with ClassMate</h3>
          <p className="text-muted-foreground">
            Let's take a quick tour of your new academic companion. This tutorial will show you
            the key features to help you succeed in your studies.
          </p>
        </div>
      ),
    },
    {
      title: "Dashboard Overview",
      description: "Your central hub for all academic activities and quick insights.",
      icon: BookOpen,
      content: (
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3 flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Assignments</span>
          </Card>
          <Card className="p-3 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-success" />
            <span className="text-sm font-medium">Schedule</span>
          </Card>
          <Card className="p-3 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium">Grades</span>
          </Card>
          <Card className="p-3 flex items-center space-x-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Events</span>
          </Card>
        </div>
      ),
    },
    // ... other steps ...
    {
      title: "You're All Set!",
      description: "Start exploring ClassMate and make the most of your academic journey.",
      icon: BookOpen,
      content: (
        <div className="text-center space-y-4">
          <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ready to Get Started!</h3>
          <p className="text-muted-foreground mb-4">
            You're now ready to use ClassMate to stay organized and excel in your studies.
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Add your first assignment to get started</li>
            <li>• Connect your Google Calendar for full integration</li>
            <li>• Explore campus events to stay engaged</li>
            <li>• Check your grades regularly to track progress</li>
          </ul>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const completeTutorial = () => {
    localStorage.setItem(getTutorialKey(), "true");
    onOpenChange(false);
    setCurrentStep(0);
  };

  const skipTutorial = () => completeTutorial();

  const step = tutorialSteps[currentStep];

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) completeTutorial();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <span>Getting Started</span>
              <Badge variant="outline" className="text-xs">
                {currentStep + 1} of {tutorialSteps.length}
              </Badge>
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={completeTutorial}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-2 mb-4">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>

        {/* Step content */}
        <div className="min-h-[260px] space-y-4">
          <h3 className="text-lg font-semibold">{step.title}</h3>
          <p className="text-muted-foreground">{step.description}</p>
          {step.content}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          {currentStep > 0 && (
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
          )}
          <div className="space-x-2">
            <Button variant="ghost" onClick={skipTutorial}>
              Skip
            </Button>
            {currentStep < tutorialSteps.length - 1 ? (
              <Button onClick={nextStep}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={completeTutorial}>Get Started!</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialDialog;
