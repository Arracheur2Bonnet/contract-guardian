import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const getSeverityStyles = (gravite: string) => {
    switch (gravite) {
      case "élevée":
        return {
          icon: AlertTriangle,
          bg: "bg-destructive/10",
          border: "border-destructive/20",
          badge: "bg-destructive text-destructive-foreground",
          iconColor: "text-destructive",
        };
      case "modérée":
        return {
          icon: AlertCircle,
          bg: "bg-warning/10",
          border: "border-warning/20",
          badge: "bg-warning text-warning-foreground",
          iconColor: "text-warning",
        };
      default:
        return {
          icon: Info,
          bg: "bg-muted",
          border: "border-border",
          badge: "bg-muted-foreground text-background",
          iconColor: "text-muted-foreground",
        };
    }
  };

  const styles = getSeverityStyles(flag.gravite);
  const Icon = styles.icon;

  return (
    <div className={cn("border rounded-lg p-5", styles.bg, styles.border)}>
      <div className="flex items-start gap-4">
        <div className={cn("mt-0.5", styles.iconColor)}>
          <Icon size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-semibold">{flag.titre}</h3>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full capitalize",
                styles.badge
              )}
            >
              {flag.gravite}
            </span>
            {flag.article && (
              <span className="text-xs text-muted-foreground">
                {flag.article}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/80 mb-3">{flag.description}</p>
          {flag.citation && (
            <blockquote className="border-l-2 border-border pl-3 py-1 text-sm font-mono text-muted-foreground bg-background/50 rounded-r">
              "{flag.citation}"
            </blockquote>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedFlagCard;
