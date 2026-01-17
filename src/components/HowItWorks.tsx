import { Upload, Cpu, FileCheck, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Uploadez",
    step: "01",
    description: "Déposez votre contrat au format PDF (max 10 MB, 50 pages)",
    iconBg: "icon-bg-blue",
    iconColor: "icon-blue",
  },
  {
    icon: Cpu,
    title: "Analyse IA",
    step: "02",
    description: "Notre IA examine chaque clause en détail (20-40 secondes)",
    iconBg: "icon-bg-rose",
    iconColor: "icon-rose",
  },
  {
    icon: FileCheck,
    title: "Rapport",
    step: "03",
    description: "Recevez un rapport avec score de risque et points d'attention",
    iconBg: "icon-bg-cyan",
    iconColor: "icon-cyan",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 relative bg-muted/30">
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
        
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative bg-card rounded-3xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Step number */}
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-xs font-bold text-muted-foreground border border-border">
                {step.step}
              </div>
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl ${step.iconBg} flex items-center justify-center mb-6`}>
                <step.icon className={step.iconColor} size={26} />
              </div>
              
              <h3 className="font-semibold text-xl mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
              
              {/* Arrow connector (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shadow-sm">
                    <ArrowRight size={14} className="text-muted-foreground" />
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
