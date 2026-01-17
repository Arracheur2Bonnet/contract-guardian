import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Loader2, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";

interface AnalyzedContract {
  id: string;
  name: string;
  score: number;
  risksCount: number;
  date: string;
}

interface InProgressContract {
  id: string;
  name: string;
  progress: number;
}

// Mock data
const analyzedContracts: AnalyzedContract[] = [
  { id: "1", name: "Contrat Freelance.pdf", score: 25, risksCount: 2, date: "Aujourd'hui" },
  { id: "2", name: "Bail_2024.pdf", score: 65, risksCount: 5, date: "Hier" },
  { id: "3", name: "NDA_Startup.pdf", score: 45, risksCount: 3, date: "Il y a 2j" },
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

const KanbanBoard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [inProgressContracts, setInProgressContracts] = useState<InProgressContract[]>([]);

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
    // Navigate to analyze page with file
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Column 1: To Analyze */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-info/10 text-info">
            À analyser
          </span>
          <span className="text-xs text-muted-foreground">0</span>
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

      {/* Column 2: In Progress */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            En cours
          </span>
          <span className="text-xs text-muted-foreground">{inProgressContracts.length}</span>
        </div>

        <div className="space-y-3">
          {inProgressContracts.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-6 text-center">
              <p className="text-sm text-muted-foreground">Aucune analyse en cours</p>
            </div>
          ) : (
            inProgressContracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-card border border-border rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="text-warning animate-spin" size={18} />
                  <span className="font-medium text-sm truncate">{contract.name}</span>
                </div>
                <Progress value={contract.progress} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {contract.progress}%
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Column 3: Analyzed */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            Analysés
          </span>
          <span className="text-xs text-muted-foreground">{analyzedContracts.length}</span>
        </div>

        <div className="space-y-3">
          {analyzedContracts.map((contract) => {
            const verdict = getVerdict(contract.score);
            return (
              <div
                key={contract.id}
                onClick={() => navigate("/results")}
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

                    {/* Risks count */}
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
      </div>
    </div>
  );
};

export default KanbanBoard;
