const STORAGE_KEY = 'shaousi_game_state';

/**
 * Load game state from localStorage.
 * Returns null if no data or corrupted.
 */
export function loadGameState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Validate structure
    if (
      !Array.isArray(data.generatedNumbers) ||
      !Array.isArray(data.history) ||
      data.generatedNumbers.some((n) => typeof n !== 'number' || n < 1 || n > 100)
    ) {
      clearGameState();
      return null;
    }
    return {
      generatedNumbers: data.generatedNumbers,
      currentNumber: typeof data.currentNumber === 'number' ? data.currentNumber : null,
      history: data.history,
    };
  } catch {
    clearGameState();
    return null;
  }
}

/**
 * Save game state to localStorage.
 */
export function saveGameState({ generatedNumbers, currentNumber, history }) {
  try {
    const data = JSON.stringify({
      generatedNumbers: Array.from(generatedNumbers),
      currentNumber,
      history,
    });
    localStorage.setItem(STORAGE_KEY, data);
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/**
 * Clear all game state from localStorage.
 */
export function clearGameState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}
