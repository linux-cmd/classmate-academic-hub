import StudyGroupChat from "@/components/StudyGroupChat";

const StudyGroups = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle pt-16">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Study Groups</h1>
          <p className="text-muted-foreground">Connect with classmates and collaborate on your studies</p>
        </div>

        <StudyGroupChat />
      </div>
    </div>
  );
};

export default StudyGroups;