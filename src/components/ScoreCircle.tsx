import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: { width: 50, stroke: 4, font: 'text-sm' },
  md: { width: 90, stroke: 5, font: 'text-2xl' },
  lg: { width: 120, stroke: 6, font: 'text-4xl' }
};

export function ScoreCircle({ score, size = 'md', className }: ScoreCircleProps) {
  const config = sizeConfig[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const { strokeClass, textClass, glowClass } = useMemo(() => {
    if (score >= 70) return { 
      strokeClass: 'stroke-success', 
      textClass: 'text-success', 
      glowClass: 'glow-success' 
    };
    if (score >= 40) return { 
      strokeClass: 'stroke-warning', 
      textClass: 'text-warning', 
      glowClass: 'glow-warning' 
    };
    return { 
      strokeClass: 'stroke-danger', 
      textClass: 'text-danger', 
      glowClass: 'glow-danger' 
    };
  }, [score]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", glowClass, className)}>
      <svg width={config.width} height={config.width} className="-rotate-90">
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={config.stroke}
        />
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          className={cn(strokeClass, "transition-all duration-700 ease-out")}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className={cn("absolute font-bold", config.font, textClass)}>
        {score}
      </span>
    </div>
  );
}
