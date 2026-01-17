import { Briefcase, FileText, Home, Lock, ShoppingCart, Users } from "lucide-react";

const contractTypes = [
  {
    icon: Briefcase,
    title: "Freelance",
    description: "Contrats de prestation",
    iconBg: "icon-bg-blue",
    iconColor: "icon-blue",
    hoverBg: "hover:bg-[hsl(217,91%,98%)]",
  },
  {
    icon: FileText,
    title: "CDI / CDD",
    description: "Contrats de travail",
    iconBg: "icon-bg-violet",
    iconColor: "icon-violet",
    hoverBg: "hover:bg-[hsl(263,84%,98%)]",
  },
  {
    icon: Home,
    title: "Bail",
    description: "Location immobilière",
    iconBg: "icon-bg-green",
    iconColor: "icon-green",
    hoverBg: "hover:bg-[hsl(160,84%,97%)]",
  },
  {
    icon: Lock,
    title: "NDA",
    description: "Confidentialité",
    iconBg: "icon-bg-orange",
    iconColor: "icon-orange",
    hoverBg: "hover:bg-[hsl(38,92%,97%)]",
  },
  {
    icon: ShoppingCart,
    title: "Vente",
    description: "Conditions générales",
    iconBg: "icon-bg-rose",
    iconColor: "icon-rose",
    hoverBg: "hover:bg-[hsl(330,81%,98%)]",
  },
  {
    icon: Users,
    title: "Associés",
    description: "Pactes d'associés",
    iconBg: "icon-bg-cyan",
    iconColor: "icon-cyan",
    hoverBg: "hover:bg-[hsl(185,93%,97%)]",
  },
];

const ContractTypes = () => {
  return (
    <section className="py-24">
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 max-w-4xl mx-auto">
          {contractTypes.map((type, index) => (
            <div
              key={index}
              className={`group bg-card rounded-2xl p-6 text-center shadow-sm border border-border/50 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${type.hoverBg}`}
            >
              <div className={`w-14 h-14 ${type.iconBg} rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110`}>
                <type.icon className={type.iconColor} size={26} />
              </div>
              <h3 className="font-semibold text-base mb-1">{type.title}</h3>
              <p className="text-muted-foreground text-sm">{type.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContractTypes;