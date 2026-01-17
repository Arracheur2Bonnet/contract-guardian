import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2, FileText, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Contract {
  id: string;
  name: string;
  risk_score: number;
  verdict: string;
  red_flags: unknown;
  created_at: string;
  status: string;
}

const getVerdict = (verdict: string) => {
  if (verdict === "SIGNER") return { label: "SIGNER", class: "verdict-sign" };
  if (verdict === "NÉGOCIER") return { label: "NÉGOCIER", class: "verdict-negotiate" };
  return { label: "REFUSER", class: "verdict-refuse" };
};

const getScoreColor = (score: number) => {
  if (score <= 35) return "text-success";
  if (score <= 65) return "text-warning";
  return "text-destructive";
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
};

const KanbanBoard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from("contract_analyses")
        .select("*")
        .eq("status", "completed")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    navigate("/analyze", { state: { file } });
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Group contracts by verdict
  const signerContracts = contracts.filter(c => c.verdict === "SIGNER");
  const negocierContracts = contracts.filter(c => c.verdict === "NÉGOCIER");
  const refuserContracts = contracts.filter(c => c.verdict === "REFUSER");

  const renderContractCard = (contract: Contract) => {
    const verdict = getVerdict(contract.verdict);
    const redFlags = contract.red_flags;
    const risksCount = Array.isArray(redFlags) ? redFlags.length : 0;

    return (
      <div
        key={contract.id}
        onClick={() => navigate(`/results/${contract.id}`)}
        className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
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

        <div className="flex items-center justify-between mt-3">
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
                  strokeDasharray={`${(contract.risk_score / 100) * 100} 100`}
                  strokeLinecap="round"
                  className={getScoreColor(contract.risk_score)}
                />
              </svg>
              <span className={cn(
                "absolute inset-0 flex items-center justify-center text-xs font-semibold",
                getScoreColor(contract.risk_score)
              )}>
                {contract.risk_score}
              </span>
            </div>

            {/* Risks count */}
            {risksCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <AlertTriangle size={12} className="text-warning" />
                <span>{risksCount}</span>
              </div>
            )}
          </div>

          <span className="text-xs text-muted-foreground">{formatDate(contract.created_at)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Column 1: To Analyze */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-info/10 text-info">
            À analyser
          </span>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
            isDragOver 
              ? "border-info bg-info/5" 
              : "border-border hover:border-info/50"
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
              <Upload className="text-info" size={24} />
            </div>
            <div>
              <p className="font-medium text-sm">Glissez un contrat ici</p>
              <p className="text-xs text-muted-foreground mt-1">PDF uniquement, max 10 MB</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBrowseClick}
              className="mt-2"
            >
              Parcourir
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Column 2: À signer */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            À signer
          </span>
          <span className="text-xs text-muted-foreground">{signerContracts.length}</span>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-muted-foreground" size={20} />
            </div>
          ) : signerContracts.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground">Aucun contrat</p>
            </div>
          ) : (
            signerContracts.map(renderContractCard)
          )}
        </div>
      </div>

      {/* Column 3: À négocier */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            À négocier
          </span>
          <span className="text-xs text-muted-foreground">{negocierContracts.length}</span>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-muted-foreground" size={20} />
            </div>
          ) : negocierContracts.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground">Aucun contrat</p>
            </div>
          ) : (
            negocierContracts.map(renderContractCard)
          )}
        </div>
      </div>

      {/* Column 4: À refuser */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            À refuser
          </span>
          <span className="text-xs text-muted-foreground">{refuserContracts.length}</span>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-muted-foreground" size={20} />
            </div>
          ) : refuserContracts.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground">Aucun contrat</p>
            </div>
          ) : (
            refuserContracts.map(renderContractCard)
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
