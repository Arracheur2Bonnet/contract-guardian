import Logo from "./Logo";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
              Fait avec <Heart size={14} className="text-destructive fill-destructive" /> en France
            </span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-right max-w-lg">
            Contr'Act est un outil d'analyse automatisée à but informatif. 
            Il ne remplace pas les conseils d'un professionnel du droit.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;