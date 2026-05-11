import { useGameStore } from "@/stores/useGameStore";
import { useUserStore } from "@/stores/useUserStore";
import { Button } from "@/components/ui/button";
import { Eraser, Undo, Lightbulb, PenLine, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export const Keyboard = () => {
  const { setValue, erase, undo, hint, notesMode, toggleNotesMode, hintsUsed, selectCell, selectedCell, autoFillNotes, grid, solution, gameMode } = useGameStore();
  const { user } = useUserStore();
  const navigate = useNavigate();

  const renderVal = (val: string | number) => {
    if (val === "" || val === undefined || val === null) return "";
    if (gameMode === "wordoku") {
      return String.fromCharCode(64 + parseInt(val.toString(), 10));
    }
    return val.toString();
  };

  const numberCounts = Array(10).fill(0);
  for (let i = 0; i < 81; i++) {
    if (grid[i] !== "" && grid[i] === solution[i]) {
      numberCounts[parseInt(grid[i], 10)] += 1;
    }
  }

  const isNumberCompleted = (num: number) => numberCounts[num] === 9;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "9") {
        setValue(e.key);
      } else if (gameMode === "wordoku" && e.key.toUpperCase() >= "A" && e.key.toUpperCase() <= "I") {
        const val = e.key.toUpperCase().charCodeAt(0) - 64;
        setValue(val.toString());
      } else if (e.key === "Backspace" || e.key === "Delete") {
        erase();
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        undo();
      } else if (e.key === "n") {
        toggleNotesMode();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (selectedCell !== null && selectedCell >= 9) selectCell(selectedCell - 9);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (selectedCell !== null && selectedCell < 72) selectCell(selectedCell + 9);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (selectedCell !== null && selectedCell % 9 !== 0) selectCell(selectedCell - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (selectedCell !== null && selectedCell % 9 !== 8) selectCell(selectedCell + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setValue, erase, undo, toggleNotesMode, selectCell, selectedCell]);

  return (
    <div className="flex flex-col gap-4 mt-6 max-w-[450px] mx-auto w-full">
      <div className="mb-4 w-full">
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-[10px] uppercase tracking-widest font-bold opacity-60">
            Input
          </h3>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={toggleNotesMode}
          >
            <span
              className={cn(
                "text-xs font-bold uppercase tracking-widest transition-colors",
                notesMode ? "text-[color:var(--primary)]" : "opacity-60",
              )}
            >
              Notes
            </span>
            <div className="w-8 h-4 bg-slate-700/30 border border-slate-700/50 rounded-full relative p-0.5 transition-colors">
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  notesMode
                    ? "bg-[color:var(--primary)] ml-auto"
                    : "bg-slate-400",
                )}
              ></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-9 gap-1 sm:gap-2 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const completed = isNumberCompleted(num);
            return (
              <button
                key={num}
                className={cn(
                  "h-12 w-full sm:h-14 bg-[color:var(--bg-card)] border-2 border-[color:var(--border-color)] rounded-md sm:rounded-xl text-lg sm:text-2xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]",
                  completed ? "opacity-20 cursor-not-allowed" : "hover:brightness-110"
                )}
                onClick={() => !completed && setValue(num.toString())}
                disabled={completed}
              >
                {renderVal(num)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          className="flex items-center justify-center gap-2 py-2 sm:py-3 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-lg text-sm font-medium hover:brightness-110 transition-all opacity-80 hover:opacity-100"
          onClick={undo}
        >
          <Undo className="w-4 h-4" /> <span>Undo</span>
        </button>
        <button
          className={cn(
            "flex items-center justify-center gap-2 py-2 sm:py-3 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-lg text-sm font-medium transition-all text-amber-500",
            hintsUsed >= 3
              ? "opacity-30 cursor-not-allowed"
              : "hover:brightness-110",
          )}
          onClick={hint}
          disabled={hintsUsed >= 3}
        >
          <Lightbulb className="w-4 h-4" />{" "}
          <span>Hint ({Math.max(0, 3 - hintsUsed)})</span>
        </button>
        <button
          className="flex items-center justify-center gap-2 py-2 sm:py-3 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-lg text-sm font-bold hover:brightness-110 transition-all text-rose-500"
          onClick={erase}
        >
          <Eraser className="w-4 h-4" /> <span>Erase</span>
        </button>
        <button
          className="flex items-center justify-center gap-2 py-2 sm:py-3 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-lg text-sm font-bold hover:brightness-110 transition-all"
          style={{color: 'var(--primary)'}}
          onClick={() => {
            if (user?.isPro) {
              autoFillNotes();
            } else {
              navigate('/pro');
            }
          }}
        >
          <Wand2 className="w-4 h-4" /> <span>Auto Notes (+3m)</span>
        </button>
      </div>
    </div>
  );
};
