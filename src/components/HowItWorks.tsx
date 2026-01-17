import { Upload, Cpu, FileCheck } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "1. Uploadez",
    description: "Déposez votre contrat au format PDF (max 10 MB, 50 pages)",
  },
  {
    icon: Cpu,
    title: "2. Analyse IA",
    description: "Notre IA examine chaque clause en détail (20-40 secondes)",
  },
  {
    icon: FileCheck,
    title: "3. Rapport",
    description: "Recevez un rapport avec score de risque et points d'attention",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Comment ça marche</h2>
          <p className="text-muted-foreground">
            Une analyse complète en trois étapes simples
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-6 text-center shadow-sm"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <step.icon className="text-primary" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
