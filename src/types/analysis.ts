export interface RedFlag {
  type: string;
  titre: string;
  description: string;
  citation: string;
  gravite: "faible" | "modérée" | "élevée";
  article?: string;
}

export interface StandardClause {
  titre: string;
  description: string;
}

export interface AnalysisResult {
  success: boolean;
  riskScore: number;
  redFlags: RedFlag[];
  standardClauses: StandardClause[];
  resume?: string;
  error?: string;
}
