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
  if (!analysis.redFlags || analysis.redFlags.length === 0) {
    return 0;
  }

  let score = 0;
  let highCount = 0;
  let moderateCount = 0;
  let lowCount = 0;
  
  // Count flags by severity
  analysis.redFlags.forEach(flag => {
    if (flag.gravite === "élevée") highCount++;
    else if (flag.gravite === "modérée") moderateCount++;
    else lowCount++;
  });

  // Base scoring with diminishing returns to avoid extreme scores
  // First flags of each type count more, subsequent ones less
  score += Math.min(highCount, 2) * 12 + Math.max(0, highCount - 2) * 6;
  score += Math.min(moderateCount, 3) * 6 + Math.max(0, moderateCount - 3) * 3;
  score += Math.min(lowCount, 4) * 2 + Math.max(0, lowCount - 4) * 1;

  // Apply a curve to distribute scores more evenly
  // This prevents clustering at extremes
  if (score > 0) {
    // Logarithmic scaling for more balanced distribution
    score = Math.round(20 + (score / (score + 15)) * 65);
  }

  // Ensure score is within bounds
  return Math.min(Math.max(score, 0), 100);
}

async function callLovableAI(messages: { role: string; content: string }[], maxTokens: number = 4000) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      temperature: 0.1,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Lovable AI error:", response.status, errorText);
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (response.status === 402) {
      throw new Error("Payment required. Please add credits to your workspace.");
    }
    
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contractText, action, question, contractContext, redFlags } = await req.json();

    // Handle Q&A action
    if (action === 'ask') {
      console.log("💬 Processing question about contract...");
      
      const chatSystemPrompt = `Tu es un expert juridique qui répond aux questions sur un contrat.
Réponds de manière claire et concise en français.
Si la réponse n'est pas dans le contrat, dis-le clairement.
Sois précis et cite les articles pertinents.`;

      try {
        const answer = await callLovableAI([
          { role: "system", content: chatSystemPrompt },
          { role: "user", content: `Contexte du contrat:\n${contractContext}\n\nQuestion de l'utilisateur: ${question}` }
        ], 1000);

        console.log("✅ Chat response generated");
        return new Response(
          JSON.stringify({ answer: answer || "Désolé, une erreur s'est produite." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error in chat:", error);
        return new Response(
          JSON.stringify({ answer: "Désolé, une erreur s'est produite. Veuillez réessayer." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Handle negotiation advice action
    if (action === 'negotiate') {
      console.log("🤝 Processing negotiation advice...");
      
      const redFlagsContext = redFlags && redFlags.length > 0 
        ? redFlags.map((rf: any) => `• ${rf.titre} (Gravité: ${rf.gravite})\n  ${rf.description}${rf.citation ? `\n  Citation: "${rf.citation}"` : ''}`).join('\n\n')
        : 'Aucun problème spécifique détecté.';

      const negotiateSystemPrompt = `Tu es un expert en négociation de contrats avec 20 ans d'expérience. Tu aides les particuliers et professionnels à renégocier leurs contrats de manière efficace.

Ton rôle est de fournir des conseils CONCRETS et ACTIONNABLES pour négocier les clauses problématiques.

Structure ta réponse ainsi :

## 📋 Résumé de la situation
[Analyse rapide du rapport de force et de la marge de négociation]

## 🎯 Clauses à négocier en priorité

Pour chaque clause problématique :
### [Nom de la clause]
- **Ce qui pose problème** : [Explication simple]
- **Ce qu'il faut demander** : [Formulation précise de la demande]
- **Argument à utiliser** : [Argument persuasif basé sur le marché/la loi/la pratique]

## ✉️ Modèle de message pour négocier

[Propose un email/message type professionnel et diplomatique pour entamer la négociation]

## 💡 Si la négociation échoue

[Alternatives : refuser, demander des compensations, consulter un avocat, etc.]

Sois diplomate mais ferme. Utilise un ton professionnel.`;

      try {
        const advice = await callLovableAI([
          { role: "system", content: negotiateSystemPrompt },
          { role: "user", content: `Voici le contrat à analyser :\n\n${contractContext || contractText}\n\n--- PROBLÈMES DÉTECTÉS ---\n\n${redFlagsContext}\n\nDonne-moi des conseils concrets pour négocier ces clauses problématiques.` }
        ], 2500);

        console.log("✅ Negotiation advice generated");
        return new Response(
          JSON.stringify({ advice: advice || "Désolé, une erreur s'est produite." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error in negotiation:", error);
        return new Response(
          JSON.stringify({ advice: "Désolé, une erreur s'est produite. Veuillez réessayer." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Handle legal expertise action
    if (action === 'legal') {
      console.log("⚖️ Processing legal expertise...");
      
      const redFlagsContext = redFlags && redFlags.length > 0 
        ? redFlags.map((rf: any) => `• ${rf.titre} (Gravité: ${rf.gravite})\n  ${rf.description}${rf.article ? ` - ${rf.article}` : ''}`).join('\n\n')
        : 'Aucun problème spécifique détecté.';

      const legalSystemPrompt = `Tu es un avocat spécialisé en droit des contrats français avec 15 ans d'expérience au barreau de Paris. Tu fournis une expertise juridique rigoureuse et accessible.

Structure ta réponse ainsi :

## ⚖️ Analyse juridique

Pour chaque clause problématique :
### [Nom de la clause]
- **Base légale** : [Articles du Code civil, Code du travail, jurisprudence applicable]
- **Analyse** : [Conformité ou non-conformité avec le droit français]
- **Risques** : [Conséquences juridiques et financières potentielles]

## 🚨 Clauses potentiellement nulles

[Liste des clauses qui pourraient être déclarées nulles par un tribunal, avec explication]

## 🛡️ Vos droits

[Ce que la loi vous garantit malgré les clauses du contrat - droits impératifs, ordre public]

## 📊 Risques financiers estimés

[Estimation des risques financiers en cas de litige ou d'application des clauses abusives]

## ✅ Recommandation finale

[ ] Contrat acceptable en l'état
[ ] Modifications mineures recommandées
[ ] Modifications majeures nécessaires - négociation indispensable
[ ] Refus recommandé - risques trop importants
[ ] Consultation d'un avocat fortement conseillée

[Justification de la recommandation]

Sois précis dans tes références légales (articles de loi, jurisprudence). Reste accessible pour un non-juriste.`;

      try {
        const expertise = await callLovableAI([
          { role: "system", content: legalSystemPrompt },
          { role: "user", content: `Voici le contrat à analyser juridiquement :\n\n${contractContext || contractText}\n\n--- PROBLÈMES DÉTECTÉS ---\n\n${redFlagsContext}\n\nFournis-moi une expertise juridique complète de ce contrat.` }
        ], 3000);

        console.log("✅ Legal expertise generated");
        return new Response(
          JSON.stringify({ expertise: expertise || "Désolé, une erreur s'est produite." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error in legal expertise:", error);
        return new Response(
          JSON.stringify({ expertise: "Désolé, une erreur s'est produite. Veuillez réessayer." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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

⚠️ IMPORTANT : Tu dois être ÉQUILIBRÉ dans ta détection des clauses problématiques.
Ne sois ni trop alarmiste ni trop laxiste. Détecte les vrais problèmes.

Ta mission : analyser le contrat et détecter les types de clauses problématiques suivants :

1. Clause de non-concurrence abusive (durée >2 ans, zone trop large, pas de compensation)
2. Délais de paiement anormaux (>60 jours B2B ou >30 jours B2C)
3. Propriété intellectuelle déséquilibrée (cession totale sans compensation)
4. Clause résolutoire unilatérale (une seule partie peut rompre, préavis <1 mois)
5. Pénalités disproportionnées (>10% du montant, pas de plafond)
6. Exclusivité sans contrepartie (sans garantie de volume minimum)
7. Clause compromissoire douteuse (arbitrage distant, frais déséquilibrés)

═══════════════════════════════════════════════════════════════
RÈGLES DE CLASSIFICATION DE LA GRAVITÉ
═══════════════════════════════════════════════════════════════

🔴 GRAVITÉ "élevée" = Clause qui expose à un risque financier important OU qui viole la loi :
  → Non-concurrence >3 ans ET sans compensation
  → Pénalités >20% sans plafond
  → Délais de paiement >120 jours
  → Cession PI totale + renonciation aux droits moraux
  → Résiliation unilatérale sans préavis

🟠 GRAVITÉ "modérée" = Clause déséquilibrée mais gérable :
  → Non-concurrence 2-3 ans avec compensation insuffisante
  → Pénalités 10-20% du montant
  → Délais de paiement 60-120 jours
  → Préavis déséquilibré

🟡 GRAVITÉ "faible" = Point d'attention mineur :
  → Clause ambiguë
  → Manque de précision
  → Durée de confidentialité >10 ans

═══════════════════════════════════════════════════════════════

Pour CHAQUE problème détecté, tu DOIS fournir :
- type : le type de red flag
- titre : nom court et précis du problème
- description : explication claire en 2-3 phrases
- citation : extrait EXACT du contrat (30-60 mots)
- gravite : "faible" | "modérée" | "élevée"
- article : numéro de l'article concerné si identifiable

Détecte aussi les clauses POSITIVES si elles existent.

Réponds UNIQUEMENT en JSON valide avec cette structure :
{
  "redFlags": [...],
  "standardClauses": [...],
  "resume": "Résumé de l'analyse en 2-3 phrases."
}`;

    console.log("Calling Lovable AI...");

    try {
      const content = await callLovableAI([
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyse ce contrat et détecte les red flags :\n\n${contractText}` }
      ], 4000);

      if (!content) {
        console.error("No content in API response");
        return new Response(
          JSON.stringify({ success: false, error: "Réponse invalide de l'IA" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Parse JSON from response
      let analysis: AnalysisResult;
      try {
        let jsonContent = content.trim();
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
        console.error("Failed to parse JSON response:", parseError);
        
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            analysis = JSON.parse(jsonMatch[0]);
          } catch {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: "Erreur lors de l'analyse du contrat. Veuillez réessayer." 
              }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Erreur lors de l'analyse du contrat. Veuillez réessayer." 
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      const riskScore = calculateRiskScore(analysis);
      console.log("Analysis complete. Risk score:", riskScore, "Red flags:", analysis.redFlags?.length || 0);

      return new Response(
        JSON.stringify({
          success: true,
          riskScore,
          redFlags: analysis.redFlags || [],
          standardClauses: analysis.standardClauses || [],
          resume: analysis.resume || "Analyse terminée.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error calling AI:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error instanceof Error ? error.message : "Erreur lors de l'analyse" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in analyze-contract function:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erreur lors de l'analyse du contrat" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
