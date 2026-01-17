import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Briefcase, Home, FileText, Lock, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeContract } from "@/services/featherlessApi";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const contractTypes = [
  { icon: Briefcase, name: "Freelance" },
  { icon: FileText, name: "CDI/CDD" },
  { icon: Home, name: "Bail" },
  { icon: Lock, name: "NDA" },
  { icon: ShoppingCart, name: "Vente" },
];

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = "";
  const numPages = Math.min(pdf.numPages, 50); // Limit to 50 pages
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n\n";
  }
  
  return fullText;
}

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
      // Extract text from PDF
      const contractText = await extractTextFromPDF(file);
      
      if (!contractText.trim()) {
        throw new Error("Ce PDF ne contient pas de texte analysable");
      }

      // Call the API directly
      const result = await analyzeContract(contractText);

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de l'analyse du contrat");
      }

      // Store results in sessionStorage
      sessionStorage.setItem("analysisResult", JSON.stringify(result));
      navigate("/results");
    } catch (err: any) {
      console.error("Analysis error:", err);
      const errorMessage = err.message || "Une erreur est survenue lors de l'analyse. Veuillez réessayer.";
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
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
