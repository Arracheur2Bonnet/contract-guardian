import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { FileText, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryItem {
  id: string;
  name: string;
  type: string;
  status: "analyzed" | "in_progress" | "pending";
  score?: number;
  date: string;
}

const historyGroups: { label: string; items: HistoryItem[] }[] = [
  {
    label: "Aujourd'hui",
    items: [
      { id: "1", name: "Contrat Freelance Design", type: "Freelance", status: "analyzed", score: 25, date: "14:32" },
      { id: "2", name: "Bail Appartement Paris", type: "Bail", status: "analyzed", score: 65, date: "10:15" },
    ],
  },
  {
    label: "Hier",
    items: [
      { id: "3", name: "NDA Startup Tech", type: "NDA", status: "analyzed", score: 45, date: "18:45" },
    ],
  },
  {
    label: "Cette semaine",
    items: [
      { id: "4", name: "CDI Développeur Senior", type: "CDI", status: "analyzed", score: 15, date: "Lun 14:00" },
      { id: "5", name: "CGV E-commerce", type: "Vente", status: "analyzed", score: 78, date: "Lun 09:30" },
    ],
  },
  {
    label: "Ce mois",
    items: [
      { id: "6", name: "Contrat Location Véhicule", type: "Bail", status: "analyzed", score: 35, date: "10 Jan" },
      { id: "7", name: "Accord Partenariat", type: "NDA", status: "analyzed", score: 55, date: "8 Jan" },
    ],
  },
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

const History = () => {
  const navigate = useNavigate();

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
                const verdict = item.score !== undefined ? getVerdict(item.score) : null;
                
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate("/results")}
                    className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="text-muted-foreground" size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.type}</p>
                    </div>

                    {item.status === "analyzed" && item.score !== undefined && verdict && (
                      <>
                        <span className={cn(
                          "text-xs font-medium px-2.5 py-1 rounded-full border hidden sm:inline-flex",
                          verdict.class
                        )}>
                          {verdict.label}
                        </span>
                        <span className={cn("font-bold text-lg", getScoreColor(item.score))}>
                          {item.score}
                        </span>
                      </>
                    )}

                    {item.status === "in_progress" && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-warning/10 text-warning">
                        <Clock size={12} />
                        En cours
                      </span>
                    )}

                    {item.status === "pending" && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                        En attente
                      </span>
                    )}

                    <span className="text-sm text-muted-foreground">{item.date}</span>
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
