import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface RiskScoreProps {
  score: number;
  size?: "sm" | "lg";
}

const RiskScore = ({ score, size = "lg" }: RiskScoreProps) => {
  const getRiskLevel = (score: number) => {
    if (score <= 30) return { 
      label: "Faible risque", 
      color: "text-success", 
      bg: "bg-gradient-to-br from-success/10 to-success/20",
      ring: "ring-success/30",
      gradient: "from-success to-emerald-400",
      icon: TrendingDown
    };
    if (score <= 60) return { 
      label: "Risque modéré", 
      color: "text-warning", 
      bg: "bg-gradient-to-br from-warning/10 to-warning/20",
      ring: "ring-warning/30",
      gradient: "from-warning to-amber-400",
      icon: Minus
    };
    return { 
      label: "Risque élevé", 
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
  const radius = isLarge ? 56 : 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-4", isLarge && "py-6")}>
      <div className="relative">
        {/* Background circle */}
        <svg 
          className={cn("transform -rotate-90", isLarge ? "w-36 h-36" : "w-20 h-20")}
          viewBox={isLarge ? "0 0 144 144" : "0 0 80 80"}
        >
          <circle
            cx={isLarge ? "72" : "40"}
            cy={isLarge ? "72" : "40"}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={isLarge ? "8" : "6"}
            className="text-muted/30"
          />
          <circle
            cx={isLarge ? "72" : "40"}
            cy={isLarge ? "72" : "40"}
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth={isLarge ? "8" : "6"}
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
            isLarge ? "text-4xl" : "text-xl"
          )}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      
      <div className="text-center">
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2",
          risk.bg
        )}>
          <RiskIcon size={isLarge ? 18 : 14} className={risk.color} />
          <p className={cn("font-semibold", risk.color, isLarge ? "text-lg" : "text-sm")}>
            {risk.label}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">Score de risque global</p>
      </div>
    </div>
  );
};

export default RiskScore;