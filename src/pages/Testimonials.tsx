import DashboardLayout from "@/components/DashboardLayout";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Marie Dupont",
    role: "CEO",
    company: "TechStart SAS",
    avatar: "MD",
    rating: 5,
    text: "Contr'Act a révolutionné notre façon de gérer les contrats. Nous avons économisé plus de 50 000€ en évitant des clauses abusives que nous aurions signées sans cette analyse.",
  },
  {
    name: "Jean-Pierre Martin",
    role: "Directeur Juridique",
    company: "GroupeMedia",
    avatar: "JM",
    rating: 5,
    text: "Un outil indispensable pour toute entreprise. L'IA détecte des subtilités que même nos juristes expérimentés auraient pu manquer. Gain de temps considérable.",
  },
  {
    name: "Sophie Bernard",
    role: "Fondatrice & CEO",
    company: "InnovateLab",
    avatar: "SB",
    rating: 5,
    text: "En tant que startup, nous n'avions pas les moyens d'un cabinet d'avocats. Contr'Act nous a permis de négocier nos contrats avec les grands groupes en toute confiance.",
  },
  {
    name: "Thomas Leroy",
    role: "CEO",
    company: "FinanceFirst",
    avatar: "TL",
    rating: 5,
    text: "L'interface est intuitive et les analyses sont d'une précision remarquable. Nous l'utilisons pour tous nos contrats de partenariat depuis 6 mois.",
  },
  {
    name: "Claire Moreau",
    role: "COO",
    company: "RetailPlus",
    avatar: "CM",
    rating: 5,
    text: "Le meilleur investissement de l'année pour notre équipe juridique. Les conseils de négociation sont particulièrement précieux.",
  },
  {
    name: "Alexandre Petit",
    role: "CEO",
    company: "DataFlow",
    avatar: "AP",
    rating: 5,
    text: "Nous avons détecté une clause de non-concurrence de 5 ans cachée dans un contrat freelance. Sans Contr'Act, nous aurions signé les yeux fermés.",
  },
];

const pressLogos = [
  { name: "Forbes", logo: "Forbes" },
  { name: "Les Échos", logo: "Les Échos" },
  { name: "Le Figaro", logo: "Le Figaro" },
  { name: "BFM Business", logo: "BFM Business" },
  { name: "Capital", logo: "Capital" },
  { name: "L'Usine Digitale", logo: "L'Usine Digitale" },
];

const pressArticles = [
  {
    publication: "Forbes",
    title: "Les 10 startups LegalTech qui révolutionnent le droit des affaires",
    quote: "Contr'Act utilise l'IA pour démocratiser l'accès à l'analyse juridique, permettant aux PME de se protéger comme les grands groupes.",
    date: "Janvier 2026",
  },
  {
    publication: "Les Échos",
    title: "LegalTech : l'intelligence artificielle au service des contrats",
    quote: "Une solution française qui promet d'économiser des milliers d'euros aux entreprises en détectant les clauses abusives.",
    date: "Décembre 2025",
  },
  {
    publication: "BFM Business",
    title: "Comment l'IA transforme le métier d'avocat",
    quote: "Contr'Act représente l'avenir de l'analyse contractuelle : rapide, précis et accessible à tous.",
    date: "Novembre 2025",
  },
];

const stats = [
  { value: "50K+", label: "Contrats analysés" },
  { value: "2M€", label: "Économisés par nos clients" },
  { value: "98%", label: "Taux de satisfaction" },
  { value: "4.9/5", label: "Note moyenne" },
];

const Testimonials = () => {
  return (
    <DashboardLayout title="Recommandations" subtitle="Ce que nos clients disent de nous">
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-6 text-center"
          >
            <p className="text-3xl font-bold text-primary">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Press Section */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Ils parlent de nous</h2>
        
        {/* Press Logos */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {pressLogos.map((press) => (
              <div
                key={press.name}
                className="text-muted-foreground font-semibold text-lg md:text-xl opacity-60 hover:opacity-100 transition-opacity"
              >
                {press.logo}
              </div>
            ))}
          </div>
        </div>

        {/* Press Articles */}
        <div className="grid md:grid-cols-3 gap-4">
          {pressArticles.map((article) => (
            <div
              key={article.title}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-primary">{article.publication}</span>
                <span className="text-xs text-muted-foreground">{article.date}</span>
              </div>
              <h3 className="font-medium text-sm mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-sm text-muted-foreground italic">"{article.quote}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* CEO Testimonials */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Avis de dirigeants</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              {/* Quote Icon */}
              <Quote className="text-primary/20 mb-3" size={24} />
              
              {/* Text */}
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Rating */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="text-warning fill-warning"
                  />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-medium text-sm">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-10 bg-primary/5 border border-primary/20 rounded-xl p-8 text-center">
        <h3 className="text-xl font-bold mb-2">Rejoignez plus de 500 entreprises satisfaites</h3>
        <p className="text-muted-foreground mb-4">
          Commencez à analyser vos contrats dès aujourd'hui
        </p>
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={20} className="text-warning fill-warning" />
          ))}
          <span className="ml-2 font-semibold">4.9/5</span>
          <span className="text-muted-foreground text-sm">basé sur 500+ avis</span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Testimonials;
