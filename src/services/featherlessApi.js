const API_URL = 'https://api.featherless.ai/v1/chat/completions';
const API_KEY = 'rc_dead7c4f14100aa214d67505ea13768a860ade546fc163628ef17cdeb97b9736'; 

const MODELS = {
  analysis: 'Qwen/Qwen2.5-72B-Instruct',  // Pour analyse contrats
  chat: 'Qwen/Qwen2.5-7B-Instruct'        // Pour chat Q&A
};

/**
 * Analyse un contrat et retourne score + red flags
 * @param {string} contractText - Le texte du contrat
 * @returns {Promise<Object>} - { success, riskScore, redFlags, standardClauses, resume }
 */
export async function analyzeContract(contractText) {
  const systemPrompt = `Tu es un expert juridique français spécialisé dans l'analyse de contrats. 

⚠️ IMPORTANT : Tu dois être TRÈS STRICT et EXHAUSTIF dans ta détection des clauses problématiques.

Ta mission : analyser le contrat et détecter les 7 types de clauses problématiques suivants :

1. Clause de non-concurrence abusive (durée >2 ans, zone trop large, pas de compensation)
2. Délais de paiement anormaux (>60 jours B2B ou >30 jours B2C)
3. Propriété intellectuelle déséquilibrée (cession totale sans compensation)
4. Clause résolutoire unilatérale (une seule partie peut rompre, préavis <1 mois)
5. Pénalités disproportionnées (>10% du montant, pas de plafond)
6. Exclusivité sans contrepartie (sans garantie de volume minimum)
7. Clause compromissoire douteuse (arbitrage distant, frais déséquilibrés)

RÈGLES DE CLASSIFICATION DE LA GRAVITÉ :

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

  try {
    console.log('🔍 Début analyse contrat...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELS.analysis,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyse ce contrat en détail et détecte tous les red flags :\n\n${contractText}` }
        ],
        temperature: 0.1,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API Featherless:', response.status, errorText);
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Réponse API reçue');
    
    const content = data.choices[0].message.content;
    
    // Parse JSON (enlever markdown si présent)
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.slice(7);
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith('```')) {
      jsonContent = jsonContent.slice(0, -3);
    }
    
    const analysis = JSON.parse(jsonContent.trim());
    
    // Calculer le score de risque
    let score = 0;
    analysis.redFlags.forEach(flag => {
      if (flag.gravite === 'élevée') score += 25;
      else if (flag.gravite === 'modérée') score += 15;
      else score += 5;
    });
    
    const finalScore = Math.min(score, 100);
    
    console.log(`📊 Analyse terminée: ${analysis.redFlags.length} red flags, score ${finalScore}`);
    
    return {
      success: true,
      riskScore: finalScore,
      redFlags: analysis.redFlags,
      standardClauses: analysis.standardClauses || [],
      resume: analysis.resume
    };
    
  } catch (error) {
    console.error('❌ Erreur analyse:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Pose une question sur le contrat
 * @param {string} question - La question de l'utilisateur
 * @param {string} contractContext - Le contexte du contrat
 * @returns {Promise<string>} - La réponse
 */
export async function askQuestion(question, contractContext) {
  const systemPrompt = `Tu es un expert juridique qui répond aux questions sur un contrat.
Réponds de manière claire et concise en français.
Si la réponse n'est pas dans le contrat, dis-le clairement.
Sois précis et cite les articles pertinents.`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELS.chat,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Contexte du contrat:\n${contractContext}\n\nQuestion de l'utilisateur: ${question}` }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error('Erreur chat:', error);
    return "Désolé, une erreur s'est produite. Veuillez réessayer.";
  }
}
