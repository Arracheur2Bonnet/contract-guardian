import DashboardLayout from "@/components/DashboardLayout";
import KanbanBoard from "@/components/KanbanBoard";
import { FileText, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

const stats = [
  { label: "Total", value: 12, icon: FileText, color: "text-muted-foreground", bg: "bg-muted" },
  { label: "À signer", value: 5, icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  { label: "À négocier", value: 4, icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  { label: "À refuser", value: 3, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
];

const Dashboard = () => {
  return (
    <DashboardLayout title="Tableau de bord" subtitle="Gérez vos contrats en un coup d'œil">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
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
