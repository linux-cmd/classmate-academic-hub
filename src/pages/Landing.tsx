import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Users, 
  CheckSquare, 
  Bell,
  Target,
  Trophy,
  Zap,
  Shield,
  Clock,
  BarChart3,
  ArrowRight,
  Play
} from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import AuthDialog from "@/components/AuthDialog";
import heroImage from "@/assets/hero-study.jpg";

const Landing = () => {
  const { isAuthenticated, signIn, signUp, signInWithGoogle } = useSupabaseAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const features = [
    {
      icon: CheckSquare,
      title: "Smart Assignment Tracking",
      description: "Never miss a deadline again. Track assignments with due dates, priorities, and completion status.",
      color: "text-blue-500"
    },
    {
      icon: Calendar,
      title: "Integrated Schedule",
      description: "Sync your class schedule, study sessions, and important events in one unified calendar.",
      color: "text-green-500"
    },
    {
      icon: TrendingUp,
      title: "Grade Analytics",
      description: "Visualize your academic progress with detailed grade tracking and performance insights.",
      color: "text-purple-500"
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Connect with classmates, form study groups, and collaborate on projects effectively.",
      color: "text-orange-500"
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get timely reminders for assignments, exams, and study sessions based on your schedule.",
      color: "text-red-500"
    },
    {
      icon: Target,
      title: "Goal Setting",
      description: "Set academic goals, track your progress, and celebrate achievements along the way.",
      color: "text-indigo-500"
    }
  ];

  const benefits = [
    {
      icon: Trophy,
      title: "Boost Your GPA",
      description: "Students using ClassMate see an average 15% improvement in their grades"
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Reduce planning time by 60% with our intelligent scheduling algorithms"
    },
    {
      icon: Zap,
      title: "Stay Motivated",
      description: "Gamified progress tracking keeps you engaged and motivated to succeed"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your academic data is encrypted and never shared with third parties"
    }
  ];

  if (isAuthenticated) {
    window.location.hash = "#dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">ClassMate</h1>
            </div>
            <Button onClick={() => setShowAuthDialog(true)}>
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="h-96 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-primary/90" />
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl text-white">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                🎓 Your Academic Success Companion
              </Badge>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Turn Your Studies Into A 
                <span className="text-yellow-300"> Winning Game</span>
              </h1>
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                ClassMate transforms academic chaos into organized success. Track assignments, 
                manage schedules, analyze grades, and collaborate with peers - all in one 
                beautifully designed platform that makes studying actually enjoyable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => setShowAuthDialog(true)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Your Journey
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">✨ Powerful Features</Badge>
            <h2 className="text-4xl font-bold mb-6">Everything You Need To Excel</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              ClassMate provides all the tools you need to organize your academic life, 
              track your progress, and achieve your educational goals with confidence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-primary/10 flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">📈 Proven Results</Badge>
            <h2 className="text-4xl font-bold mb-6">Why Students Love ClassMate</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
                  <benefit.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="border-0 bg-gradient-primary text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-6">Ready To Transform Your Studies?</h2>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Join thousands of students who have already boosted their academic performance 
                with ClassMate. Start your journey to academic excellence today.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => setShowAuthDialog(true)}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm mt-4 text-white/70">
                No credit card required • Free forever • Setup in 30 seconds
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded bg-gradient-primary flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">ClassMate</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ClassMate. Built for student success.
            </p>
          </div>
        </div>
      </footer>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        onLogin={signIn}
        onSignUp={signUp}
        onGoogleSignIn={signInWithGoogle}
      />
    </div>
  );
};

export default Landing;