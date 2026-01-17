import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertTriangle, Briefcase, Home, FileText, Lock, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeContract } from "@/services/featherlessApi";
import { createContractAnalysis, updateContractAnalysis, getVerdict, detectContractType, extractContractName } from "@/services/contractService";
import { getOrCreateUserCredits, canUseCredit, incrementCreditsUsed, getRemainingCredits, UserCredits } from "@/services/creditsService";
import { supabase } from "@/integrations/supabase/client";
import UpgradeModal from "@/components/UpgradeModal";
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
  const location = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user credits on mount
  useEffect(() => {
    const fetchCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const credits = await getOrCreateUserCredits(user.id);
        setUserCredits(credits);
      }
    };
    fetchCredits();
  }, []);

  // Handle file from navigation state (from dashboard drag & drop)
  useEffect(() => {
    if (location.state?.file) {
      setFile(location.state.file);
    }
  }, [location.state]);

  // Simulate progress during analysis
  useEffect(() => {
    if (!isAnalyzing) {
      setProgress(0);
      setProgressMessage("");
      return;
    }

    const messages = [
      { progress: 10, message: "📄 Extraction du texte..." },
      { progress: 25, message: "🔍 Lecture du contrat..." },
      { progress: 40, message: "⚖️ Analyse des clauses juridiques..." },
      { progress: 55, message: "🚩 Détection des red flags..." },
      { progress: 70, message: "📊 Calcul du score de risque..." },
      { progress: 85, message: "✨ Finalisation de l'analyse..." },
    ];

    let currentIndex = 0;
    setProgress(messages[0].progress);
    setProgressMessage(messages[0].message);

    const interval = setInterval(() => {
      currentIndex++;
      if (currentIndex < messages.length) {
        setProgress(messages[currentIndex].progress);
        setProgressMessage(messages[currentIndex].message);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    // Check credits before analyzing
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour analyser un contrat",
        variant: "destructive",
      });
      return;
    }

    const hasCredit = await canUseCredit(user.id);
    if (!hasCredit) {
      // Refresh credits state and show upgrade modal
      const credits = await getOrCreateUserCredits(user.id);
      setUserCredits(credits);
      setShowUpgradeModal(true);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Extract text from PDF
      const contractText = await extractTextFromPDF(file);
      
      if (!contractText.trim()) {
        throw new Error("Ce PDF ne contient pas de texte analysable");
      }

      // Detect contract type and extract name
      const contractType = detectContractType(contractText, file.name);
      const contractName = extractContractName(file.name, contractText);

      // Create entry in database
      const contractEntry = await createContractAnalysis(contractName, contractType, contractText);
      
      if (!contractEntry) {
        throw new Error("Erreur lors de la création de l'analyse");
      }

      // Call the API directly
      const result = await analyzeContract(contractText);

      if (!result.success) {
        // Update status to failed
        await updateContractAnalysis(contractEntry.id, { status: 'failed' });
        throw new Error(result.error || "Erreur lors de l'analyse du contrat");
      }

      // Calculate verdict
      const verdict = getVerdict(result.riskScore);

      // Update the database entry with results
      await updateContractAnalysis(contractEntry.id, {
        risk_score: result.riskScore,
        verdict,
        red_flags: result.redFlags || [],
        standard_clauses: result.standardClauses || [],
        resume: result.resume || null,
        status: 'analyzed'
      });

      // Increment credits used after successful analysis
      await incrementCreditsUsed(user.id);
      
      // Refresh credits state
      const updatedCredits = await getOrCreateUserCredits(user.id);
      setUserCredits(updatedCredits);

      // Navigate to results with the contract ID
      navigate(`/results/${contractEntry.id}`);
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
    <DashboardLayout title="Analyser un contrat" subtitle="Uploadez votre contrat PDF pour obtenir une analyse détaillée">
      <div className="max-w-2xl mx-auto">
        {/* Credits indicator */}
        {userCredits && (
          <div className="mb-6 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm">
                Crédits restants : {' '}
                <span className="font-medium">
                  {getRemainingCredits(userCredits) === 'unlimited' 
                    ? 'Illimités' 
                    : getRemainingCredits(userCredits)}
                </span>
              </span>
            </div>
            <span className="text-xs text-muted-foreground capitalize">
              Plan {userCredits.plan}
            </span>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
          <FileUpload
            onFileSelect={handleFileSelect}
            file={file}
            error={error}
          />

          <div className="mt-6">
            <p className="text-xs font-medium mb-3">Types de contrats supportés :</p>
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
              <div className="mt-6 space-y-3">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">{progressMessage}</span>
                  <span className="font-medium text-primary">{progress}%</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  L'analyse peut prendre 20-40 secondes selon la taille du contrat
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
          <p>
            Cet outil est fourni à titre informatif uniquement et ne remplace pas les conseils d'un avocat qualifié.
          </p>
        </div>
      </div>

      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal}
        currentCredits={userCredits}
      />
    </DashboardLayout>
  );
};

export default Analyze;
