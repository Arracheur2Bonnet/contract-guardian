import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  Clock, 
  Settings, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo.png";
import { getRecentContracts, ContractAnalysis } from "@/services/contractService";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Search, label: "Analyses", path: "/analyses" },
  { icon: Clock, label: "Historique", path: "/history" },
  { icon: Settings, label: "Paramètres", path: "/settings" },
];

const getScoreColor = (score: number) => {
  if (score <= 35) return "bg-success";
  if (score <= 65) return "bg-warning";
  return "bg-destructive";
};

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [recentContracts, setRecentContracts] = useState<ContractAnalysis[]>([]);
  const location = useLocation();

  useEffect(() => {
    const fetchRecent = async () => {
      const contracts = await getRecentContracts(5);
      setRecentContracts(contracts.filter(c => c.status === 'analyzed'));
    };

    fetchRecent();
  }, [location.pathname]); // Refresh when navigating

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <img 
          src={logoImage} 
          alt="Contr'Act" 
          className="w-7 h-7 flex-shrink-0"
        />
        {!collapsed && (
          <span className="font-semibold text-base text-primary">
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
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}

        {/* Recent Contracts Section */}
        {!collapsed && recentContracts.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="px-3 text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Contrats récents
            </p>
            <div className="space-y-0.5">
              {recentContracts.map((contract) => (
                <Link
                  key={contract.id}
                  to={`/results/${contract.id}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", getScoreColor(contract.risk_score))} />
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
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* User Section */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs flex-shrink-0">
            TD
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-medium text-xs truncate">Thomas Dubois</p>
              <p className="text-[10px] text-muted-foreground truncate">thomas@example.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
