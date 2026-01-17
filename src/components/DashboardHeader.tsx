import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Bell, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userInitials, setUserInitials] = useState("U");
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Bienvenue sur Contr'Act !",
      description: "Commencez par analyser votre premier contrat.",
      time: "Maintenant",
      read: false
    },
    {
      id: "2", 
      title: "Nouveau : Assistant IA",
      description: "Posez des questions sur vos contrats à notre assistant.",
      time: "Il y a 1h",
      read: false
    }
  ]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email || "User";
        const initials = name.split(/[@.\s]/).filter(Boolean).map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
        setUserInitials(initials || "U");
      }
    };
    fetchUser();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title */}
        <div>
          {title && <h1 className="text-xl font-bold text-foreground">{title}</h1>}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[240px] bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>

          {/* New Analysis Button */}
          <Button 
            onClick={() => navigate("/analyze")}
            className="gap-2"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nouveau</span>
          </Button>

          {/* Notifications */}
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                <Bell size={20} className="text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Aucune notification
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                            <p className="font-medium text-sm truncate">{notification.title}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">{notification.time}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <X size={14} className="text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
            {userInitials}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;