import { supabase } from "@/integrations/supabase/client";

export interface UserCredits {
  id: string;
  user_id: string;
  plan: 'free' | 'standard' | 'premium';
  credits_used: number;
  credits_limit: number;
  created_at: string;
  updated_at: string;
}

export const PLANS = {
  free: {
    name: 'Gratuit',
    price: 0,
    credits: 3,
    features: [
      '3 analyses de contrats',
      'Détection des clauses à risque',
      'Score de risque',
      'Résumé du contrat'
    ]
  },
  standard: {
    name: 'Standard',
    price: 11.99,
    credits: 50,
    features: [
      '50 analyses par mois',
      'Tout le plan Gratuit',
      'Assistant IA illimité',
      'Export PDF des analyses',
      'Support prioritaire'
    ]
  },
  premium: {
    name: 'Premium',
    price: 29.99,
    credits: -1, // unlimited
    features: [
      'Analyses illimitées',
      'Tout le plan Standard',
      'Conseils de négociation',
      'Expertise juridique détaillée',
      'Support dédié 24/7'
    ]
  }
};

export async function getUserCredits(userId: string): Promise<UserCredits | null> {
  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user credits:', error);
    return null;
  }

  return data as UserCredits | null;
}

export async function createUserCredits(userId: string): Promise<UserCredits | null> {
  const { data, error } = await supabase
    .from('user_credits')
    .insert({
      user_id: userId,
      plan: 'free',
      credits_used: 0,
      credits_limit: 3
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating user credits:', error);
    return null;
  }

  return data as UserCredits;
}

export async function getOrCreateUserCredits(userId: string): Promise<UserCredits | null> {
  let credits = await getUserCredits(userId);
  
  if (!credits) {
    credits = await createUserCredits(userId);
  }
  
  return credits;
}

export async function incrementCreditsUsed(userId: string): Promise<boolean> {
  const credits = await getUserCredits(userId);
  
  if (!credits) {
    return false;
  }

  const { error } = await supabase
    .from('user_credits')
    .update({ credits_used: credits.credits_used + 1 })
    .eq('user_id', userId);

  if (error) {
    console.error('Error incrementing credits:', error);
    return false;
  }

  return true;
}

export async function canUseCredit(userId: string): Promise<boolean> {
  const credits = await getUserCredits(userId);
  
  if (!credits) {
    return false;
  }

  // Premium plan has unlimited credits
  if (credits.plan === 'premium') {
    return true;
  }

  return credits.credits_used < credits.credits_limit;
}

export async function upgradePlan(userId: string, newPlan: 'free' | 'standard' | 'premium'): Promise<boolean> {
  const newLimit = newPlan === 'free' ? 3 : newPlan === 'standard' ? 50 : -1;
  
  const { error } = await supabase
    .from('user_credits')
    .update({ 
      plan: newPlan,
      credits_limit: newLimit,
      credits_used: 0 // Reset credits on upgrade
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error upgrading plan:', error);
    return false;
  }

  return true;
}

export function getRemainingCredits(credits: UserCredits): number | 'unlimited' {
  if (credits.plan === 'premium') {
    return 'unlimited';
  }
  return Math.max(0, credits.credits_limit - credits.credits_used);
}
