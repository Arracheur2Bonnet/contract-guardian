import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import RiskScore from "@/components/RiskScore";
import RedFlagCard from "@/components/RedFlagCard";
import StandardClauseCard from "@/components/StandardClauseCard";
import ChatAssistant from "@/components/ChatAssistant";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertTriangle, 
  FileText, 
  ArrowLeft, 
  Download, 
  Phone, 
  Mail, 
  MapPin,
  Scale,
  CheckCircle,
  Loader2,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { getContractAnalysis, ContractAnalysis } from "@/services/contractService";

const Results = () => {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<ContractAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContract = async () => {
      if (!id) {
        navigate("/analyze");
        return;
      }

      const data = await getContractAnalysis(id);
      if (!data || data.status !== 'analyzed') {
        navigate("/analyze");
        return;
      }

      setContract(data);
      setLoading(false);
    };

    fetchContract();
  }, [id, navigate]);

  const handleDownloadReport = () => {
    if (!contract) return;

    const redFlags = contract.red_flags || [];
    const standardClauses = contract.standard_clauses || [];
    const elevatedCount = redFlags.filter((f: any) => f.gravite === "élevée").length;
    const moderateCount = redFlags.filter((f: any) => f.gravite === "modérée").length;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let yPos = 20;

    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = pdf.splitTextToSize(text, maxWidth);
      
      lines.forEach((line: string) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(line, margin, yPos);
        yPos += fontSize * 0.5;
      });
      yPos += 2;
    };

    const addSpace = (space: number = 5) => {
      yPos += space;
    };

    // Header
    pdf.setFillColor(59, 130, 246);
    pdf.rect(0, 0, pageWidth, 40, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text("RAPPORT D'ANALYSE", margin, 25);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${contract.name} - Contr'Act`, margin, 35);
    
    yPos = 55;
    pdf.setTextColor(0, 0, 0);

    // Date
    addText(`Date: ${new Date(contract.created_at).toLocaleDateString('fr-FR')}`, 10);
    addSpace(10);

    // Risk Score
    pdf.setFillColor(contract.risk_score <= 35 ? 34 : contract.risk_score <= 65 ? 245 : 239, 
                     contract.risk_score <= 35 ? 197 : contract.risk_score <= 65 ? 158 : 68, 
                     contract.risk_score <= 35 ? 94 : contract.risk_score <= 65 ? 11 : 68);
    pdf.roundedRect(margin, yPos, maxWidth, 30, 3, 3, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Score de risque: ${contract.risk_score}/100`, margin + 10, yPos + 12);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    const riskLabel = contract.risk_score <= 35 ? "Risque faible" : contract.risk_score <= 65 ? "Risque modere" : "Risque eleve";
    pdf.text(riskLabel, margin + 10, yPos + 24);
    
    yPos += 40;
    pdf.setTextColor(0, 0, 0);

    // Summary
    if (contract.resume) {
      addText("RESUME", 14, true);
      addSpace(3);
      addText(contract.resume, 10);
      addSpace(10);
    }

    // Statistics
    addText("STATISTIQUES", 14, true);
    addSpace(3);
    addText(`• Problemes majeurs: ${elevatedCount}`, 10);
    addText(`• Points d'attention: ${moderateCount}`, 10);
    addText(`• Clauses standard: ${standardClauses.length}`, 10);
    addSpace(10);

    // Red Flags
    if (redFlags.length > 0) {
      addText("POINTS D'ATTENTION DETECTES", 14, true);
      addSpace(5);
      
      redFlags.forEach((flag: any, index: number) => {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }
        
        const graviteColor = flag.gravite === "élevée" ? [239, 68, 68] : 
                            flag.gravite === "modérée" ? [245, 158, 11] : [34, 197, 94];
        pdf.setFillColor(graviteColor[0], graviteColor[1], graviteColor[2]);
        pdf.circle(margin + 3, yPos - 2, 2, "F");
        
        addText(`${index + 1}. ${flag.titre}`, 11, true);
        pdf.setTextColor(100, 100, 100);
        addText(`Gravite: ${flag.gravite.toUpperCase()}`, 9);
        pdf.setTextColor(0, 0, 0);
        addText(flag.description, 10);
        if (flag.article) {
          addText(`Article: ${flag.article}`, 9);
        }
        addSpace(8);
      });
    }

    // Standard Clauses
    if (standardClauses.length > 0) {
      if (yPos > 230) {
        pdf.addPage();
        yPos = 20;
      }
      
      addText("CLAUSES STANDARD DETECTEES", 14, true);
      addSpace(5);
      
      standardClauses.forEach((clause: any, index: number) => {
        if (yPos > 260) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.setFillColor(34, 197, 94);
        pdf.circle(margin + 3, yPos - 2, 2, "F");
        addText(`${index + 1}. ${clause.titre}`, 11, true);
        addText(clause.description, 10);
        addSpace(5);
      });
    }

    // Footer / Disclaimer
    pdf.addPage();
    yPos = 20;
    
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPos, maxWidth, 50, "F");
    yPos += 10;
    
    pdf.setTextColor(100, 100, 100);
    addText("AVERTISSEMENT LEGAL", 12, true);
    addSpace(3);
    addText("Cette analyse est fournie a titre informatif uniquement.", 10);
    addText("Elle ne constitue pas un avis juridique.", 10);
    addText("Nous vous recommandons de consulter un avocat avant toute signature.", 10);
    
    yPos += 20;
    pdf.setTextColor(150, 150, 150);
    addText("© Contr'Act - Tous droits reserves", 9);

    // Save PDF
    pdf.save(`rapport-${contract.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast.success("Rapport PDF téléchargé avec succès !");
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.phone) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("Demande envoyée ! Un avocat vous contactera sous 48h.");
  };

  if (loading) {
    return (
      <DashboardLayout title="Chargement..." subtitle="">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!contract) {
    return null;
  }

  const redFlags = contract.red_flags || [];
  const standardClauses = contract.standard_clauses || [];
  const elevatedCount = redFlags.filter((f: any) => f.gravite === "élevée").length;
  const moderateCount = redFlags.filter((f: any) => f.gravite === "modérée").length;

  return (
    <DashboardLayout title={contract.name} subtitle={contract.contract_type}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <Link
            to="/history"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Retour à l'historique
          </Link>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadReport}>
            <Download size={14} />
            Télécharger le rapport
          </Button>
        </div>

        {/* Hero Card - Risk Score & Summary */}
        <div className="bg-gradient-to-br from-card to-muted/20 border border-border rounded-2xl overflow-hidden shadow-sm mb-8">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Risk Score */}
              <div className="flex-shrink-0">
                <RiskScore score={contract.risk_score} size="lg" />
              </div>
              
              {/* Summary & Stats */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                  {elevatedCount > 0 && (
                    <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full">
                      <AlertTriangle size={14} />
                      <span className="text-sm font-medium">
                        {elevatedCount} problème{elevatedCount > 1 ? "s" : ""} majeur{elevatedCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                  {moderateCount > 0 && (
                    <div className="flex items-center gap-2 bg-warning/10 text-warning px-4 py-2 rounded-full">
                      <AlertTriangle size={14} />
                      <span className="text-sm font-medium">
                        {moderateCount} point{moderateCount > 1 ? "s" : ""} d'attention
                      </span>
                    </div>
                  )}
                  {standardClauses.length > 0 && (
                    <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full">
                      <CheckCircle size={14} />
                      <span className="text-sm font-medium">
                        {standardClauses.length} clause{standardClauses.length > 1 ? "s" : ""} conforme{standardClauses.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {contract.resume && (
                  <div className="bg-background/50 rounded-xl p-5 border border-border/50">
                    <div className="flex items-start gap-3">
                      <BookOpen className="text-primary flex-shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Résumé de l'analyse</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {contract.resume}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Red Flags */}
        {redFlags.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-destructive/10">
                <AlertTriangle className="text-destructive" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Points d'attention</h2>
                <p className="text-sm text-muted-foreground">{redFlags.length} élément{redFlags.length > 1 ? "s" : ""} détecté{redFlags.length > 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="space-y-4">
              {redFlags.map((flag: any, index: number) => (
                <RedFlagCard key={index} flag={flag} />
              ))}
            </div>
          </section>
        )}

        {/* Standard Clauses */}
        {standardClauses.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-success/10">
                <CheckCircle className="text-success" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Clauses conformes</h2>
                <p className="text-sm text-muted-foreground">{standardClauses.length} clause{standardClauses.length > 1 ? "s" : ""} standard{standardClauses.length > 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {standardClauses.map((clause: any, index: number) => (
                <StandardClauseCard key={index} clause={clause} />
              ))}
            </div>
          </section>
        )}

        {/* Contact Lawyer Section */}
        <Card className="mb-10 overflow-hidden rounded-2xl border-border/50">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border p-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-xl">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Besoin d'un avis juridique ?</h2>
                <p className="text-sm text-muted-foreground">
                  Nos avocats partenaires analysent votre contrat en profondeur
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            {!showContactForm && !isSubmitted ? (
              <div className="space-y-5">
                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Phone className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p className="text-muted-foreground">01 23 45 67 89</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">avocats@contract.fr</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <p className="font-medium">Cabinet</p>
                      <p className="text-muted-foreground">Paris, France</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-2">Cabinet Durand & Associés</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Notre cabinet partenaire, spécialisé en droit des contrats depuis plus de 20 ans, 
                    vous accompagne dans l'analyse approfondie de vos documents juridiques.
                  </p>
                  <ul className="text-xs space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                      Première consultation gratuite
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                      Réponse sous 48h ouvrées
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                      Tarifs transparents et compétitifs
                    </li>
                  </ul>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => setShowContactForm(true)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Être recontacté par un avocat
                </Button>
              </div>
            ) : isSubmitted ? (
              <div className="text-center py-6">
                <div className="bg-success/10 p-4 rounded-full w-fit mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-success" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Demande envoyée !</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Un avocat du Cabinet Durand & Associés vous contactera sous 48h ouvrées
                  pour discuter de votre contrat.
                </p>
                <p className="text-xs text-muted-foreground">
                  Vous recevrez un email de confirmation à l'adresse indiquée.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">
                      Nom complet *
                    </label>
                    <Input
                      placeholder="Jean Dupont"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">
                      Téléphone *
                    </label>
                    <Input
                      placeholder="06 12 34 56 78"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">
                    Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="jean.dupont@email.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">
                    Message (optionnel)
                  </label>
                  <Textarea
                    placeholder="Précisez vos questions ou préoccupations concernant ce contrat..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowContactForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer ma demande"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>

        {/* Chat Assistant */}
        <ChatAssistant 
          contractText={contract.contract_text} 
        />

        {/* Disclaimer */}
        <div className="mt-10 flex items-start gap-3 text-sm text-muted-foreground bg-muted/30 border border-border/50 p-5 rounded-2xl">
          <div className="p-2 bg-muted rounded-lg">
            <AlertTriangle size={16} className="flex-shrink-0" />
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">Avertissement</p>
            <p>
              Cet outil est fourni à titre informatif uniquement et ne remplace pas les conseils d'un avocat qualifié.
              Les informations présentées peuvent ne pas refléter l'intégralité des risques juridiques.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Results;
