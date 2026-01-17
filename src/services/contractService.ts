import { supabase } from "@/integrations/supabase/client";

export interface ContractAnalysis {
  id: string;
  name: string;
  contract_type: string;
  contract_text: string;
  risk_score: number;
  verdict: string;
  red_flags: any[];
  standard_clauses: any[];
  resume: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function getVerdict(score: number): string {
  if (score <= 35) return "SIGNER";
  if (score <= 65) return "NÉGOCIER";
  return "REFUSER";
}

export function detectContractType(text: string, fileName: string): string {
  const lowerText = text.toLowerCase();
  const lowerName = fileName.toLowerCase();

  if (lowerName.includes("bail") || lowerText.includes("bail") || lowerText.includes("loyer") || lowerText.includes("locataire")) {
    return "Bail";
  }
  if (lowerName.includes("cdi") || lowerText.includes("contrat de travail") || lowerText.includes("salarié")) {
    return "CDI";
  }
  if (lowerName.includes("cdd") || lowerText.includes("contrat à durée déterminée")) {
    return "CDD";
  }
  if (lowerName.includes("freelance") || lowerText.includes("prestation") || lowerText.includes("freelance") || lowerText.includes("indépendant")) {
    return "Freelance";
  }
  if (lowerName.includes("nda") || lowerText.includes("confidentialité") || lowerText.includes("non-divulgation")) {
    return "NDA";
  }
  if (lowerText.includes("cgv") || lowerText.includes("conditions générales de vente") || lowerText.includes("achat")) {
    return "Vente";
  }
  if (lowerText.includes("associé") || lowerText.includes("pacte d'actionnaires")) {
    return "Associés";
  }
  
  return "Contrat";
}

export function extractContractName(fileName: string, text: string): string {
  // Remove file extension
  let name = fileName.replace(/\.pdf$/i, "").replace(/[_-]/g, " ");
  
  // Capitalize first letter of each word
  name = name.split(" ").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(" ");
  
  // If the name is too generic or short, try to extract from content
  if (name.length < 5 || name.toLowerCase() === "contrat" || name.toLowerCase() === "document") {
    const type = detectContractType(text, fileName);
    const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    name = `${type} - ${date}`;
  }
  
  return name;
}

export async function createContractAnalysis(
  name: string,
  contractType: string,
  contractText: string
): Promise<ContractAnalysis | null> {
  const { data, error } = await supabase
    .from('contract_analyses')
    .insert({
      name,
      contract_type: contractType,
      contract_text: contractText,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating contract analysis:", error);
    return null;
  }

  return data as ContractAnalysis;
}

export async function updateContractAnalysis(
  id: string,
  updates: {
    risk_score?: number;
    verdict?: string;
    red_flags?: any[];
    standard_clauses?: any[];
    resume?: string;
    status?: string;
  }
): Promise<ContractAnalysis | null> {
  const { data, error } = await supabase
    .from('contract_analyses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating contract analysis:", error);
    return null;
  }

  return data as ContractAnalysis;
}

export async function getContractAnalysis(id: string): Promise<ContractAnalysis | null> {
  const { data, error } = await supabase
    .from('contract_analyses')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching contract analysis:", error);
    return null;
  }

  return data as ContractAnalysis;
}

export async function getRecentContracts(limit: number = 5): Promise<ContractAnalysis[]> {
  const { data, error } = await supabase
    .from('contract_analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent contracts:", error);
    return [];
  }

  return (data || []) as ContractAnalysis[];
}

export async function getAllContracts(): Promise<ContractAnalysis[]> {
  const { data, error } = await supabase
    .from('contract_analyses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching all contracts:", error);
    return [];
  }

  return (data || []) as ContractAnalysis[];
}

export function groupContractsByDate(contracts: ContractAnalysis[]): { label: string; items: ContractAnalysis[] }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const groups: { label: string; items: ContractAnalysis[] }[] = [
    { label: "Aujourd'hui", items: [] },
    { label: "Hier", items: [] },
    { label: "Cette semaine", items: [] },
    { label: "Ce mois", items: [] },
    { label: "Plus ancien", items: [] },
  ];

  contracts.forEach(contract => {
    const date = new Date(contract.created_at);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      groups[0].items.push(contract);
    } else if (date.getTime() === yesterday.getTime()) {
      groups[1].items.push(contract);
    } else if (date >= weekAgo) {
      groups[2].items.push(contract);
    } else if (date >= monthAgo) {
      groups[3].items.push(contract);
    } else {
      groups[4].items.push(contract);
    }
  });

  // Filter out empty groups
  return groups.filter(group => group.items.length > 0);
}

export function formatContractDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const contractDate = new Date(date);
  contractDate.setHours(0, 0, 0, 0);
  
  if (contractDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (contractDate.getTime() === yesterday.getTime()) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
