import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateSudoku, Difficulty } from "@/lib/sudoku";
import { playSound } from "@/lib/sounds";

interface GameState {
  puzzle: string;
  solution: string;
  grid: string[];
  notes: boolean[][];
  notesMode: boolean;
  selectedCell: number | null;
  history: string[][];
  errors: number;
  timer: number;
  isPlaying: boolean;
  difficulty: Difficulty;
  isPaused: boolean;
  hintsUsed: number;
  gameMode: "classic" | "time_challenge" | "wordoku";

  startGame: (
    difficulty: Difficulty,
    mode?: "classic" | "time_challenge" | "wordoku",
  ) => void;
  selectCell: (index: number | null) => void;
  setValue: (value: string) => void;
  toggleNotesMode: () => void;
  toggleNote: (value: number) => void;
  undo: () => void;
  erase: () => void;
  hint: () => void;
  autoFillNotes: () => void;
  tickTimer: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      puzzle: "",
      solution: "",
      grid: Array(81).fill(""),
      notes: Array.from({ length: 81 }, () => Array(9).fill(false)),
      notesMode: false,
      selectedCell: null,
      history: [],
      errors: 0,
      timer: 0,
      isPlaying: false,
      difficulty: "easy",
      isPaused: false,
      hintsUsed: 0,
      gameMode: "classic",

      startGame: (difficulty, mode = "classic") => {
        const data = generateSudoku(difficulty);
        const initialGrid = data.puzzle
          .split("")
          .map((c) => (c === "-" ? "" : c));
        set({
          puzzle: data.puzzle,
          solution: data.solution,
          grid: initialGrid,
          notes: Array.from({ length: 81 }, () => Array(9).fill(false)),
          selectedCell: null,
          history: [initialGrid],
          errors: 0,
          timer: mode === "time_challenge" ? 300 : 0, // 5 minutes
          isPlaying: true,
          difficulty,
          isPaused: false,
          hintsUsed: 0,
          gameMode: mode,
        });
      },

      selectCell: (index) => set({ selectedCell: index }),

      setValue: (value) => {
        const {
          grid,
          selectedCell,
          puzzle,
          solution,
          history,
          isPlaying,
          isPaused,
          notesMode,
        } = get();
        if (
          !isPlaying ||
          isPaused ||
          selectedCell === null ||
          puzzle[selectedCell] !== "-"
        )
          return;

        if (grid[selectedCell] === solution[selectedCell]) return;

        if (notesMode) {
          if (value === "") return;
          get().toggleNote(parseInt(value));
          return;
        }

        const newGrid = [...grid];

        if (value !== "") {
          if (value !== solution[selectedCell]) {
            playSound("wrong");
            set((state) => ({ errors: state.errors + 1 }));
          } else {
            playSound("correct");
          }
        }

        newGrid[selectedCell] = value;
        const newNotes = [...get().notes.map((n) => [...n])];
        if (value !== "") {
          newNotes[selectedCell] = Array(9).fill(false);

          const row = Math.floor(selectedCell / 9);
          const col = selectedCell % 9;
          const boxRow = Math.floor(row / 3) * 3;
          const boxCol = Math.floor(col / 3) * 3;
          const valIdx = parseInt(value) - 1;

          if (!isNaN(valIdx) && valIdx >= 0 && valIdx < 9) {
            for (let i = 0; i < 9; i++) {
              // Row
              const rIdx = row * 9 + i;
              if (newNotes[rIdx][valIdx]) newNotes[rIdx][valIdx] = false;

              // Col
              const cIdx = i * 9 + col;
              if (newNotes[cIdx][valIdx]) newNotes[cIdx][valIdx] = false;

              // Box
              const bIdx =
                (boxRow + Math.floor(i / 3)) * 9 + (boxCol + (i % 3));
              if (newNotes[bIdx][valIdx]) newNotes[bIdx][valIdx] = false;
            }
          }
        }

        set({
          grid: newGrid,
          notes: newNotes,
          history: [...history, newGrid],
        });
      },

      toggleNotesMode: () => set((state) => ({ notesMode: !state.notesMode })),

      toggleNote: (value) => {
        const { selectedCell, notes, puzzle } = get();
        if (selectedCell === null || puzzle[selectedCell] !== "-") return;
        const newNotes = [...notes];
        const cellNotes = [...newNotes[selectedCell]];
        cellNotes[value - 1] = !cellNotes[value - 1];
        newNotes[selectedCell] = cellNotes;
        set({ notes: newNotes });
      },

      undo: () => {
        const { history, grid, solution, isPlaying, isPaused } = get();
        if (!isPlaying || isPaused || history.length <= 1) return;

        let newHistory = [...history];
        let mergedGrid = [...grid];
        let changed = false;

        while (newHistory.length > 1 && !changed) {
          newHistory.pop();
          let previousGrid = newHistory[newHistory.length - 1];
          mergedGrid = [...previousGrid];

          for (let i = 0; i < 81; i++) {
            if (grid[i] === solution[i] && grid[i] !== "") {
              mergedGrid[i] = grid[i];
            }
          }

          if (mergedGrid.join(",") !== grid.join(",")) {
            changed = true;
          }
        }

        if (changed) {
          newHistory[newHistory.length - 1] = mergedGrid;
          set({ grid: mergedGrid, history: newHistory });
        } else {
          set({ history: [newHistory[0]] });
        }
      },

      erase: () => get().setValue(""),

      hint: () => {
        const {
          selectedCell,
          solution,
          puzzle,
          grid,
          isPlaying,
          isPaused,
          hintsUsed,
        } = get();
        if (
          !isPlaying ||
          isPaused ||
          selectedCell === null ||
          puzzle[selectedCell] !== "-"
        )
          return;
        if (grid[selectedCell] === solution[selectedCell]) return;
        if (hintsUsed >= 3) return;

        get().setValue(solution[selectedCell]);
        set({ hintsUsed: hintsUsed + 1 });
      },

      autoFillNotes: () => {
        const { grid, puzzle, isPlaying, isPaused, notes, timer, gameMode } =
          get();
        if (!isPlaying || isPaused) return;

        const newNotes = [...notes.map((n) => [...n])];

        for (let i = 0; i < 81; i++) {
          if (puzzle[i] === "-" && grid[i] === "") {
            const row = Math.floor(i / 9);
            const col = i % 9;
            const boxRow = Math.floor(row / 3) * 3;
            const boxCol = Math.floor(col / 3) * 3;

            const used = new Set<string>();
            for (let j = 0; j < 9; j++)
              used.add(grid[row * 9 + j] || puzzle[row * 9 + j]);
            for (let j = 0; j < 9; j++)
              used.add(grid[j * 9 + col] || puzzle[j * 9 + col]);
            for (let r = 0; r < 3; r++) {
              for (let c = 0; c < 3; c++) {
                const idx = (boxRow + r) * 9 + (boxCol + c);
                used.add(grid[idx] || puzzle[idx]);
              }
            }

            const cellNotes = Array(9).fill(false);
            for (let v = 1; v <= 9; v++) {
              if (!used.has(v.toString())) {
                cellNotes[v - 1] = true;
              }
            }
            newNotes[i] = cellNotes;
          }
        }

        let newTimer = timer;
        if (gameMode === "time_challenge") {
          newTimer = Math.max(0, timer - 180);
        } else {
          newTimer = timer + 180;
        }
        set({ notes: newNotes, timer: newTimer });
      },

      tickTimer: () => {
        const { isPlaying, isPaused, gameMode, timer } = get();
        if (isPlaying && !isPaused) {
          if (gameMode === "time_challenge") {
            if (timer <= 0) {
              set({ isPlaying: false, errors: 3 }); // game over
            } else {
              set({ timer: timer - 1 });
            }
          } else {
            set({ timer: timer + 1 });
          }
        }
      },

      pauseGame: () => set({ isPaused: true }),
      resumeGame: () => set({ isPaused: false }),
    }),
    { name: "kitsune-sudoku-game" },
  ),
);
