import { Briefcase, Home, FileText, Lock, ShoppingCart, Users } from "lucide-react";

const contractTypes = [
  { icon: Briefcase, name: "Freelance", description: "Contrats de prestation", color: "from-blue-500 to-blue-600" },
  { icon: FileText, name: "CDI/CDD", description: "Contrats de travail", color: "from-purple-500 to-purple-600" },
  { icon: Home, name: "Bail", description: "Contrats de location", color: "from-emerald-500 to-emerald-600" },
  { icon: Lock, name: "NDA", description: "Accords de confidentialité", color: "from-orange-500 to-orange-600" },
  { icon: ShoppingCart, name: "Vente", description: "Contrats commerciaux", color: "from-pink-500 to-pink-600" },
  { icon: Users, name: "Associés", description: "Pactes d'actionnaires", color: "from-cyan-500 to-cyan-600" },
];

const ContractTypes = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-medium text-primary mb-3 bg-accent px-4 py-1.5 rounded-full">
            Types supportés
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tous vos contrats analysés
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Notre IA est entraînée sur les contrats français les plus courants
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {contractTypes.map((type, index) => (
            <div
              key={index}
              className="group bg-card border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center"
            >
              <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <type.icon className="text-white" size={24} />
              </div>
              <p className="font-semibold text-sm mb-1">{type.name}</p>
              <p className="text-xs text-muted-foreground">{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContractTypes;