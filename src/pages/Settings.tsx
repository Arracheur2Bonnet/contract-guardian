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
  Key, 
  HelpCircle,
  Camera,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const sections = [
  { id: "profile", label: "Profil", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Sécurité", icon: Shield },
  { id: "appearance", label: "Apparence", icon: Palette },
  { id: "api", label: "API", icon: Key },
  { id: "help", label: "Aide", icon: HelpCircle },
];

const themes = [
  { id: "light", label: "Clair" },
  { id: "dark", label: "Sombre" },
  { id: "system", label: "Système" },
];

const helpLinks = [
  { label: "Documentation", href: "#" },
  { label: "FAQ", href: "#" },
  { label: "Support", href: "#" },
  { label: "Changelog", href: "#" },
];

const Settings = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    analysisComplete: true,
    weeklyReport: false,
    riskAlerts: true,
  });
  
  const apiKey = "sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx";

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("Clé API copiée !");
  };

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

              <div className="grid grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      selectedTheme === theme.id
                        ? "border-primary"
                        : "border-border hover:border-border/80"
                    )}
                  >
                    <div className={cn(
                      "w-full h-16 rounded-lg mb-3",
                      theme.id === "light" ? "bg-white border border-border" :
                      theme.id === "dark" ? "bg-gray-900" :
                      "bg-gradient-to-br from-white to-gray-900"
                    )} />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{theme.label}</span>
                      {selectedTheme === theme.id && (
                        <Check size={16} className="text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* API Section */}
          {activeSection === "api" && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
              <h2 className="text-lg font-semibold">Clé API</h2>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Votre clé API</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      readOnly
                      className="pr-10 font-mono text-sm"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <Button variant="outline" size="icon" onClick={copyApiKey}>
                    <Copy size={16} />
                  </Button>
                </div>
              </div>

              <Button variant="outline">Générer une nouvelle clé</Button>
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
