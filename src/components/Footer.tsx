import Logo from "./Logo";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-gradient-to-b from-transparent to-accent/30 mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              Fait avec <Heart size={14} className="text-destructive fill-destructive" /> en France
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            Contr'Act est un outil d'analyse automatisée à but informatif. 
            Il ne remplace pas les conseils d'un professionnel du droit.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
