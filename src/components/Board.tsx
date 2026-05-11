import { useGameStore } from "@/stores/useGameStore";
import { cn } from "@/lib/utils";
import { indexToCell, isValidMove } from "@/lib/sudoku";

export const Board = () => {
  const { grid, puzzle, selectedCell, selectCell, notes, solution, gameMode } =
    useGameStore();

  const isSelected = (index: number) => index === selectedCell;

  const renderVal = (val: string | number) => {
    if (val === "" || val === undefined || val === null) return "";
    if (gameMode === "wordoku") {
      return String.fromCharCode(64 + parseInt(val.toString(), 10));
    }
    return val.toString();
  };

  // Highlight peers of the selected cell
  const isPeer = (index: number) => {
    if (selectedCell === null) return false;
    const current = indexToCell(index);
    const selected = indexToCell(selectedCell);
    return (
      current.row === selected.row ||
      current.col === selected.col ||
      (Math.floor(current.row / 3) === Math.floor(selected.row / 3) &&
        Math.floor(current.col / 3) === Math.floor(selected.col / 3))
    );
  };

  // Highlight identical numbers
  const isIdentical = (index: number) => {
    if (selectedCell === null || grid[selectedCell] === "") return false;
    return grid[index] === grid[selectedCell];
  };

  const hasError = (index: number) => {
    if (grid[index] === "") return false;
    if (puzzle[index] !== "-") return false; // Initial numbers are true
    return grid[index] !== solution[index]; // Check against solution
  };

  return (
    <div className="grid grid-cols-9 gap-0 border-4 border-[color:var(--border-color)] bg-[color:var(--bg-card)] relative shadow-2xl mx-auto select-none rounded-[4px] w-full max-w-[350px] h-[350px] sm:max-w-[450px] sm:h-[450px] md:max-w-[500px] md:h-[500px]">
      {grid.map((value, index) => {
        const { row, col } = indexToCell(index);

        const pb =
          row === 2 || row === 5
            ? "border-b-2 border-[color:var(--border-color)]"
            : "border-b border-[color:var(--border-color)]";
        const pr =
          col === 2 || col === 5
            ? "border-r-2 border-[color:var(--border-color)]"
            : "border-r border-[color:var(--border-color)]";

        const cellNotes = notes[index];
        const isInitial = puzzle[index] !== "-";
        const isSel = isSelected(index);
        const isIdent = !isSel && isIdentical(index);
        const isP = !isSel && !isIdent && isPeer(index);
        const err = hasError(index);

        return (
          <div
            key={index}
            className={cn(
              "relative flex items-center justify-center text-lg sm:text-2xl md:text-3xl cursor-pointer transition-colors duration-150",
              pb,
              pr,
              // Backgrounds
              isSel
                ? "shadow-inner border-2 z-10"
                : isIdent
                  ? "bg-[color:var(--primary)] bg-opacity-20 dark:bg-opacity-30"
                  : isP
                    ? "bg-[color:var(--bg-app)]"
                    : isInitial
                      ? "opacity-90"
                      : "bg-transparent",

              // Text colors & weights
              err
                ? "text-rose-500 underline font-bold"
                : isIdent
                  ? "text-[color:var(--primary)] font-black text-2xl sm:text-3xl md:text-4xl"
                  : isInitial && !err
                    ? "font-bold opacity-60"
                    : "font-bold",

              isSel && "font-black",
            )}
            onClick={() => selectCell(index)}
            style={
              isSel
                ? {
                    borderColor: "var(--primary)",
                    backgroundColor: "var(--bg-app)",
                    color: "var(--primary)",
                  }
                : {}
            }
          >
            {value === "" ? (
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-0.5 opacity-60">
                {cellNotes.map((isNoted, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center justify-center leading-none text-[8px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-sans"
                  >
                    {isNoted ? renderVal(i + 1) : ""}
                  </div>
                ))}
              </div>
            ) : (
              <span>{renderVal(value)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
