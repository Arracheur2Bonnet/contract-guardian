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
    const { contractText, action, question, contractContext } = await req.json();
    
    const FEATHERLESS_API_KEY = Deno.env.get("FEATHERLESS_API_KEY");
    if (!FEATHERLESS_API_KEY) {
      console.error("FEATHERLESS_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Clé API non configurée" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle Q&A action
    if (action === 'ask') {
      console.log("💬 Processing question about contract...");
      
      const chatSystemPrompt = `Tu es un expert juridique qui répond aux questions sur un contrat.
Réponds de manière claire et concise en français.
Si la réponse n'est pas dans le contrat, dis-le clairement.
Sois précis et cite les articles pertinents.`;

      const response = await fetch("https://api.featherless.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${FEATHERLESS_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-72B-Instruct",
          messages: [
            { role: "system", content: chatSystemPrompt },
            { role: "user", content: `Contexte du contrat:\n${contractContext}\n\nQuestion de l'utilisateur: ${question}` }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        console.error("Featherless API error for chat:", response.status);
        return new Response(
          JSON.stringify({ answer: "Désolé, une erreur s'est produite. Veuillez réessayer." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content || "Désolé, une erreur s'est produite.";
      console.log("✅ Chat response generated");
      
      return new Response(
        JSON.stringify({ answer }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default: analyze contract
    if (!contractText || contractText.trim().length === 0) {
      console.error("No contract text provided");
      return new Response(
        JSON.stringify({ success: false, error: "Aucun texte de contrat fourni" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing contract with length:", contractText.length);

    const systemPrompt = `Tu es un expert juridique français spécialisé dans l'analyse de contrats. 

⚠️ IMPORTANT : Tu dois être TRÈS STRICT et EXHAUSTIF dans ta détection des clauses problématiques.
CHAQUE contrat est différent et doit avoir un score différent.

Ta mission : analyser le contrat et détecter les 7 types de clauses problématiques suivants :

1. Clause de non-concurrence abusive (durée >2 ans, zone trop large, pas de compensation)
2. Délais de paiement anormaux (>60 jours B2B ou >30 jours B2C)
3. Propriété intellectuelle déséquilibrée (cession totale sans compensation)
4. Clause résolutoire unilatérale (une seule partie peut rompre, préavis <1 mois)
5. Pénalités disproportionnées (>10% du montant, pas de plafond)
6. Exclusivité sans contrepartie (sans garantie de volume minimum)
7. Clause compromissoire douteuse (arbitrage distant, frais déséquilibrés)

═══════════════════════════════════════════════════════════════
RÈGLES DE CLASSIFICATION DE LA GRAVITÉ (RESPECTE-LES STRICTEMENT)
═══════════════════════════════════════════════════════════════

🔴 GRAVITÉ "élevée" = Clause qui expose à un risque financier >10 000€ OU qui viole clairement la loi :
  → Non-concurrence >3 ans ET sans compensation financière
  → Pénalités >20% du montant total OU sans plafonnement
  → Délais de paiement >120 jours OU conditionné aux fonds du client final
  → Cession PI totale + renonciation explicite aux droits moraux
  → Clause compromissoire à l'étranger avec frais 100% à charge d'une partie
  → Préavis >6 mois de différence entre les parties
  → Résiliation unilatérale sans préavis ni motif

🟠 GRAVITÉ "modérée" = Clause déséquilibrée mais pas catastrophique :
  → Non-concurrence 2-3 ans avec compensation insuffisante (<50% salaire)
  → Pénalités 10-20% du montant
  → Délais de paiement 60-120 jours
  → Préavis déséquilibré (3-6 mois de différence)
  → Cession PI sans rémunération additionnelle mais droits moraux préservés
  → Exclusivité sans garantie de volume mais durée <2 ans

🟡 GRAVITÉ "faible" = Point d'attention mineur :
  → Clause ambiguë mais pas manifestement dangereuse
  → Manque de précision sur modalités
  → Durée de confidentialité >10 ans
  → Frais non remboursés (déplacement, téléphone)

═══════════════════════════════════════════════════════════════
EXEMPLES CONCRETS DE SCORING (SUIS CE MODÈLE)
═══════════════════════════════════════════════════════════════

📌 CONTRAT TRÈS GRAVE (score attendu : 90-100) :
- Non-concurrence 5 ans France entière sans compensation → élevée (25 pts)
- Pénalités 500€/jour sans plafond → élevée (25 pts)
- Délai paiement 180 jours "à réception fonds client" → élevée (25 pts)
- Arbitrage Singapour, frais 100% à charge prestataire → élevée (25 pts)
TOTAL : 100 points

📌 CONTRAT GRAVE (score attendu : 70-85) :
- Non-concurrence 3 ans zone large → modérée (15 pts)
- Pénalités 15% du montant → modérée (15 pts)
- Préavis 6 mois vs 1 semaine → élevée (25 pts)
- Délai paiement 90 jours → modérée (15 pts)
- Cession PI sans compensation → modérée (15 pts)
TOTAL : 85 points

📌 CONTRAT MODÉRÉ (score attendu : 40-60) :
- Non-concurrence 2 ans avec compensation 30% → modérée (15 pts)
- Préavis 3 mois vs 1 mois → modérée (15 pts)
- Confidentialité 15 ans → faible (5 pts)
TOTAL : 35 points

⚠️ CONSIGNE CRITIQUE : 
- Un contrat avec 10+ clauses abusives DOIT avoir un MIX de gravités (pas tout en "élevée")
- Sois NUANCÉ dans ton évaluation
- CHAQUE contrat est unique et doit avoir un score DIFFÉRENT
- Compare chaque clause aux seuils précis ci-dessus

═══════════════════════════════════════════════════════════════

Pour CHAQUE problème détecté, tu DOIS fournir :
- type : le type de red flag (parmi les 7 ci-dessus)
- titre : nom court et précis du problème (ex: "Non-concurrence de 5 ans")
- description : explication claire en 2-3 phrases du POURQUOI c'est problématique
- citation : extrait EXACT du contrat (30-60 mots, copie-colle le texte entre guillemets)
- gravite : "faible" | "modérée" | "élevée" (RESPECTE les règles ci-dessus)
- article : numéro de l'article concerné si identifiable (ex: "Article 5.1")

Détecte aussi les clauses POSITIVES (protection salarié, assurance, formation) si elles existent.

Réponds UNIQUEMENT en JSON valide avec cette structure EXACTE :
{
  "redFlags": [
    {
      "type": "Clause de non-concurrence abusive",
      "titre": "Non-concurrence de 5 ans sans compensation",
      "description": "La clause impose une interdiction de travailler pendant 5 ans après la fin du contrat, sans aucune compensation financière. La durée légale maximale est de 2 ans.",
      "citation": "s'interdit formellement de travailler pour toute autre société pendant une période de 5 ans suivant la fin du contrat",
      "gravite": "élevée",
      "article": "Article 3.2"
    }
  ],
  "standardClauses": [
    {
      "titre": "Clause de confidentialité standard",
      "description": "Engagement de confidentialité sur les informations de l'entreprise"
    }
  ],
  "resume": "Ce contrat présente plusieurs clauses très problématiques qui exposent le prestataire à des risques financiers et juridiques majeurs."
}`;

    console.log("Calling Featherless API with Qwen/Qwen2.5-72B-Instruct model...");

    const response = await fetch("https://api.featherless.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FEATHERLESS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-72B-Instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyse ce contrat en détail et détecte tous les red flags :\n\n${contractText}` }
        ],
        temperature: 0.1,
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

    // Debug logs
    console.log("=== DEBUG ANALYSE ===");
    console.log("Nombre de red flags:", analysis.redFlags.length);
    console.log("Détail des gravités:", analysis.redFlags.map(f => ({
      titre: f.titre,
      gravite: f.gravite
    })));
    console.log("====================");

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
