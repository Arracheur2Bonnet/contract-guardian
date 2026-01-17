import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight, Shield, Sparkles, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/50 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent border border-primary/20 px-5 py-2.5 rounded-full text-sm font-medium text-accent-foreground mb-8 shadow-sm">
            <Sparkles size={16} className="text-primary" />
            <span>Analyse juridique automatisée par IA</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Analysez vos contrats en{" "}
            <span className="gradient-text">2 minutes</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Détection automatique de clauses problématiques grâce à l'intelligence artificielle. 
            Protégez-vous avant de signer.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/analyze">
              <Button size="lg" className="gap-2 h-14 px-8 text-base rounded-full gradient-primary border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                Analyser un contrat
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
          
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 shadow-sm border border-border/50">
              <Shield size={16} className="text-success" />
              <span>100% confidentiel</span>
            </div>
            <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2 shadow-sm border border-border/50">
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