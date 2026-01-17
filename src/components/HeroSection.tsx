import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight, Shield, AlertTriangle, Clock } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm text-muted-foreground mb-6">
            <Shield size={16} />
            <span>Analyse juridique automatisée</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Analysez vos contrats en{" "}
            <span className="text-primary">2 minutes</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            Détection automatique de clauses problématiques grâce à l'intelligence artificielle.
          </p>
          
          <p className="text-sm text-muted-foreground mb-8 flex items-center justify-center gap-2">
            <AlertTriangle size={14} />
            Ne remplace pas un avocat
          </p>
          
          <Link to="/analyze">
            <Button size="lg" className="gap-2 h-12 px-8 text-base">
              Analyser un contrat
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
