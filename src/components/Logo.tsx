import logoImage from "@/assets/logo.png";

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

  const logoSizes = {
    sm: 24,
    md: 32,
    lg: 48,
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img 
        src={logoImage} 
        alt="Contr'Act Logo" 
        width={logoSizes[size]} 
        height={logoSizes[size]}
        className="object-contain"
      />
      <span className={`font-semibold tracking-tight ${sizeClasses[size]}`}>
        Contr<span className="text-primary">'</span>Act
      </span>
    </div>
  );
};

export default Logo;
