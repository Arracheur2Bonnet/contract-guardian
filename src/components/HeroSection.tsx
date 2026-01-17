import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight, Shield, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 -z-10 gradient-bg-subtle" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight mb-6 leading-tight">
            Analysez vos contrats en{" "}
            <span className="gradient-text">2 minutes</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Détection automatique de clauses problématiques grâce à l'intelligence artificielle. 
            Protégez-vous avant de signer.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link to="/analyze">
              <Button 
                size="lg" 
                className="gap-2 h-14 px-8 text-base rounded-full gradient-primary border-0 shadow-[var(--shadow-primary)] hover:shadow-[var(--shadow-primary-hover)] hover:scale-[1.02] transition-all duration-200"
              >
                Analyser un contrat
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
          
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="inline-flex items-center gap-2 bg-success/10 border border-success/20 px-4 py-2.5 rounded-full text-sm font-medium text-foreground">
              <Shield size={16} className="text-success" />
              <span>100% confidentiel</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-warning/10 border border-warning/20 px-4 py-2.5 rounded-full text-sm font-medium text-foreground">
              <Zap size={16} className="text-warning" />
              <span>Résultats en 30 sec</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
