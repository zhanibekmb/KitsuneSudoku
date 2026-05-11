import { useState } from "react";
import { useNavigate } from "react-router";
import { useUserStore } from "@/stores/useUserStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Check, ShieldCheck, Sparkles, Loader2 } from "lucide-react";

export const ProPage = () => {
  const { user, upgradeToPro } = useUserStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = () => {
    setLoading(true);
    // Simulate Stripe checkout redirect delay
    setTimeout(() => {
      upgradeToPro();
      setLoading(false);
      navigate("/");
    }, 1500);
  };

  if (!user) {
    navigate("/");
    return null;
  }

  if (user.isPro) {
    return (
      <div className="max-w-md mx-auto mt-24 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">You are a Zen Master</h1>
        <p className="opacity-60 mb-8">
          Thank you for supporting Kitsune Sudoku. Your Pro features are active.
        </p>
        <Button onClick={() => navigate("/")}>Return to Game</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg flex-1 mx-auto py-12 px-4 animate-in slide-in-from-bottom-4 duration-500 w-full flex flex-col justify-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Invest in your focus.</h1>
        <p className="text-lg opacity-60">
          Join thousands who have replaced scrolling with mindful puzzle
          solving.
        </p>
      </div>

      <div
        className="bg-[color:var(--bg-card)] border mb-8 rounded-2xl overflow-hidden relative shadow-xl"
        style={{ borderColor: "var(--primary)" }}
      >
        <div
          className="absolute top-0 right-0 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-widest"
          style={{ backgroundColor: "var(--primary)" }}
        >
          Most Popular
        </div>
        <div className="text-center p-8 bg-[color:var(--bg-app)] border-b border-[color:var(--border-color)]">
          <h2 className="text-2xl font-bold mb-4">Kitsune Pro</h2>
          <div className="flex justify-center items-baseline gap-1">
            <span className="text-5xl font-extrabold">$4.99</span>
            <span className="opacity-60 font-medium text-sm">/month</span>
          </div>
          <p className="pt-2 text-sm opacity-60">
            Cancel anytime, mock stripe integration.
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <ul className="space-y-4 mb-8">
            {[
              "Unlimited Gemini AI Coaching hints",
              "Magic Pencil (Auto-fill all candidate notes)",
              "Advanced statistical analytics",
              "Global & City-based leaderboards",
              "Beautiful custom themes (Sakura, Matcha, Ocean, Sunset)",
              "Print PDF support with answers",
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check
                  className="w-5 h-5 mt-0.5 shrink-0"
                  style={{ color: "var(--primary)" }}
                />
                <span className="font-medium">{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            className="w-full text-lg h-14 text-white shadow-lg font-bold hover:brightness-110"
            style={{ backgroundColor: "var(--primary)" }}
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5 mr-2" />
            ) : (
              <ShieldCheck className="w-5 h-5 mr-2" />
            )}
            {loading ? "Processing..." : "Subscribe securely"}
          </Button>
        </div>
      </div>

      <p className="text-center text-xs text-slate-500 mt-6">
        * Note: This is a simulated checkout flow for the prototype. No real
        money will be charged.
      </p>
    </div>
  );
};
