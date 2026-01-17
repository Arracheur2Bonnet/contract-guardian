import { ScoreCircle } from "./ScoreCircle";

interface RiskScoreProps {
  score: number;
  size?: "sm" | "lg";
}

const RiskScore = ({ score, size = "lg" }: RiskScoreProps) => {
  const getRiskLevel = (score: number) => {
    if (score >= 70) return { label: "Excellent", color: "text-success" };
    if (score >= 40) return { label: "Moyen", color: "text-warning" };
    return { label: "À risque", color: "text-danger" };
  };

  const risk = getRiskLevel(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <ScoreCircle score={score} size={size === "lg" ? "lg" : "sm"} />
      <div className="text-center">
        <p className={`font-semibold ${risk.color} ${size === "lg" ? "text-lg" : "text-sm"}`}>
          {risk.label}
        </p>
        <p className="text-xs text-muted-foreground">Score sur 100</p>
      </div>
    </div>
  );
};

export default RiskScore;
