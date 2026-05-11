import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { useUserStore } from "@/stores/useUserStore";
import { Coffee, Settings, LogOut, Printer, Palette, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { generateSudoku, Difficulty } from "@/lib/sudoku";
import { KitsuneLogo } from "@/components/KitsuneLogo";
import { useSyncFirebase } from "@/lib/sync";

// ─── Print-only Sudoku Grid ──────────────────────────────────────────────────
const PrintGrid = ({ puzzle }: { puzzle: string }) => {
  if (!puzzle) return null;
  const cells = puzzle.split("");
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(9, 52px)",
        gridTemplateRows: "repeat(9, 52px)",
        border: "3px solid #000",
        width: "fit-content",
        margin: "0 auto",
      }}
    >
      {cells.map((c, idx) => {
        const row = Math.floor(idx / 9);
        const col = idx % 9;
        const borderRight = col === 2 || col === 5 ? "2px solid #000" : "1px solid #888";
        const borderBottom = row === 2 || row === 5 ? "2px solid #000" : "1px solid #888";
        return (
          <div
            key={idx}
            style={{
              width: 52,
              height: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: c !== "-" ? 700 : 400,
              color: c !== "-" ? "#111" : "transparent",
              borderRight,
              borderBottom,
              backgroundColor: "#fff",
              fontFamily: "monospace",
            }}
          >
            {c !== "-" ? c : ""}
          </div>
        );
      })}
    </div>
  );
};

export const Layout = () => {
  const { user, logout, setTheme, checkStreak } = useUserStore();
  const navigate = useNavigate();

  useSyncFirebase();

  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printDiff, setPrintDiff] = useState<Difficulty>("medium");
  const [printPuzzle, setPrintPuzzle] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const { freezeUsed, streakReset } = checkStreak();
    if (freezeUsed > 0 && !streakReset) {
      alert(`Фух! Вы пропустили дни (${freezeUsed}), но экипированная Заморозка спасла ваш стрик!`);
    } else if (streakReset && freezeUsed > 0) {
      alert(`Вы пропустили слишком много дней. Ваши заморозки кончились, и стрик сброшен.`);
    }
  }, [checkStreak]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      "light",
      "dark",
      "theme-sakura",
      "theme-matcha",
      "theme-ocean",
      "theme-sunset",
    );
    if (user?.theme) {
      root.classList.add(
        user.theme === "light" || user.theme === "dark"
          ? user.theme
          : `theme-${user.theme}`,
      );
    } else {
      root.classList.add("dark");
    }
  }, [user?.theme]);

  const handlePrintRequest = () => {
    setIsPrinting(true);
    const data = generateSudoku(printDiff);
    setPrintPuzzle(data.puzzle);
    setPrintDialogOpen(false);

    // Give React time to render the hidden puzzle before calling print
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 400);
  };

  const difficulties: Difficulty[] = ["easy", "medium", "hard", "expert"];

  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-[color:var(--primary)] selection:text-white">
      <header className="shrink-0 h-16 border-b border-[color:var(--border-color)] bg-[color:var(--bg-card)] flex items-center justify-between px-6 lg:px-8 print:hidden shadow-sm z-50">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[color:var(--primary)] bg-[color:var(--primary)]/10 dark:bg-[color:var(--primary)]/20 border border-[color:var(--primary)]/30">
              <KitsuneLogo className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:inline-block">
              KITSUNE<span className="font-medium opacity-70">SUDOKU</span>
            </span>
          </Link>
          <span className="hidden md:inline-block px-2 py-1 bg-[color:var(--bg-app)] text-[10px] font-bold rounded opacity-70 border border-[color:var(--border-color)] tracking-widest uppercase">
            Beta
          </span>
        </div>

        <div className="flex items-center gap-6">
          {user && (
            <>
              <div className="hidden lg:flex items-center gap-2 bg-[color:var(--bg-app)] px-3 py-1.5 rounded-full border border-[color:var(--border-color)]">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs font-medium opacity-80">
                  Daily Challenge Active
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-2 bg-[color:var(--bg-app)] px-3 py-1.5 rounded-full border border-amber-500/50">
                <span className="text-amber-500 font-bold text-sm">
                  🟡 {user.coins}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPrintDialogOpen(true)}
                  className="hidden sm:flex opacity-70 hover:opacity-100"
                  title="Print Sudoku"
                >
                  <Printer className="w-4 h-4 mr-2" />{" "}
                  <span className="text-xs font-bold tracking-widest uppercase">
                    Print PDF
                  </span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex flex-col items-end gap-0.5 hover:opacity-80 transition-opacity focus:outline-none">
                    <span className="hidden sm:flex text-sm font-medium opacity-80 items-center gap-2">
                      {user.name}
                      <div
                        className="w-8 h-8 rounded-full border flex items-center justify-center font-bold shrink-0 shadow-inner"
                        style={{
                          borderColor: "var(--primary)",
                          color: "var(--primary)",
                        }}
                      >
                        {user.name.substring(0, 1).toUpperCase()}
                      </div>
                    </span>
                    {user.activeTitle && (
                      <span className="hidden sm:inline-block text-[10px] tracking-widest font-bold opacity-60 uppercase">
                        {user.activeTitle}
                      </span>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <div className="px-2 py-1.5 text-xs font-bold uppercase tracking-widest opacity-60">
                      My Account
                    </div>
                    <DropdownMenuSeparator
                      style={{ backgroundColor: "var(--border-color)" }}
                    />
                    <DropdownMenuItem
                      className="cursor-pointer focus:bg-slate-500/20"
                      onClick={() => navigate("/pro")}
                    >
                      <span className="text-amber-500 flex items-center">
                        <Coffee className="w-4 h-4 mr-2" /> Pro Subscription
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="cursor-pointer focus:bg-slate-500/20">
                        <Palette className="w-4 h-4 mr-2 opacity-60" /> Theme
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent
                          style={{
                            backgroundColor: "var(--bg-card)",
                            borderColor: "var(--border-color)",
                          }}
                        >
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setTheme("dark")}
                          >
                            Dark
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setTheme("light")}
                          >
                            Light
                          </DropdownMenuItem>
                          {user.isPro && (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => setTheme("sakura")}
                            >
                              Sakura (Pro)
                            </DropdownMenuItem>
                          )}
                          {user.isPro && (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => setTheme("matcha")}
                            >
                              Matcha (Pro)
                            </DropdownMenuItem>
                          )}
                          {user.isPro && (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => setTheme("ocean")}
                            >
                              Ocean (Pro)
                            </DropdownMenuItem>
                          )}
                          {user.isPro && (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => setTheme("sunset")}
                            >
                              Sunset (Pro)
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator
                      style={{ backgroundColor: "var(--border-color)" }}
                    />
                    <DropdownMenuItem
                      className="cursor-pointer text-rose-500 focus:bg-slate-500/20"
                      onClick={() => {
                        logout();
                        navigate("/");
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Outlet />
      </main>

      {/* ── Print Dialog ─────────────────────────────────────── */}
      <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
        <DialogContent
          className="sm:max-w-sm border-[color:var(--border-color)] bg-[color:var(--bg-card)]"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" /> Print Sudoku Puzzle
            </DialogTitle>
            <DialogDescription>
              Choose a difficulty and we'll generate a fresh puzzle ready to print.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest opacity-60">
              Difficulty
            </p>
            <div className="grid grid-cols-2 gap-2">
              {difficulties.map((d) => (
                <button
                  key={d}
                  onClick={() => setPrintDiff(d)}
                  className={`py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${
                    printDiff === d
                      ? "text-white border-transparent"
                      : "opacity-50 border-[color:var(--border-color)] hover:opacity-80"
                  }`}
                  style={
                    printDiff === d
                      ? { backgroundColor: "var(--primary)" }
                      : {}
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1 border-[color:var(--border-color)]"
              onClick={() => setPrintDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 text-white font-bold hover:brightness-110"
              style={{ backgroundColor: "var(--primary)" }}
              disabled={isPrinting}
              onClick={handlePrintRequest}
            >
              <Printer className="w-4 h-4 mr-2" />
              {isPrinting ? "Preparing…" : "Print / Save PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Hidden section that appears only on print ─────────── */}
      {printPuzzle && (
        <div className="kitsune-print-area">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4, marginBottom: 4 }}>
              KITSUNE SUDOKU
            </h1>
            <p style={{ fontSize: 13, opacity: 0.6, textTransform: "uppercase", letterSpacing: 2 }}>
              {printDiff} · kitsune-sudoku.app
            </p>
          </div>
          <PrintGrid puzzle={printPuzzle} />
          <div
            style={{
              marginTop: 32,
              display: "grid",
              gridTemplateColumns: "repeat(9, 52px)",
              margin: "32px auto 0",
              textAlign: "center",
              fontSize: 11,
              opacity: 0.4,
            }}
          >
            <p style={{ gridColumn: "1/-1" }}>
              Fill in the grid so every row, column and 3×3 box contains the digits 1–9.
            </p>
          </div>
        </div>
      )}

      <style>{`
        /* Hide print area in normal view */
        .kitsune-print-area {
          display: none;
        }

        @media print {
          /* Show only the print area */
          .kitsune-print-area {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            background: white;
            color: black;
            padding: 48px 32px;
            z-index: 99999;
          }

          /* Hide everything else */
          header,
          main,
          footer {
            display: none !important;
          }

          body {
            background: white;
            color: black;
          }
        }
      `}</style>
    </div>
  );
};
