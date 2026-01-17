import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Star, Quote } from "lucide-react";
import logoImage from "@/assets/logo.png";

const testimonials = [
  {
    name: "Marie Dupont",
    role: "CEO, TechStart SAS",
    avatar: "MD",
    text: "Contr'Act a révolutionné notre façon de gérer les contrats. Nous avons économisé plus de 50 000€.",
  },
  {
    name: "Jean-Pierre Martin",
    role: "Directeur Juridique, GroupeMedia",
    avatar: "JM",
    text: "Un outil indispensable. L'IA détecte des subtilités que même nos juristes auraient pu manquer.",
  },
  {
    name: "Sophie Bernard",
    role: "CEO, InnovateLab",
    avatar: "SB",
    text: "En tant que startup, Contr'Act nous a permis de négocier nos contrats en toute confiance.",
  },
];

const pressLogos = ["Forbes", "Les Échos", "BFM Business", "Capital"];

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou mot de passe incorrect");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Veuillez confirmer votre email");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Connexion réussie !");
        navigate("/");
      } else {
        if (!fullName.trim()) {
          toast.error("Veuillez entrer votre nom");
          setLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("Un compte existe déjà avec cet email. Connectez-vous.");
            setIsLogin(true);
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("Compte créé avec succès !");
        navigate("/");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src={logoImage} alt="Contr'Act" className="w-10 h-10" />
            <span className="font-bold text-2xl text-primary">Contr'Act</span>
          </div>

          {/* Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">
                {isLogin ? "Connexion" : "Créer un compte"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {isLogin 
                  ? "Accédez à votre espace Contr'Act" 
                  : "Rejoignez Contr'Act dès maintenant"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      type="text"
                      placeholder="Jean Dupont"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 6 caractères
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Chargement..." : isLogin ? "Se connecter" : "Créer mon compte"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-medium ml-1 hover:underline"
                >
                  {isLogin ? "S'inscrire" : "Se connecter"}
                </button>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            En continuant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>

      {/* Right Side - Testimonials */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 border-l border-border p-12 flex-col justify-center">
        <div className="max-w-lg mx-auto">

          {/* Testimonials */}
          <div className="space-y-4 mb-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-5"
              >
                <Quote className="text-primary/20 mb-2" size={20} />
                <p className="text-sm text-muted-foreground mb-4">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className="text-warning fill-warning" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Press Logos */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Ils parlent de nous
            </p>
            <div className="flex items-center gap-6">
              {pressLogos.map((logo) => (
                <span
                  key={logo}
                  className="text-muted-foreground font-semibold text-sm opacity-60"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
