import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  HelpCircle,
  Camera,
  ExternalLink,
  Check,
  Sun,
  Moon,
  Monitor,
  Coins,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateUserCredits, getRemainingCredits, UserCredits, PLANS } from "@/services/creditsService";

const sections = [
  { id: "profile", label: "Profil", icon: User },
  { id: "subscription", label: "Abonnement", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Sécurité", icon: Shield },
  { id: "appearance", label: "Apparence", icon: Palette },
  { id: "help", label: "Aide", icon: HelpCircle },
];

const themes = [
  { id: "light", label: "Clair", icon: Sun },
  { id: "dark", label: "Sombre", icon: Moon },
  { id: "system", label: "Système", icon: Monitor },
] as const;

const helpLinks = [
  { label: "Documentation", href: "#" },
  { label: "FAQ", href: "#" },
  { label: "Support", href: "#" },
  { label: "Changelog", href: "#" },
];

const Settings = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  const { theme, setTheme } = useTheme();
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    analysisComplete: true,
    weeklyReport: false,
    riskAlerts: true,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const credits = await getOrCreateUserCredits(user.id);
        setUserCredits(credits);
        setUserInfo({
          name: user.user_metadata?.full_name || '',
          email: user.email || ''
        });
      }
    };
    fetchUserData();
  }, []);

  const remainingCredits = userCredits ? getRemainingCredits(userCredits) : 0;
  const userInitials = userInfo.name 
    ? userInfo.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : userInfo.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <DashboardLayout title="Paramètres" subtitle="Gérez vos préférences">
      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-48 flex-shrink-0 hidden md:block">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  activeSection === section.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <section.icon size={18} />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-semibold">Profil</h2>
              
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                    {userInitials}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <p className="font-medium">{userInfo.name || 'Utilisateur'}</p>
                  <p className="text-sm text-muted-foreground">Changer la photo</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nom complet</label>
                  <Input value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})} placeholder="Votre nom" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input type="email" value={userInfo.email} disabled className="bg-muted" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Entreprise</label>
                  <Input placeholder="Nom de votre entreprise" />
                </div>
              </div>

              <Button>Enregistrer</Button>
            </div>
          )}

          {/* Subscription Section */}
          {activeSection === "subscription" && (
            <div className="space-y-6">
              {/* Credits Card */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Vos crédits</h2>
                
                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Coins className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Crédits restants ce mois</p>
                    <p className="text-3xl font-bold">
                      {remainingCredits === 'unlimited' ? (
                        <span className="text-primary">Illimités</span>
                      ) : (
                        <>
                          <span className="text-primary">{remainingCredits}</span>
                          <span className="text-muted-foreground text-lg"> / {userCredits?.credits_limit || 3}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Progress bar for non-premium */}
                {userCredits?.plan !== 'premium' && (
                  <div className="space-y-2">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(100, ((userCredits?.credits_used || 0) / (userCredits?.credits_limit || 3)) * 100)}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {userCredits?.credits_used || 0} crédits utilisés sur {userCredits?.credits_limit || 3}
                    </p>
                  </div>
                )}
              </div>

              {/* Current Plan */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Votre abonnement</h2>
                
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      userCredits?.plan === 'premium' ? "bg-primary/10 text-primary" : "bg-muted"
                    )}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{userCredits ? PLANS[userCredits.plan].name : 'Gratuit'}</p>
                      <p className="text-sm text-muted-foreground">
                        {userCredits?.plan === 'premium' 
                          ? 'Analyses illimitées' 
                          : `${PLANS[userCredits?.plan || 'free'].credits} crédits/mois`}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-xs font-medium px-3 py-1 rounded-full",
                    userCredits?.plan === 'premium' 
                      ? "bg-primary/10 text-primary" 
                      : userCredits?.plan === 'standard'
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-muted text-muted-foreground"
                  )}>
                    {userCredits?.plan === 'free' ? 'Gratuit' : userCredits?.plan === 'standard' ? '11,99€/mois' : '29,99€/mois'}
                  </span>
                </div>

                {userCredits?.plan !== 'premium' && (
                  <Button className="w-full" onClick={() => navigate('/pricing')}>
                    Passer à un plan supérieur
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-semibold">Notifications</h2>

              <div className="space-y-4">
                {[
                  { key: "email", label: "Notifications email", description: "Recevoir les notifications par email" },
                  { key: "push", label: "Notifications push", description: "Notifications dans le navigateur" },
                  { key: "analysisComplete", label: "Analyse terminée", description: "Quand une analyse est complète" },
                  { key: "weeklyReport", label: "Rapport hebdomadaire", description: "Résumé de vos analyses" },
                  { key: "riskAlerts", label: "Alertes risques", description: "Quand un contrat à haut risque est détecté" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-semibold">Sécurité</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Mot de passe actuel</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nouveau mot de passe</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Confirmer le mot de passe</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>

              <Button>Changer le mot de passe</Button>

              <div className="pt-4 border-t border-border">
                <Button variant="outline" className="gap-2">
                  <Shield size={16} />
                  Activer l'authentification à deux facteurs
                </Button>
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === "appearance" && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-semibold">Apparence</h2>
              <p className="text-sm text-muted-foreground">
                Personnalisez l'apparence de l'application
              </p>

              <div className="grid grid-cols-3 gap-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      theme === t.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "w-full h-16 rounded-lg mb-3 flex items-center justify-center",
                      t.id === "light" ? "bg-white border border-border" :
                      t.id === "dark" ? "bg-slate-900" :
                      "bg-gradient-to-br from-white to-slate-900"
                    )}>
                      <t.icon className={cn(
                        "w-6 h-6",
                        t.id === "light" ? "text-amber-500" :
                        t.id === "dark" ? "text-blue-400" :
                        "text-slate-500"
                      )} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.label}</span>
                      {theme === t.id && (
                        <Check size={16} className="text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Help Section */}
          {activeSection === "help" && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold">Aide</h2>

              <div className="space-y-2">
                {helpLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="font-medium text-sm">{link.label}</span>
                    <ExternalLink size={16} className="text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
