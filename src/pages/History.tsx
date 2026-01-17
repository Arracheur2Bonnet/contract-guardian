import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllContracts, groupContractsByDate, formatContractDate, ContractAnalysis } from "@/services/contractService";

const getVerdict = (score: number) => {
  if (score <= 35) return { label: "SIGNER", class: "verdict-sign" };
  if (score <= 65) return { label: "NÉGOCIER", class: "verdict-negotiate" };
  return { label: "REFUSER", class: "verdict-refuse" };
};

const getScoreColor = (score: number) => {
  if (score <= 35) return "text-success";
  if (score <= 65) return "text-warning";
  return "text-destructive";
};

const History = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<ContractAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContracts = async () => {
      const data = await getAllContracts();
      setContracts(data);
      setLoading(false);
    };

    fetchContracts();
  }, []);

  const historyGroups = groupContractsByDate(contracts);

  if (loading) {
    return (
      <DashboardLayout title="Historique" subtitle="Retrouvez toutes vos analyses passées">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (contracts.length === 0) {
    return (
      <DashboardLayout title="Historique" subtitle="Retrouvez toutes vos analyses passées">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Aucune analyse pour le moment</p>
          <p className="text-xs text-muted-foreground mt-1">
            Analysez votre premier contrat pour le voir ici
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Historique" subtitle="Retrouvez toutes vos analyses passées">
      <div className="space-y-8">
        {historyGroups.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-2">
              {group.items.map((item) => {
                const isCompleted = item.status === "analyzed" || item.status === "completed";
                const verdict = isCompleted ? getVerdict(item.risk_score) : null;

                return (
                  <div
                    key={item.id}
                    onClick={() => isCompleted && navigate(`/results/${item.id}`)}
                    className={cn(
                      "bg-card border border-border rounded-xl p-4 flex items-center gap-4 transition-all",
                      isCompleted
                        ? "hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                        : "opacity-70"
                    )}
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="text-muted-foreground" size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.contract_type}</p>
                    </div>

                    {isCompleted && verdict && (
                      <>
                        <span className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full border hidden sm:inline-flex",
                          verdict.class
                        )}>
                          {verdict.label}
                        </span>
                        <span className={cn("font-bold", getScoreColor(item.risk_score))}>
                          {item.risk_score}
                        </span>
                      </>
                    )}

                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-warning/10 text-warning">
                        <Clock size={12} />
                        En cours
                      </span>
                    )}

                    {item.status === "failed" && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-destructive/10 text-destructive">
                        Échec
                      </span>
                    )}

                    <span className="text-xs text-muted-foreground">{formatContractDate(item.created_at)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default History;
