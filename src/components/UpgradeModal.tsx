import { useNavigate } from "react-router-dom";
import { AlertTriangle, Crown, Zap, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PLANS, UserCredits } from "@/services/creditsService";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCredits?: UserCredits | null;
}

const UpgradeModal = ({ open, onOpenChange, currentCredits }: UpgradeModalProps) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/pricing');
  };

  const currentPlan = currentCredits?.plan || 'free';
  const creditsUsed = currentCredits?.credits_used || 0;
  const creditsLimit = currentCredits?.credits_limit || 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto p-3 rounded-full bg-warning/10 text-warning mb-4">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <DialogTitle className="text-center text-xl">
            Limite de crédits atteinte
          </DialogTitle>
          <DialogDescription className="text-center">
            Vous avez utilisé vos {creditsLimit} crédits du plan {PLANS[currentPlan as keyof typeof PLANS].name}.
            <br />
            Passez à un plan supérieur pour continuer à analyser vos contrats.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Plan Gratuit</span>
            </div>
            <span className="text-sm text-muted-foreground">3 crédits</span>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="font-medium">Plan Standard</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-primary">9.99€/mois</span>
              <p className="text-xs text-muted-foreground">10 crédits</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="font-medium">Plan Premium</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-primary">29.99€/mois</span>
              <p className="text-xs text-muted-foreground">Illimité</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleUpgrade} className="w-full">
            Voir les plans
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            Plus tard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
