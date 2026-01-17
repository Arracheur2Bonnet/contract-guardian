import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import KanbanBoard from "@/components/KanbanBoard";
import { FileText, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    signer: 0,
    negocier: 0,
    refuser: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from("contract_analyses")
        .select("verdict, status")
        .eq("status", "completed");

      if (error) throw error;

      const contracts = data || [];
      setStats({
        total: contracts.length,
        signer: contracts.filter(c => c.verdict === "SIGNER").length,
        negocier: contracts.filter(c => c.verdict === "NÉGOCIER").length,
        refuser: contracts.filter(c => c.verdict === "REFUSER").length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const statCards = [
    { label: "Total", value: stats.total, icon: FileText, color: "text-muted-foreground", bg: "bg-muted" },
    { label: "À signer", value: stats.signer, icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
    { label: "À négocier", value: stats.negocier, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
    { label: "À refuser", value: stats.refuser, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  ];

  return (
    <DashboardLayout title="Tableau de bord" subtitle="Gérez vos contrats en un coup d'œil">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={stat.color} size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <KanbanBoard />
    </DashboardLayout>
  );
};

export default Dashboard;
