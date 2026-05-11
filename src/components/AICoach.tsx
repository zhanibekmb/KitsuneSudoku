import { useState } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { getAICoaching } from "@/lib/groq";
import { Sparkles, Bot, Loader2, MousePointerClick } from "lucide-react";

export const AICoach = () => {
  const { grid, solution, selectedCell, isPlaying } = useGameStore();
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const askCoach = async () => {
    if (selectedCell === null) return;
    setLoading(true);
    setAdvice(null);
    const resp = await getAICoaching(grid, solution, selectedCell);
    setAdvice(resp);
    setLoading(false);
  };

  if (!isPlaying) return null;

  return (
    <div className="border border-[color:var(--border-color)] bg-[color:var(--bg-card)] p-5 rounded-xl w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border flex items-center justify-center bg-[color:var(--bg-app)]"
            style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
          >
            <Bot className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold tracking-widest uppercase">
            AI Coach
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] bg-[color:var(--bg-app)] border border-[color:var(--border-color)] px-1.5 py-0.5 rounded opacity-60 font-bold tracking-widest">
            GROQ
          </span>
          <span className="text-[10px] bg-[color:var(--bg-app)] border border-[color:var(--border-color)] px-1.5 py-0.5 rounded opacity-60 font-bold tracking-widest">
            EXPERT
          </span>
        </div>
      </div>

      {selectedCell === null ? (
        <div className="flex items-center gap-2 text-xs opacity-50 italic">
          <MousePointerClick className="w-4 h-4 shrink-0" />
          <span>Select an empty cell, then ask for advice.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center gap-2 text-xs opacity-60">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing board position...</span>
            </div>
          )}
          {advice && !loading && (
            <div
              className="text-xs leading-relaxed border-l-2 pl-3"
              style={{ borderColor: "var(--primary)" }}
            >
              {advice}
            </div>
          )}
          <button
            onClick={askCoach}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 mt-2 py-2.5 hover:brightness-110 text-white text-xs font-bold rounded-lg shadow-sm tracking-widest uppercase transition-colors disabled:opacity-50"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {advice ? "Ask Again" : "Explain Strategy"}
          </button>
        </div>
      )}
    </div>
  );
};
