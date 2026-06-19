/**
 * Pick a random number from the available pool (1-100 minus already generated).
 * Returns null if all numbers have been generated.
 */
export function pickRandomNumber(generatedNumbers) {
  const generated = new Set(generatedNumbers);
  const available = [];
  for (let i = 1; i <= 90; i++) {
    if (!generated.has(i)) {
      available.push(i);
    }
  }
  if (available.length === 0) return null;
  const index = Math.floor(Math.random() * available.length);
  return available[index];
}
