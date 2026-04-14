import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShoppingBag, Mail, Lock, Sparkles, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import savvyLogo from "@/assets/savvy-logo.png";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, false);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="font-inter flex min-h-screen bg-background overflow-hidden">
        {/* ── Left decorative panel ── */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-hero items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(0_0%_100%/0.08),transparent_70%)]" />
          <div className="relative z-10 text-center px-12 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 text-xs font-semibold text-white mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Marketplace
              </div>
              <h2 className="font-satoshi text-4xl font-bold text-white leading-tight">
                Welcome back to{" "}
                <span className="opacity-90">Onett</span>
              </h2>
              <p className="font-inter mt-4 text-white/70 text-sm leading-relaxed">
                Your AI-powered shopping companion. Get personalised recommendations,
                snap-to-search, and smart deals — all in one place.
              </p>
            </motion.div>
          </div>
          <div className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[15%] right-[5%] w-48 h-48 rounded-full bg-white/5 blur-3xl" />
        </div>

        {/* ── Right form panel ── */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 relative">
          {/* Background ambient glow */}
          <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          {/* Glassmorphism form card */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[440px] relative"
          >
            <div className="glass rounded-3xl border border-white/30 shadow-elevated p-8 md:p-10">
              {/* Logo */}
              <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
                <img src={savvyLogo} alt="Onett" className="h-8 w-8" />
                <span className="font-satoshi text-xl font-bold">
                  On<span className="text-gradient">ett</span>
                </span>
              </Link>

              <div className="space-y-6">
                <div>
                  <h1 className="font-satoshi text-3xl font-bold heading-umber">Sign in</h1>
                  <p className="font-inter text-sm text-muted-foreground mt-1.5">
                    Continue shopping smarter
                  </p>
                </div>

                {/* Role badge */}
                <div className="flex items-center gap-3 rounded-xl border border-muted bg-muted/40 px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-inter text-sm font-medium text-muted-foreground">
                    Signing in as a{" "}
                    <span className="font-semibold text-foreground">Buyer</span>
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="font-ui text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                        className="font-inter pl-11 h-12 rounded-xl border-border bg-card text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="password"
                      className="font-ui text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="font-inter pl-11 pr-11 h-12 rounded-xl border-border bg-card text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword
                          ? <EyeOff className="h-4 w-4" />
                          : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="font-ui w-full rounded-xl h-12 font-semibold text-sm shadow-glow hover:shadow-glow-strong transition-all mt-1"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>

                <p className="font-inter text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link to="/register" className="text-primary hover:underline font-semibold">
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;
