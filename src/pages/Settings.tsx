import { useState } from "react";
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
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

const sections = [
  { id: "profile", label: "Profil", icon: User },
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
  const [activeSection, setActiveSection] = useState("profile");
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    analysisComplete: true,
    weeklyReport: false,
    riskAlerts: true,
  });

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
                    TD
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <p className="font-medium">Thomas Dubois</p>
                  <p className="text-sm text-muted-foreground">Changer la photo</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nom complet</label>
                  <Input defaultValue="Thomas Dubois" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input type="email" defaultValue="thomas@example.com" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Entreprise</label>
                  <Input defaultValue="Startup SAS" />
                </div>
              </div>

              <Button>Enregistrer</Button>
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
