import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RedFlag {
  type: string;
  titre: string;
  description: string;
  citation: string;
  gravite: "faible" | "modérée" | "élevée";
  article: string;
}

interface StandardClause {
  titre: string;
  description: string;
}

interface AnalysisResult {
  redFlags: RedFlag[];
  standardClauses: StandardClause[];
  resume: string;
}

function calculateRiskScore(analysis: AnalysisResult): number {
  let score = 0;
  
  analysis.redFlags.forEach(flag => {
    if (flag.gravite === "élevée") score += 25;
    else if (flag.gravite === "modérée") score += 15;
    else score += 5;
  });
  
  return Math.min(score, 100);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contractText } = await req.json();
    
    if (!contractText || contractText.trim().length === 0) {
      console.error("No contract text provided");
      return new Response(
        JSON.stringify({ success: false, error: "Aucun texte de contrat fourni" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing contract with length:", contractText.length);

    const FEATHERLESS_API_KEY = Deno.env.get("FEATHERLESS_API_KEY");
    if (!FEATHERLESS_API_KEY) {
      console.error("FEATHERLESS_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Clé API non configurée" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Tu es un expert juridique français spécialisé dans l'analyse de contrats. 
        
Ta mission : analyser le contrat et détecter les 7 types de clauses problématiques suivants :

1. Clause de non-concurrence abusive (durée >2 ans, zone trop large, pas de compensation)
2. Délais de paiement anormaux (>60 jours B2B ou >30 jours B2C)
3. Propriété intellectuelle déséquilibrée (cession totale sans compensation)
4. Clause résolutoire unilatérale (une seule partie peut rompre, préavis <1 mois)
5. Pénalités disproportionnées (>10% du montant, pas de plafond)
6. Exclusivité sans contrepartie (sans garantie de volume minimum)
7. Clause compromissoire douteuse (arbitrage distant, frais déséquilibrés)

Pour CHAQUE problème détecté, tu DOIS fournir :
- type : le type de red flag (parmi les 7 ci-dessus)
- titre : nom court du problème
- description : explication claire du problème (2-3 phrases)
- citation : extrait EXACT du contrat montrant le problème (30-50 mots)
- gravite : "faible" | "modérée" | "élevée"
- article : numéro de l'article concerné si identifiable

Détecte aussi les clauses POSITIVES (protection du salarié, assurance, formation, etc.)

Réponds UNIQUEMENT en JSON valide avec cette structure :
{
  "redFlags": [
    {
      "type": "string",
      "titre": "string",
      "description": "string",
      "citation": "string",
      "gravite": "faible|modérée|élevée",
      "article": "string"
    }
  ],
  "standardClauses": [
    {
      "titre": "string",
      "description": "string"
    }
  ],
  "resume": "string (résumé global du contrat en 2-3 lignes)"
}`;

    console.log("Calling Featherless API with Kimi-K2-Instruct model...");

    const response = await fetch("https://api.featherless.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FEATHERLESS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "moonshotai/Kimi-K2-Instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyse ce contrat en détail et détecte tous les red flags :\n\n${contractText}` }
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Featherless API error:", response.status, errorText);
      
      if (response.status === 503) {
        return new Response(
          JSON.stringify({ success: false, error: "Service temporairement indisponible, veuillez réessayer" }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: "Erreur lors de l'analyse du contrat" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Featherless API response received");

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error("No content in API response");
      return new Response(
        JSON.stringify({ success: false, error: "Réponse invalide de l'IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON from response, handling potential markdown code blocks
    let analysis: AnalysisResult;
    try {
      let jsonContent = content.trim();
      // Remove markdown code blocks if present
      if (jsonContent.startsWith("```json")) {
        jsonContent = jsonContent.slice(7);
      } else if (jsonContent.startsWith("```")) {
        jsonContent = jsonContent.slice(3);
      }
      if (jsonContent.endsWith("```")) {
        jsonContent = jsonContent.slice(0, -3);
      }
      jsonContent = jsonContent.trim();
      
      analysis = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, "Content:", content);
      return new Response(
        JSON.stringify({ success: false, error: "Erreur lors de l'interprétation de l'analyse" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const riskScore = calculateRiskScore(analysis);
    console.log("Analysis complete. Risk score:", riskScore, "Red flags:", analysis.redFlags.length);

    return new Response(
      JSON.stringify({
        success: true,
        riskScore,
        redFlags: analysis.redFlags,
        standardClauses: analysis.standardClauses,
        resume: analysis.resume,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-contract function:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erreur lors de l'analyse du contrat" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
