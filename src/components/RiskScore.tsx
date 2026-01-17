import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface RiskScoreProps {
  score: number;
  size?: "sm" | "lg";
}

const RiskScore = ({ score, size = "lg" }: RiskScoreProps) => {
  // Adjusted thresholds for more balanced scoring
  const getRiskLevel = (score: number) => {
    if (score <= 35) return { 
      label: "Faible risque", 
      verdict: "SIGNER",
      color: "text-success", 
      bg: "bg-gradient-to-br from-success/10 to-success/20",
      ring: "ring-success/30",
      gradient: "from-success to-emerald-400",
      icon: TrendingDown
    };
    if (score <= 65) return { 
      label: "Risque modéré", 
      verdict: "NÉGOCIER",
      color: "text-warning", 
      bg: "bg-gradient-to-br from-warning/10 to-warning/20",
      ring: "ring-warning/30",
      gradient: "from-warning to-amber-400",
      icon: Minus
    };
    return { 
      label: "Risque élevé", 
      verdict: "REFUSER",
      color: "text-destructive", 
      bg: "bg-gradient-to-br from-destructive/10 to-destructive/20",
      ring: "ring-destructive/30",
      gradient: "from-destructive to-red-400",
      icon: TrendingUp
    };
  };

  const risk = getRiskLevel(score);
  const isLarge = size === "lg";
  const RiskIcon = risk.icon;
  
  // Calculate stroke dasharray for circular progress
  const radius = isLarge ? 50 : 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-3", isLarge && "py-4")}>
      <div className="relative">
        {/* Background circle */}
        <svg 
          className={cn("transform -rotate-90", isLarge ? "w-32 h-32" : "w-16 h-16")}
          viewBox={isLarge ? "0 0 128 128" : "0 0 64 64"}
        >
          <circle
            cx={isLarge ? "64" : "32"}
            cy={isLarge ? "64" : "32"}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={isLarge ? "6" : "4"}
            className="text-muted/30"
          />
          <circle
            cx={isLarge ? "64" : "32"}
            cy={isLarge ? "64" : "32"}
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth={isLarge ? "6" : "4"}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={cn("stop-current", risk.color)} />
              <stop offset="100%" className={cn("stop-current", risk.color)} style={{ opacity: 0.6 }} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Score number in center */}
        <div className={cn(
          "absolute inset-0 flex flex-col items-center justify-center",
          risk.bg,
          "rounded-full"
        )}>
          <span className={cn(
            "font-bold",
            risk.color,
            isLarge ? "text-3xl" : "text-lg"
          )}>
            {score}
          </span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>
      
      <div className="text-center">
        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-1.5",
          risk.bg
        )}>
          <RiskIcon size={isLarge ? 14 : 12} className={risk.color} />
          <p className={cn("font-semibold", risk.color, isLarge ? "text-sm" : "text-xs")}>
            {risk.label}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Verdict : <span className={cn("font-medium", risk.color)}>{risk.verdict}</span>
        </p>
      </div>
    </div>
  );
};

export default RiskScore;
