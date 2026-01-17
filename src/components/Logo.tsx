import { FileText } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo = ({ size = "md", className = "" }: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 36,
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <FileText className="text-primary" size={iconSizes[size]} strokeWidth={2} />
      <span className={`font-semibold tracking-tight ${sizeClasses[size]}`}>
        Contr<span className="text-primary">'</span>Act
      </span>
    </div>
  );
};

export default Logo;
