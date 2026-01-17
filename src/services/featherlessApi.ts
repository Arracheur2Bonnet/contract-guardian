import { supabase } from "@/integrations/supabase/client";

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
  success: boolean;
  riskScore?: number;
  redFlags?: RedFlag[];
  standardClauses?: StandardClause[];
  resume?: string;
  error?: string;
}

/**
 * Analyse un contrat via l'edge function sécurisée
 * @param contractText - Le texte du contrat
 * @returns { success, riskScore, redFlags, standardClauses, resume }
 */
export async function analyzeContract(contractText: string): Promise<AnalysisResult> {
  console.log('🔍 Appel de l\'edge function analyze-contract...');
  
  try {
    const { data, error } = await supabase.functions.invoke('analyze-contract', {
      body: { contractText }
    });

    if (error) {
      console.error('❌ Erreur edge function:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('✅ Analyse reçue:', data);
    return data as AnalysisResult;
    
  } catch (error) {
    console.error('❌ Erreur appel edge function:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Pose une question sur le contrat via l'edge function
 * @param question - La question de l'utilisateur
 * @param contractContext - Le contexte du contrat
 * @returns La réponse
 */
export async function askQuestion(question: string, contractContext: string): Promise<string> {
  console.log('💬 Appel de l\'edge function pour question...');
  
  try {
    const { data, error } = await supabase.functions.invoke('analyze-contract', {
      body: { 
        action: 'ask',
        question, 
        contractContext 
      }
    });

    if (error) {
      console.error('❌ Erreur edge function:', error);
      return "Désolé, une erreur s'est produite. Veuillez réessayer.";
    }

    return data?.answer || "Désolé, une erreur s'est produite. Veuillez réessayer.";
    
  } catch (error) {
    console.error('❌ Erreur appel edge function:', error);
    return "Désolé, une erreur s'est produite. Veuillez réessayer.";
  }
}

/**
 * Obtient des conseils de négociation basés sur le contrat et les red flags
 * @param contractContext - Le contexte du contrat
 * @param redFlags - Les problèmes détectés
 * @returns Les conseils de négociation
 */
export async function getNegotiationAdvice(contractContext: string, redFlags: any[]): Promise<string> {
  console.log('🤝 Appel de l\'edge function pour négociation...');
  
  try {
    const { data, error } = await supabase.functions.invoke('analyze-contract', {
      body: { 
        action: 'negotiate',
        contractContext,
        redFlags
      }
    });

    if (error) {
      console.error('❌ Erreur edge function:', error);
      return "Désolé, une erreur s'est produite lors de l'analyse de négociation.";
    }

    return data?.advice || "Désolé, une erreur s'est produite. Veuillez réessayer.";
    
  } catch (error) {
    console.error('❌ Erreur appel edge function:', error);
    return "Désolé, une erreur s'est produite. Veuillez réessayer.";
  }
}

/**
 * Obtient une expertise juridique détaillée du contrat
 * @param contractContext - Le contexte du contrat
 * @param redFlags - Les problèmes détectés
 * @returns L'expertise juridique
 */
export async function getLegalExpertise(contractContext: string, redFlags: any[]): Promise<string> {
  console.log('⚖️ Appel de l\'edge function pour expertise juridique...');
  
  try {
    const { data, error } = await supabase.functions.invoke('analyze-contract', {
      body: { 
        action: 'legal',
        contractContext,
        redFlags
      }
    });

    if (error) {
      console.error('❌ Erreur edge function:', error);
      return "Désolé, une erreur s'est produite lors de l'expertise juridique.";
    }

    return data?.expertise || "Désolé, une erreur s'est produite. Veuillez réessayer.";
    
  } catch (error) {
    console.error('❌ Erreur appel edge function:', error);
    return "Désolé, une erreur s'est produite. Veuillez réessayer.";
  }
}
