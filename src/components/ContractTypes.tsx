import { Briefcase, Home, FileText, Lock, ShoppingCart } from "lucide-react";

const contractTypes = [
  { icon: Briefcase, name: "Freelance", description: "Contrats de prestation" },
  { icon: FileText, name: "CDI/CDD", description: "Contrats de travail" },
  { icon: Home, name: "Bail", description: "Contrats de location" },
  { icon: Lock, name: "NDA", description: "Accords de confidentialité" },
  { icon: ShoppingCart, name: "Vente", description: "Contrats commerciaux" },
];

const ContractTypes = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Types de contrats supportés</h2>
          <p className="text-muted-foreground">
            Notre IA est entraînée sur les contrats français les plus courants
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
          {contractTypes.map((type, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-card border border-border rounded-lg px-5 py-3 shadow-sm"
            >
              <type.icon className="text-primary" size={20} />
              <div>
                <p className="font-medium text-sm">{type.name}</p>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContractTypes;
