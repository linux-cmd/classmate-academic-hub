import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Send, MessageCircle, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  userName: string;
  userInitials: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface StudyGroup {
  id: string;
  name: string;
  course: string;
  members: number;
  isActive: boolean;
}

const StudyGroupChat = () => {
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const studyGroups: StudyGroup[] = [
    {
      id: '1',
      name: 'Calculus Study Group',
      course: 'MATH 101',
      members: 8,
      isActive: true
    },
    {
      id: '2',
      name: 'Physics Problem Solving',
      course: 'PHYS 201',
      members: 12,
      isActive: true
    },
    {
      id: '3',
      name: 'History Research Team',
      course: 'HIST 150',
      members: 6,
      isActive: false
    }
  ];

  const sampleMessages: Message[] = [
    {
      id: '1',
      userName: 'Sarah Chen',
      userInitials: 'SC',
      content: 'Hey everyone! Ready for tomorrow\'s quiz?',
      timestamp: '2:30 PM',
      isOwn: false
    },
    {
      id: '2',
      userName: 'You',
      userInitials: 'JD',
      content: 'Yes! I\'ve been working through the practice problems.',
      timestamp: '2:32 PM',
      isOwn: true
    },
    {
      id: '3',
      userName: 'Mike Rodriguez',
      userInitials: 'MR',
      content: 'Can someone explain question 7 from the homework?',
      timestamp: '2:35 PM',
      isOwn: false
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleJoinGroup = (group: StudyGroup) => {
    setSelectedGroup(group);
    setMessages(sampleMessages);
    
    // Simulate connecting to real-time chat
    setTimeout(() => {
      setIsConnected(true);
      toast({
        title: "Joined Study Group",
        description: `Connected to ${group.name}`,
      });
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedGroup) return;

    const message: Message = {
      id: Date.now().toString(),
      userName: 'You',
      userInitials: 'JD',
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate receiving a response
    setTimeout(() => {
      const responses = [
        'Great question!',
        'I think the answer is in chapter 5.',
        'Let me check my notes.',
        'Anyone else having trouble with this?',
        'Thanks for sharing!'
      ];
      
      const response: Message = {
        id: (Date.now() + 1).toString(),
        userName: 'Alex Johnson',
        userInitials: 'AJ',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false
      };
      
      setMessages(prev => [...prev, response]);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedGroup) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Study Groups</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {studyGroups.map(group => (
            <div
              key={group.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {group.course.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{group.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {group.course} • {group.members} members
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant={group.isActive ? "success" : "secondary"}>
                  {group.isActive ? "Active" : "Inactive"}
                </Badge>
                <Button
                  size="sm"
                  onClick={() => handleJoinGroup(group)}
                  disabled={!group.isActive}
                >
                  Join Chat
                </Button>
              </div>
            </div>
          ))}

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Real-time Messaging</h4>
            <p className="text-sm text-muted-foreground">
              This is a demo chat interface. For production real-time messaging, 
              you'll need to integrate with Supabase for backend functionality 
              including WebSocket connections and message persistence.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedGroup(null);
              setMessages([]);
              setIsConnected(false);
            }}
          >
            ← Back
          </Button>
          <div>
            <CardTitle className="text-lg">{selectedGroup.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedGroup.course} • {selectedGroup.members} members
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-success" />
          ) : (
            <WifiOff className="w-4 h-4 text-muted-foreground" />
          )}
          <Badge variant={isConnected ? "success" : "secondary"}>
            {isConnected ? "Connected" : "Connecting..."}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 p-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.isOwn ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className={`text-xs ${
                  message.isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {message.userInitials}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex-1 ${message.isOwn ? 'text-right' : ''}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium">{message.userName}</span>
                  <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                </div>
                <div className={`inline-block max-w-[80%] p-3 rounded-lg text-sm ${
                  message.isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}>
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex items-center space-x-2 pt-3 border-t">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={!isConnected}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyGroupChat;