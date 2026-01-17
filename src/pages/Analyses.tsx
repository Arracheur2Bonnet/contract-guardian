import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid, List, FileText, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Contract {
  id: string;
  name: string;
  type: string;
  score: number;
  risksCount: number;
  date: string;
}

const contracts: Contract[] = [
  { id: "1", name: "Contrat Freelance Design", type: "Freelance", score: 25, risksCount: 2, date: "17 Jan 2026" },
  { id: "2", name: "Bail Appartement Paris", type: "Bail", score: 65, risksCount: 5, date: "16 Jan 2026" },
  { id: "3", name: "NDA Startup Tech", type: "NDA", score: 45, risksCount: 3, date: "15 Jan 2026" },
  { id: "4", name: "CDI Développeur Senior", type: "CDI", score: 15, risksCount: 1, date: "14 Jan 2026" },
  { id: "5", name: "CGV E-commerce", type: "Vente", score: 78, risksCount: 7, date: "13 Jan 2026" },
  { id: "6", name: "Contrat Prestation Services", type: "Freelance", score: 35, risksCount: 3, date: "12 Jan 2026" },
];

const filters = [
  { label: "Tous", value: "all", count: 12, color: "text-muted-foreground", bg: "bg-muted" },
  { label: "À signer", value: "sign", count: 5, color: "text-success", bg: "bg-success/10" },
  { label: "À négocier", value: "negotiate", count: 4, color: "text-warning", bg: "bg-warning/10" },
  { label: "À refuser", value: "refuse", count: 3, color: "text-destructive", bg: "bg-destructive/10" },
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

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "sign") return matchesSearch && contract.score <= 30;
    if (activeFilter === "negotiate") return matchesSearch && contract.score > 30 && contract.score <= 60;
    if (activeFilter === "refuse") return matchesSearch && contract.score > 60;
    
    return matchesSearch;
  });

  return (
    <DashboardLayout title="Mes Analyses" subtitle="Retrouvez tous vos contrats analysés">
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
            <p className={cn("text-2xl font-bold", filter.color)}>{filter.count}</p>
            <p className="text-sm text-muted-foreground">{filter.label}</p>
          </button>
        ))}
      </div>

      {/* Contracts Grid/List */}
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
                onClick={() => navigate("/results")}
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
              onClick={() => navigate("/results")}
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

      {filteredContracts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun contrat trouvé</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Analyses;
