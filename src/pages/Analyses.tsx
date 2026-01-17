import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid, List, FileText, AlertTriangle, Coins, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateUserCredits, getRemainingCredits, UserCredits, PLANS } from "@/services/creditsService";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Contract {
  id: string;
  name: string;
  type: string;
  score: number;
  risksCount: number;
  date: string;
}

const filters = [
  { label: "Tous", value: "all", color: "text-muted-foreground", bg: "bg-muted" },
  { label: "À signer", value: "sign", color: "text-success", bg: "bg-success/10" },
  { label: "À négocier", value: "negotiate", color: "text-warning", bg: "bg-warning/10" },
  { label: "À refuser", value: "refuse", color: "text-destructive", bg: "bg-destructive/10" },
];

const getVerdict = (score: number) => {
  if (score <= 30) return { label: "SIGNER", class: "verdict-sign" };
  if (score <= 60) return { label: "NÉGOCIER", class: "verdict-negotiate" };
  return { label: "REFUSER", class: "verdict-refuse" };
};

const getScoreColor = (score: number) => {
  if (score <= 30) return "text-success";
  if (score <= 60) return "text-warning";
  return "text-destructive";
};

const Analyses = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch contracts from database
      const { data: contractsData, error } = await supabase
        .from('contract_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contracts:', error);
      } else if (contractsData) {
        const formattedContracts: Contract[] = contractsData.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.contract_type || 'Contrat',
          score: c.risk_score,
          risksCount: Array.isArray(c.red_flags) ? c.red_flags.length : 0,
          date: new Date(c.created_at).toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          }),
        }));
        setContracts(formattedContracts);
      }

      // Fetch user credits
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const credits = await getOrCreateUserCredits(user.id);
        setUserCredits(credits);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "sign") return matchesSearch && contract.score <= 30;
    if (activeFilter === "negotiate") return matchesSearch && contract.score > 30 && contract.score <= 60;
    if (activeFilter === "refuse") return matchesSearch && contract.score > 60;
    
    return matchesSearch;
  });

  // Calculate filter counts from real data
  const filterCounts = {
    all: contracts.length,
    sign: contracts.filter(c => c.score <= 30).length,
    negotiate: contracts.filter(c => c.score > 30 && c.score <= 60).length,
    refuse: contracts.filter(c => c.score > 60).length,
  };

  const remainingCredits = userCredits ? getRemainingCredits(userCredits) : 0;
  const planName = userCredits ? PLANS[userCredits.plan].name : 'Gratuit';

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      const { error } = await supabase
        .from('contract_analyses')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) {
        console.error('Error clearing history:', error);
        toast.error("Erreur lors de la suppression de l'historique");
      } else {
        setContracts([]);
        toast.success("Historique vidé avec succès");
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error("Une erreur s'est produite");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <DashboardLayout title="Mes Analyses" subtitle="Retrouvez tous vos contrats analysés">
      {/* Credits Counter */}
      <div className="mb-6 p-4 bg-card border border-border rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Coins className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Crédits restants</p>
            <p className="font-semibold">
              {remainingCredits === 'unlimited' ? (
                <span className="text-primary">Illimités</span>
              ) : (
                <span>
                  <span className="text-primary">{remainingCredits}</span>
                  <span className="text-muted-foreground"> / {userCredits?.credits_limit || 3}</span>
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
            {planName}
          </span>
          {userCredits?.plan !== 'premium' && (
            <Button size="sm" variant="outline" onClick={() => navigate('/pricing')}>
              Upgrade
            </Button>
          )}
          
          {contracts.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" className="gap-2" disabled={isClearing}>
                  {isClearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Vider historique
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Vider l'historique ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Tous vos contrats analysés seront définitivement supprimés.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Supprimer tout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un contrat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "grid" ? "bg-card shadow-sm" : "hover:bg-card/50"
            )}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-md transition-colors",
              viewMode === "list" ? "bg-card shadow-sm" : "hover:bg-card/50"
            )}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={cn(
              "p-4 rounded-xl border text-left transition-all",
              activeFilter === filter.value
                ? `border-2 ${filter.value === "all" ? "border-foreground" : filter.value === "sign" ? "border-success" : filter.value === "negotiate" ? "border-warning" : "border-destructive"} ${filter.bg}`
                : "border-border bg-card hover:border-border/80"
            )}
          >
            <p className={cn("text-2xl font-bold", filter.color)}>
              {filterCounts[filter.value as keyof typeof filterCounts]}
            </p>
            <p className="text-sm text-muted-foreground">{filter.label}</p>
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement de vos analyses...</p>
        </div>
      )}

      {/* Contracts Grid/List */}
      {!isLoading && (
        <div className={cn(
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-3"
        )}>
          {filteredContracts.map((contract) => {
            const verdict = getVerdict(contract.score);
            
            if (viewMode === "list") {
              return (
                <div
                  key={contract.id}
                  onClick={() => navigate(`/results?id=${contract.id}`)}
                  className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <FileText className="text-muted-foreground" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{contract.name}</p>
                    <p className="text-sm text-muted-foreground">{contract.type}</p>
                  </div>
                  <span className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full border",
                    verdict.class
                  )}>
                    {verdict.label}
                  </span>
                  <span className={cn("font-bold", getScoreColor(contract.score))}>
                    {contract.score}
                  </span>
                  {contract.risksCount > 0 && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <AlertTriangle size={14} className="text-warning" />
                      <span className="text-sm">{contract.risksCount}</span>
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground hidden md:block">{contract.date}</span>
                </div>
              );
            }

            return (
              <div
                key={contract.id}
                onClick={() => navigate(`/results?id=${contract.id}`)}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="text-muted-foreground flex-shrink-0" size={16} />
                    <span className="font-medium text-sm truncate">{contract.name}</span>
                  </div>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0",
                    verdict.class
                  )}>
                    {verdict.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Score Circle */}
                    <div className="relative w-10 h-10">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-muted/30"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={`${(contract.score / 100) * 100} 100`}
                          strokeLinecap="round"
                          className={getScoreColor(contract.score)}
                        />
                      </svg>
                      <span className={cn(
                        "absolute inset-0 flex items-center justify-center text-xs font-semibold",
                        getScoreColor(contract.score)
                      )}>
                        {contract.score}
                      </span>
                    </div>

                    {contract.risksCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <AlertTriangle size={12} className="text-warning" />
                        <span>{contract.risksCount}</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground">{contract.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && filteredContracts.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-4">
            {contracts.length === 0 
              ? "Vous n'avez pas encore analysé de contrats"
              : "Aucun contrat trouvé"}
          </p>
          {contracts.length === 0 && (
            <Button onClick={() => navigate('/analyze')}>
              Analyser un contrat
            </Button>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Analyses;
