import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";

interface TourDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tourSteps = [
  {
    title: "Welcome to ClassMate! 🎓",
    content: "Your all-in-one academic productivity platform designed to help you stay organized and excel in your studies.",
    image: "✨",
    highlights: ["Manage assignments", "Track grades", "Schedule events", "Take notes"],
  },
  {
    title: "Dashboard Overview 📊",
    content: "Get a bird's-eye view of your academic life with real-time statistics, upcoming deadlines, and recent activity.",
    image: "📈",
    highlights: ["Quick stats", "Recent assignments", "Grade overview", "Upcoming events"],
  },
  {
    title: "Assignments & Tasks ✅",
    content: "Create, organize, and track your assignments with due dates, priorities, and subjects. Never miss a deadline again!",
    image: "📝",
    highlights: ["Add assignments", "Set priorities", "Track progress", "Filter by subject"],
  },
  {
    title: "Smart Scheduling 📅",
    content: "Manage your academic calendar with classes, study sessions, meetings, and events. Stay on top of your schedule.",
    image: "⏰",
    highlights: ["Add events", "View by day/week/month", "Event types", "Time management"],
  },
  {
    title: "Notion-Style Notes 📚",
    content: "Take rich notes with our Notion-inspired editor. Organize with folders, tags, and favorites for easy retrieval.",
    image: "✍️",
    highlights: ["Rich text editing", "Folders & tags", "Search notes", "Favorites"],
  },
  {
    title: "Grade Tracking 📊",
    content: "Monitor your academic performance with detailed grade tracking, GPA calculation, and subject-wise analysis.",
    image: "🏆",
    highlights: ["Add grades", "Calculate GPA", "Subject analysis", "Performance trends"],
  },
  {
    title: "You're All Set! 🚀",
    content: "Start building your productive academic workflow. Remember, consistency is key to academic success!",
    image: "🎯",
    highlights: ["Start with assignments", "Schedule your week", "Take notes", "Track progress"],
  },
];

const TourDialog = ({ open, onOpenChange }: TourDialogProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Check localStorage on mount to auto-close if completed
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("supabase.auth.token") || "{}")?.user;
    const userKey = user?.id ? `classmate-tour-completed-${user.id}` : "classmate-tour-completed";

    if (localStorage.getItem(userKey) === "true") {
      onOpenChange(false);
      setCurrentStep(0);
    }
  }, [onOpenChange]);

  const markTourComplete = () => {
    const user = JSON.parse(localStorage.getItem("supabase.auth.token") || "{}")?.user;
    if (user?.id) {
      localStorage.setItem(`classmate-tour-completed-${user.id}`, "true");
    }
    localStorage.setItem("classmate-tour-completed", "true");
  };

  const finishTour = () => {
    markTourComplete();
    onOpenChange(false);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finishTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const step = tourSteps[currentStep];

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) finishTour();
      }}
    >
      <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <DialogTitle>Getting Started Tour</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {tourSteps.length}
            </span>
          </div>

          {/* Step Content */}
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">{step.image}</div>
            <h3 className="text-2xl font-bold">{step.title}</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">{step.content}</p>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {step.highlights.map((highlight, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex space-x-2">
              <Button variant="ghost" onClick={finishTour}>
                Skip Tour
              </Button>

              {currentStep === tourSteps.length - 1 ? (
                <Button onClick={finishTour} className="flex items-center space-x-2">
                  <span>Get Started</span>
                  <Sparkles className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={nextStep} className="flex items-center space-x-2">
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TourDialog;
