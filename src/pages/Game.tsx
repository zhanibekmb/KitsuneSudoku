import { useEffect } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { Board } from "@/components/Board";
import { Keyboard } from "@/components/Keyboard";
import { AICoach } from "@/components/AICoach";
import { Button } from "@/components/ui/button";
import { Pause, Play, RefreshCw, Trophy } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { Link, useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUserStore } from "@/stores/useUserStore";

export const Game = () => {
  const navigate = useNavigate();
  const {
    timer,
    tickTimer,
    isPlaying,
    isPaused,
    pauseGame,
    resumeGame,
    errors,
    grid,
    solution,
    difficulty,
    startGame,
    gameMode,
  } = useGameStore();

  const { addWin } = useUserStore();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && !isPaused) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isPaused, tickTimer]);

  const isCompleted =
    isPlaying && grid.every((val, idx) => val === solution[idx]);
  const isGameOver =
    errors >= 3 || (gameMode === "time_challenge" && timer <= 0);

  useEffect(() => {
    if (isCompleted || isGameOver) {
      pauseGame();
      if (isCompleted) {
        let pts = 0;
        let diffCoins = 0;

        let multiplier = 1;
        if (errors === 0) multiplier = 1.5;
        else if (errors === 1) multiplier = 1;
        else if (errors === 2) multiplier = 0.5;

        if (gameMode === "time_challenge") {
          pts = 300 + timer * 2;
          diffCoins = Math.floor(100 * multiplier);
        } else if (gameMode === "wordoku") {
          const expTime = 1200;
          const timeBonus = timer < expTime ? Math.floor(((expTime - timer) / expTime) * 300) : 0;
          pts = 300 + timeBonus;
          diffCoins = Math.floor(80 * multiplier);
        } else {
          const rules: Record<string, { base: number; expTime: number; bonusMul: number; coins: number }> = {
            easy: { base: 50, expTime: 300, bonusMul: 50 / 300, coins: 15 },
            medium: { base: 100, expTime: 600, bonusMul: 100 / 600, coins: 30 },
            hard: { base: 200, expTime: 1200, bonusMul: 200 / 1200, coins: 60 },
            expert: { base: 500, expTime: 2400, bonusMul: 500 / 2400, coins: 120 },
          };
          const r = rules[difficulty] || rules.easy;
          const timeBonus = timer < r.expTime ? Math.floor((r.expTime - timer) * r.bonusMul) : 0;
          pts = r.base + timeBonus;
          diffCoins = Math.floor(r.coins * multiplier);
        }

        addWin(pts, diffCoins);
      }
    }
  }, [isCompleted, isGameOver, difficulty, addWin, pauseGame, gameMode]);

  if (!isPlaying) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Trophy className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-medium text-slate-600 mb-6">
          No active game
        </h2>
        <Button onClick={() => navigate("/")}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row flex-1 animate-in fade-in duration-500 h-full">
      {/* Center: Sudoku Grid Area */}
      <main className="flex-1 bg-[color:var(--bg-app)] flex flex-col items-center justify-start lg:justify-center p-4 sm:p-8 relative overflow-y-auto w-full">
        <div className="mb-6 flex flex-wrap items-center justify-between w-full max-w-[350px] sm:max-w-[450px] print:hidden">
          <div className="flex flex-col">
            <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest">
              Difficulty
            </span>
            <span
              className="font-bold capitalize"
              style={{ color: "var(--primary)" }}
            >
              {difficulty}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-center">
              <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest block mb-0.5">
                {gameMode === "time_challenge" ? "Time Left" : "Timer"}
              </span>
              <div
                className={`text-xl sm:text-2xl font-mono font-bold tracking-widest flex items-center gap-2 ${gameMode === "time_challenge" && timer < 60 ? "text-rose-500 animate-pulse" : ""}`}
              >
                {formatTime(timer)}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={isPaused ? resumeGame : pauseGame}
                  className="h-6 w-6 opacity-60 hover:opacity-100"
                >
                  {isPaused ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] opacity-60 font-bold uppercase tracking-widest">
              Mistakes
            </span>
            <span className="text-rose-500 font-bold font-mono">
              {errors}/3
            </span>
          </div>
        </div>

        <div
          className={`transition-opacity duration-300 w-full flex flex-col items-center flex-1 ${isPaused && !isCompleted && !isGameOver ? "opacity-20 pointer-events-none" : ""}`}
        >
          <Board />

          <div className="lg:hidden w-full max-w-[450px] mt-6 pb-20 print:hidden">
            <Keyboard />
            <div className="mt-4">
              <AICoach />
            </div>
          </div>
        </div>

        {isPaused && !isCompleted && !isGameOver && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm print:hidden">
            <div className="p-8 bg-[color:var(--bg-card)] border border-[color:var(--border-color)] rounded-xl shadow-2xl text-center">
              <h2 className="text-3xl font-bold mb-4 tracking-tight">Paused</h2>
              <Button
                size="lg"
                onClick={resumeGame}
                className="w-full text-lg shadow-md rounded-lg text-white font-bold tracking-wider hover:brightness-110"
                style={{ backgroundColor: "var(--primary)" }}
              >
                RESUME
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar: Controls & AI Coach */}
      <aside className="hidden lg:flex w-80 xl:w-96 border-l border-[color:var(--border-color)] p-6 flex-col bg-[color:var(--bg-card)] overflow-y-auto shrink-0 z-10 print:hidden">
        <Keyboard />
        <div className="mt-auto pt-8">
          <AICoach />
        </div>
      </aside>

      <Dialog open={isCompleted || isGameOver} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md text-center bg-[color:var(--bg-card)] border-[color:var(--border-color)]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold flex flex-col items-center gap-4 pt-4">
              <span className="text-5xl">{isGameOver ? "💔" : "🎉"}</span>
              {isGameOver ? "Game Over" : "Brilliant!"}
            </DialogTitle>
            <DialogDescription className="text-lg opacity-80 whitespace-pre-wrap">
              {isGameOver
                ? errors >= 3
                  ? `You made 3 mistakes.\nTake a deep breath and try again.`
                  : `Time is up!\nYou couldn't solve it in time.\nTake a deep breath and try again.`
                : `You completed the ${difficulty} puzzle in ${formatTime(timer)}.\nMistakes made: ${errors}`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              className="w-full sm:flex-1 border-[color:var(--border-color)]"
              onClick={() => navigate("/")}
            >
              Home
            </Button>
            <Button
              className="w-full sm:flex-1 text-white font-bold hover:brightness-110"
              style={{ backgroundColor: "var(--primary)" }}
              onClick={() => startGame(difficulty, gameMode)}
            >
              Play Again <RefreshCw className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
