import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Briefcase, Home, FileText, Lock, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contractTypes = [
  { icon: Briefcase, name: "Freelance" },
  { icon: FileText, name: "CDI/CDD" },
  { icon: Home, name: "Bail" },
  { icon: Lock, name: "NDA" },
  { icon: ShoppingCart, name: "Vente" },
];

const Analyze = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // For demo purposes, we'll simulate the analysis
      // In production, this would call the actual API
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // Store mock results in sessionStorage for demo
      const mockResult = {
        success: true,
        riskScore: 45,
        redFlags: [
          {
            type: "Clause de non-concurrence abusive",
            titre: "Non-concurrence excessive",
            description: "La durée de non-concurrence de 3 ans dépasse la limite raisonnable de 2 ans et s'applique sur toute la France sans compensation financière prévue.",
            citation: "Le prestataire s'engage à ne pas exercer d'activité concurrente pendant une durée de 3 ans sur l'ensemble du territoire français.",
            gravite: "élevée" as const,
            article: "Article 12.3",
          },
          {
            type: "Délais de paiement anormaux",
            titre: "Délai de paiement excessif",
            description: "Le délai de paiement de 90 jours dépasse le maximum légal de 60 jours pour les transactions B2B.",
            citation: "Les factures seront réglées dans un délai de 90 jours à compter de la réception.",
            gravite: "modérée" as const,
            article: "Article 7.2",
          },
          {
            type: "Propriété intellectuelle déséquilibrée",
            titre: "Cession de droits sans limite",
            description: "La cession des droits de propriété intellectuelle est totale et sans contrepartie financière spécifique.",
            citation: "Le prestataire cède l'intégralité de ses droits patrimoniaux sans limitation de durée ni de territoire.",
            gravite: "élevée" as const,
            article: "Article 9.1",
          },
        ],
        standardClauses: [
          {
            titre: "Clause de confidentialité",
            description: "Engagement réciproque de confidentialité avec une durée de 5 ans.",
          },
          {
            titre: "Assurance responsabilité civile",
            description: "Le prestataire dispose d'une assurance RC professionnelle.",
          },
        ],
        resume: "Ce contrat de prestation présente plusieurs points d'attention majeurs, notamment concernant la clause de non-concurrence et la cession de propriété intellectuelle. Une renégociation est conseillée.",
      };

      sessionStorage.setItem("analysisResult", JSON.stringify(mockResult));
      navigate("/results");
    } catch (err) {
      setError("Une erreur est survenue lors de l'analyse. Veuillez réessayer.");
      toast({
        title: "Erreur",
        description: "Impossible d'analyser le contrat",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Analyser un contrat</h1>
            <p className="text-muted-foreground">
              Uploadez votre contrat PDF pour obtenir une analyse détaillée
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
            <FileUpload
              onFileSelect={handleFileSelect}
              file={file}
              error={error}
            />

            <div className="mt-6">
              <p className="text-sm font-medium mb-3">Types de contrats supportés :</p>
              <div className="flex flex-wrap gap-2">
                {contractTypes.map((type) => (
                  <div
                    key={type.name}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full"
                  >
                    <type.icon size={12} />
                    <span>{type.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <Button
                onClick={handleAnalyze}
                disabled={!file || isAnalyzing}
                className="w-full h-12"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  "Analyser le contrat"
                )}
              </Button>

              {isAnalyzing && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Notre IA examine votre contrat en détail (cela peut prendre 20-40 secondes)
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <p>
              Cet outil est fourni à titre informatif uniquement et ne remplace pas les conseils d'un avocat qualifié.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analyze;
