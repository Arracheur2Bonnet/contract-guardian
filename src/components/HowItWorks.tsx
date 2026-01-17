import { Upload, Cpu, FileCheck, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Uploadez",
    step: "01",
    description: "Déposez votre contrat au format PDF (max 10 MB, 50 pages)",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Cpu,
    title: "Analyse IA",
    step: "02",
    description: "Notre IA examine chaque clause en détail (20-40 secondes)",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: FileCheck,
    title: "Rapport",
    step: "03",
    description: "Recevez un rapport avec score de risque et points d'attention",
    color: "from-emerald-500 to-teal-500",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium text-primary mb-3 bg-accent px-4 py-1.5 rounded-full">
            Comment ça marche
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Une analyse complète en 3 étapes
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Simple, rapide et efficace. Obtenez une analyse détaillée de votre contrat en quelques clics.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative bg-card border border-border/50 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Step number */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-sm font-bold text-muted-foreground border border-border/50">
                {step.step}
              </div>
              
              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <step.icon className="text-white" size={28} />
              </div>
              
              <h3 className="font-semibold text-xl mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              
              {/* Arrow connector (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center">
                    <ArrowRight size={12} className="text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;