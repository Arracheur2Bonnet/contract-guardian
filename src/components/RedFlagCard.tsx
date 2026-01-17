import { AlertTriangle, AlertCircle, Info, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface RedFlag {
  type: string;
  titre: string;
  description: string;
  citation: string;
  gravite: "faible" | "modérée" | "élevée";
  article?: string;
}

interface RedFlagCardProps {
  flag: RedFlag;
}

const RedFlagCard = ({ flag }: RedFlagCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getSeverityStyles = (gravite: string) => {
    switch (gravite) {
      case "élevée":
        return {
          icon: AlertTriangle,
          bg: "bg-gradient-to-br from-destructive/5 to-destructive/10",
          border: "border-destructive/20",
          badge: "bg-gradient-to-r from-destructive to-red-600 text-white",
          iconBg: "bg-destructive/10",
          iconColor: "text-destructive",
          accentLine: "bg-destructive",
        };
      case "modérée":
        return {
          icon: AlertCircle,
          bg: "bg-gradient-to-br from-warning/5 to-warning/10",
          border: "border-warning/20",
          badge: "bg-gradient-to-r from-warning to-orange-500 text-white",
          iconBg: "bg-warning/10",
          iconColor: "text-warning",
          accentLine: "bg-warning",
        };
      default:
        return {
          icon: Info,
          bg: "bg-muted/50",
          border: "border-border",
          badge: "bg-muted-foreground text-background",
          iconBg: "bg-muted",
          iconColor: "text-muted-foreground",
          accentLine: "bg-muted-foreground",
        };
    }
  };

  const styles = getSeverityStyles(flag.gravite);
  const Icon = styles.icon;

  return (
    <div 
      className={cn(
        "relative border rounded-2xl p-5 transition-all duration-300 cursor-pointer overflow-hidden group hover:shadow-lg",
        styles.bg, 
        styles.border
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Accent line */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl", styles.accentLine)} />
      
      <div className="flex items-start gap-4 pl-2">
        <div className={cn("p-2.5 rounded-xl mt-0.5", styles.iconBg)}>
          <Icon size={20} className={styles.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">{flag.titre}</h3>
            <span className={cn("text-xs px-3 py-1 rounded-full capitalize font-medium shadow-sm", styles.badge)}>
              {flag.gravite}
            </span>
            {flag.article && (
              <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-full">
                {flag.article}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{flag.description}</p>
          
          {flag.citation && (
            <div className={cn(
              "overflow-hidden transition-all duration-300",
              isExpanded ? "max-h-40 mt-4 opacity-100" : "max-h-0 opacity-0"
            )}>
              <blockquote className="border-l-2 border-primary/30 pl-4 py-2 text-sm font-mono text-muted-foreground bg-card rounded-r-xl">
                "{flag.citation}"
              </blockquote>
            </div>
          )}
          
          {flag.citation && (
            <button className="flex items-center gap-1 mt-3 text-xs text-primary font-medium group-hover:gap-2 transition-all">
              {isExpanded ? "Masquer" : "Voir l'extrait"}
              <ChevronRight size={14} className={cn("transition-transform", isExpanded && "rotate-90")} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedFlagCard;