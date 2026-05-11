const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const getAICoaching = async (
  grid: string[],
  solution: string,
  selectedCell: number,
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string | undefined;

  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    return "Add VITE_GROQ_API_KEY to your .env file to unlock real AI coaching. Quick tip: Look at which numbers already appear in this cell's row, column, and 3×3 box — the correct digit is the one that doesn't appear in any of them!";
  }

  const gridStr = grid.map((c) => (c === "" ? "-" : c)).join("");
  const row = Math.floor(selectedCell / 9) + 1;
  const col = (selectedCell % 9) + 1;
  const answer = solution[selectedCell];

  const prompt = `You are an expert Sudoku coach helping a player improve their skills.
The player is stuck on the cell at Row ${row}, Column ${col}.
Current board (81 characters, row by row, '-' means empty): ${gridStr}
The correct answer for this cell is: ${answer}

In 2-3 concise, encouraging sentences:
1. Briefly explain WHY ${answer} is the only valid digit for this cell (mention a Sudoku technique like "elimination", "naked single", "hidden single", etc.)
2. Do NOT reveal answers for any other cells.
3. Be warm, friendly, and educational.`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 180,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as any)?.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return (
      data.choices?.[0]?.message?.content?.trim() ||
      "I'm pondering the best advice for you..."
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Groq AI Coaching Error:", msg);
    return `Hmm, I couldn't reach my brain right now (${msg}). Try again in a moment!`;
  }
};
