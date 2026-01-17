import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  Clock, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  FileSearch
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo.png";

interface RecentContract {
  id: string;
  name: string;
  score: number;
}

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Search, label: "Analyses", path: "/analyses" },
  { icon: Clock, label: "Historique", path: "/history" },
  { icon: Settings, label: "Paramètres", path: "/settings" },
];

// Mock data for recent contracts
const recentContracts: RecentContract[] = [
  { id: "1", name: "Contrat Freelance", score: 25 },
  { id: "2", name: "Bail appartement", score: 65 },
  { id: "3", name: "NDA Startup", score: 45 },
  { id: "4", name: "CDI Tech", score: 15 },
  { id: "5", name: "CGV E-commerce", score: 78 },
];

const getScoreColor = (score: number) => {
  if (score <= 30) return "bg-success";
  if (score <= 60) return "bg-warning";
  return "bg-destructive";
};

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-[280px]"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <img 
          src={logoImage} 
          alt="Contr'Act" 
          className="w-8 h-8 flex-shrink-0"
        />
        {!collapsed && (
          <span className="font-semibold text-lg text-primary">
            Contr'Act
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/" && location.pathname === "/");
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}

        {/* Recent Contracts Section */}
        {!collapsed && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Contrats récents
            </p>
            <div className="space-y-1">
              {recentContracts.map((contract) => (
                <Link
                  key={contract.id}
                  to={`/results/${contract.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", getScoreColor(contract.score))} />
                  <span className="truncate">{contract.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-card border border-border rounded-full p-1.5 shadow-sm hover:bg-muted transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm flex-shrink-0">
            TD
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">Thomas Dubois</p>
              <p className="text-xs text-muted-foreground truncate">thomas@example.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
