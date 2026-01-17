import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import RiskScore from "@/components/RiskScore";
import RedFlagCard from "@/components/RedFlagCard";
import StandardClauseCard from "@/components/StandardClauseCard";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, ArrowLeft, Download } from "lucide-react";
import { AnalysisResult } from "@/types/analysis";

const Results = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      navigate("/analyze");
    }
  }, [navigate]);

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
            <Button variant="outline" className="gap-2">
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
    </Layout>
  );
};

export default Results;
