import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  Search, 
  Clock, 
  Settings, 
  LogOut,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo.png";
import { getRecentContracts, ContractAnalysis } from "@/services/contractService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Search, label: "Analyses", path: "/analyses" },
  { icon: Clock, label: "Historique", path: "/history" },
  { icon: CreditCard, label: "Abonnement", path: "/pricing" },
  { icon: Settings, label: "Paramètres", path: "/settings" },
];

const getScoreColor = (score: number) => {
  if (score <= 35) return "bg-success";
  if (score <= 65) return "bg-warning";
  return "bg-destructive";
};

const AppSidebar = () => {
  const [recentContracts, setRecentContracts] = useState<ContractAnalysis[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState("U");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecent = async () => {
      const contracts = await getRecentContracts(5);
      setRecentContracts(contracts.filter((c) => c.status === 'completed' || c.status === 'analyzed'));
    };

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
        const name = user.user_metadata?.full_name || user.email || "User";
        const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
        setUserInitials(initials);
      }
    };

    fetchRecent();
    fetchUser();
  }, [location.pathname]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion");
    } else {
      toast.success("Déconnexion réussie");
      navigate("/auth");
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-card border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <img 
          src={logoImage} 
          alt="Contr'Act" 
          className="w-7 h-7 flex-shrink-0"
        />
        <span className="font-semibold text-base text-primary">
          Contr'Act
        </span>
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
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Recent Contracts Section */}
        {recentContracts.length > 0 && (
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

      {/* User Section */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs flex-shrink-0">
              {userInitials}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium text-xs truncate">{userEmail || "Utilisateur"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
