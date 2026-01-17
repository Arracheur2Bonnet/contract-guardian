import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Crown, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { PLANS, getOrCreateUserCredits, upgradePlan, UserCredits } from "@/services/creditsService";
import { toast } from "sonner";

const Pricing = () => {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const credits = await getOrCreateUserCredits(user.id);
        if (credits) {
          setCurrentPlan(credits.plan);
        }
      }
      setLoading(false);
    };

    fetchCredits();
  }, []);

  const handleUpgrade = async (plan: 'free' | 'standard' | 'premium') => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Vous devez être connecté pour changer de plan");
      navigate('/auth');
      return;
    }

    setUpgrading(plan);
    
    // Simulate payment process for demo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const success = await upgradePlan(user.id, plan);
    
    if (success) {
      setCurrentPlan(plan);
      toast.success(`Vous êtes maintenant sur le plan ${PLANS[plan].name} !`);
    } else {
      toast.error("Erreur lors du changement de plan");
    }
    
    setUpgrading(null);
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free':
        return <Zap className="h-6 w-6" />;
      case 'standard':
        return <Star className="h-6 w-6" />;
      case 'premium':
        return <Crown className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  const plans = [
    { key: 'free' as const, popular: false },
    { key: 'standard' as const, popular: true },
    { key: 'premium' as const, popular: false }
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choisissez votre plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Analysez vos contrats en toute confiance avec nos différentes offres adaptées à vos besoins.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map(({ key, popular }) => {
            const plan = PLANS[key];
            const isCurrentPlan = currentPlan === key;
            const isUpgrade = 
              (currentPlan === 'free' && (key === 'standard' || key === 'premium')) ||
              (currentPlan === 'standard' && key === 'premium');

            return (
              <Card 
                key={key} 
                className={`relative flex flex-col ${popular ? 'border-primary shadow-lg scale-105' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
              >
                {popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Plus populaire
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge variant="secondary" className="absolute -top-3 right-4">
                    Plan actuel
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto p-3 rounded-full mb-4 ${key === 'premium' ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                    {getPlanIcon(key)}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    {key === 'premium' ? 'Analyses illimitées' : `${plan.credits} crédits`}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">
                      {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground">/mois</span>
                    )}
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={isCurrentPlan ? "secondary" : popular ? "default" : "outline"}
                    disabled={isCurrentPlan || loading || upgrading !== null}
                    onClick={() => handleUpgrade(key)}
                  >
                    {upgrading === key ? (
                      "Traitement..."
                    ) : isCurrentPlan ? (
                      "Plan actuel"
                    ) : isUpgrade ? (
                      "Passer à ce plan"
                    ) : (
                      "Sélectionner"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          💡 Mode démo : les changements de plan sont simulés sans paiement réel.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Pricing;
