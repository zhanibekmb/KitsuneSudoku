import { getSudoku } from "sudoku-gen";

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export interface SudokuData {
  puzzle: string;
  solution: string;
  difficulty: string;
}

export const generateSudoku = (difficulty: Difficulty): SudokuData => {
  return getSudoku(difficulty);
};

export const indexToCell = (index: number) => ({
  row: Math.floor(index / 9),
  col: index % 9,
});

export const cellToIndex = (row: number, col: number) => row * 9 + col;

export const isValidMove = (
  grid: string[],
  index: number,
  value: string,
): boolean => {
  if (value === "") return true; // Clearing a cell is always "valid" internally
  const { row, col } = indexToCell(index);

  for (let i = 0; i < 81; i++) {
    if (i === index) continue;

    const c = indexToCell(i);
    // Check row
    if (c.row === row && grid[i] === value) return false;
    // Check col
    if (c.col === col && grid[i] === value) return false;
    // Check block
    if (
      Math.floor(c.row / 3) === Math.floor(row / 3) &&
      Math.floor(c.col / 3) === Math.floor(col / 3) &&
      grid[i] === value
    ) {
      return false;
    }
  }
  return true;
};
