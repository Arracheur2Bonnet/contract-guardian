import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
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
  Loader2
} from "lucide-react";
import { AnalysisResult } from "@/types/analysis";
import { toast } from "sonner";
import jsPDF from "jspdf";

const Results = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [contractText, setContractText] = useState<string>("");
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
    const stored = sessionStorage.getItem("analysisResult");
    const storedText = sessionStorage.getItem("contractText");
    
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      navigate("/analyze");
    }
    
    if (storedText) {
      setContractText(storedText);
    }
  }, [navigate]);

  const handleDownloadReport = () => {
    if (!result) return;

    const elevatedCount = result.redFlags.filter((f) => f.gravite === "élevée").length;
    const moderateCount = result.redFlags.filter((f) => f.gravite === "modérée").length;

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
    pdf.text("Contr'Act - Analyse de contrat", margin, 35);
    
    yPos = 55;
    pdf.setTextColor(0, 0, 0);

    // Date
    addText(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 10);
    addSpace(10);

    // Risk Score
    pdf.setFillColor(result.riskScore <= 30 ? 34 : result.riskScore <= 60 ? 245 : 239, 
                     result.riskScore <= 30 ? 197 : result.riskScore <= 60 ? 158 : 68, 
                     result.riskScore <= 30 ? 94 : result.riskScore <= 60 ? 11 : 68);
    pdf.roundedRect(margin, yPos, maxWidth, 30, 3, 3, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Score de risque: ${result.riskScore}/100`, margin + 10, yPos + 12);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    const riskLabel = result.riskScore <= 30 ? "Risque faible" : result.riskScore <= 60 ? "Risque modere" : "Risque eleve";
    pdf.text(riskLabel, margin + 10, yPos + 24);
    
    yPos += 40;
    pdf.setTextColor(0, 0, 0);

    // Summary
    if (result.resume) {
      addText("RESUME", 14, true);
      addSpace(3);
      addText(result.resume, 10);
      addSpace(10);
    }

    // Statistics
    addText("STATISTIQUES", 14, true);
    addSpace(3);
    addText(`• Problemes majeurs: ${elevatedCount}`, 10);
    addText(`• Points d'attention: ${moderateCount}`, 10);
    addText(`• Clauses standard: ${result.standardClauses.length}`, 10);
    addSpace(10);

    // Red Flags
    if (result.redFlags.length > 0) {
      addText("POINTS D'ATTENTION DETECTES", 14, true);
      addSpace(5);
      
      result.redFlags.forEach((flag, index) => {
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
    if (result.standardClauses.length > 0) {
      if (yPos > 230) {
        pdf.addPage();
        yPos = 20;
      }
      
      addText("CLAUSES STANDARD DETECTEES", 14, true);
      addSpace(5);
      
      result.standardClauses.forEach((clause, index) => {
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
    pdf.save(`rapport-contrat-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast.success("Rapport PDF telecharge avec succes !");

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

  if (!result) {
    return null;
  }

  const elevatedCount = result.redFlags.filter((f) => f.gravite === "élevée").length;
  const moderateCount = result.redFlags.filter((f) => f.gravite === "modérée").length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
              >
                <ArrowLeft size={14} />
                Retour
              </Link>
              <h1 className="text-3xl font-bold">Résultats de l'analyse</h1>
            </div>
            <Button variant="outline" className="gap-2" onClick={handleDownloadReport}>
              <Download size={16} />
              Télécharger le rapport
            </Button>
          </div>

          {/* Risk Score Card */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8 shadow-sm">
            <RiskScore score={result.riskScore} size="lg" />
            
            {result.resume && (
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                  {result.resume}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              {elevatedCount > 0 && (
                <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full">
                  {elevatedCount} problème{elevatedCount > 1 ? "s" : ""} majeur{elevatedCount > 1 ? "s" : ""}
                </span>
              )}
              {moderateCount > 0 && (
                <span className="bg-warning/10 text-warning px-3 py-1 rounded-full">
                  {moderateCount} point{moderateCount > 1 ? "s" : ""} d'attention
                </span>
              )}
              {result.standardClauses.length > 0 && (
                <span className="bg-success/10 text-success px-3 py-1 rounded-full">
                  {result.standardClauses.length} clause{result.standardClauses.length > 1 ? "s" : ""} standard
                </span>
              )}
            </div>
          </div>

          {/* Red Flags */}
          {result.redFlags.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-destructive" size={20} />
                <h2 className="text-xl font-semibold">Points d'attention détectés</h2>
              </div>
              <div className="space-y-4">
                {result.redFlags.map((flag, index) => (
                  <RedFlagCard key={index} flag={flag} />
                ))}
              </div>
            </section>
          )}

          {/* Standard Clauses */}
          {result.standardClauses.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-success" size={20} />
                <h2 className="text-xl font-semibold">Clauses standard détectées</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {result.standardClauses.map((clause, index) => (
                  <StandardClauseCard key={index} clause={clause} />
                ))}
              </div>
            </section>
          )}

          {/* Contact Lawyer Section */}
          <Card className="mb-8 overflow-hidden">
            <div className="bg-primary/5 border-b border-border p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Scale className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Besoin d'un avis juridique ?</h2>
                  <p className="text-sm text-muted-foreground">
                    Nos avocats partenaires analysent votre contrat en profondeur
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {!showContactForm && !isSubmitted ? (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Téléphone</p>
                        <p className="text-muted-foreground">01 23 45 67 89</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">avocats@contract.fr</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Cabinet</p>
                        <p className="text-muted-foreground">Paris, France</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Cabinet Durand & Associés</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Notre cabinet partenaire, spécialisé en droit des contrats depuis plus de 20 ans, 
                      vous accompagne dans l'analyse approfondie de vos documents juridiques.
                    </p>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        Première consultation gratuite
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        Réponse sous 48h ouvrées
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        Tarifs transparents et compétitifs
                      </li>
                    </ul>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setShowContactForm(true)}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Être recontacté par un avocat
                  </Button>
                </div>
              ) : isSubmitted ? (
                <div className="text-center py-8">
                  <div className="bg-success/10 p-4 rounded-full w-fit mx-auto mb-4">
                    <CheckCircle className="h-12 w-12 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Demande envoyée !</h3>
                  <p className="text-muted-foreground mb-4">
                    Un avocat du Cabinet Durand & Associés vous contactera sous 48h ouvrées
                    pour discuter de votre contrat.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vous recevrez un email de confirmation à l'adresse indiquée.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
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
                      <label className="text-sm font-medium mb-1.5 block">
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
                    <label className="text-sm font-medium mb-1.5 block">
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
                    <label className="text-sm font-medium mb-1.5 block">
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
                      className="flex-1"
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

          {/* Disclaimer */}
          <div className="bg-muted/50 border border-border rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Cette analyse a détecté {result.redFlags.length} point{result.redFlags.length > 1 ? "s" : ""} d'attention. 
                Nous vous recommandons de faire relire ces clauses par un avocat avant signature.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/analyze">
              <Button variant="outline" className="w-full sm:w-auto">
                Analyser un autre contrat
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {contractText && (
        <ChatAssistant 
          contractText={contractText} 
          redFlags={result.redFlags}
        />
      )}
    </Layout>
  );
};

export default Results;
