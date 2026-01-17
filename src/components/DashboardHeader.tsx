import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

const DashboardHeader = ({ title, subtitle }: DashboardHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title */}
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
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
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell size={20} className="text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
            TD
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
