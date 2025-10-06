import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PresenceUser } from '@/hooks/useRealtimeNote';

interface PresenceAvatarsProps {
  users: PresenceUser[];
  isConnected: boolean;
}

export const PresenceAvatars = ({ users, isConnected }: PresenceAvatarsProps) => {
  if (!isConnected && users.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <div className="flex -space-x-2">
          {users.slice(0, 5).map((user) => (
            <Tooltip key={user.userId}>
              <TooltipTrigger>
                <Avatar className="w-8 h-8 border-2 border-background" style={{ borderColor: user.color }}>
                  {user.userAvatar ? (
                    <AvatarImage src={user.userAvatar} alt={user.userName} />
                  ) : (
                    <AvatarFallback style={{ backgroundColor: user.color }}>
                      {user.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.userName}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {users.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
              +{users.length - 5}
            </div>
          )}
        </div>
      </TooltipProvider>
      {isConnected && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Connected
        </div>
      )}
    </div>
  );
};
