import { cn } from "@/lib/utils";

interface RiskScoreProps {
  score: number;
  size?: "sm" | "lg";
}

const RiskScore = ({ score, size = "lg" }: RiskScoreProps) => {
  const getRiskLevel = (score: number) => {
    if (score <= 30) return { label: "Faible risque", color: "text-success", bg: "bg-success/10" };
    if (score <= 60) return { label: "Risque modéré", color: "text-warning", bg: "bg-warning/10" };
    return { label: "Risque élevé", color: "text-destructive", bg: "bg-destructive/10" };
  };

  const risk = getRiskLevel(score);
  const isLarge = size === "lg";

  return (
    <div className={cn("flex flex-col items-center gap-4", isLarge && "py-6")}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold",
          risk.bg,
          risk.color,
          isLarge ? "w-32 h-32 text-5xl" : "w-16 h-16 text-2xl"
        )}
      >
        {score}
      </div>
      <div className="text-center">
        <p className={cn("font-semibold", risk.color, isLarge ? "text-xl" : "text-base")}>
          {risk.label}
        </p>
        <p className="text-sm text-muted-foreground">Score de risque sur 100</p>
      </div>
    </div>
  );
};

export default RiskScore;
