import { ref, set, get } from 'firebase/database';
import { db, auth, waitForAuth, getServerTimestampValue } from '../lib/firebase';

/**
 * Generate a short 4-character alphanumeric room code.
 * Uses uppercase letters + digits, avoiding ambiguous chars (0/O, 1/I/L).
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Create a new game room in Firebase.
 * Returns the room code on success, null on failure.
 */
export async function createRoom() {
  const user = await waitForAuth();
  if (!user) return null;

  // Try up to 5 times to find an unused code
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();
    const gameRef = ref(db, `games/${code}`);

    try {
      const snapshot = await get(gameRef);
      if (snapshot.exists()) {
        // Code collision, try again
        continue;
      }

      // Write initial game state
      await set(gameRef, {
        currentNumber: null,
        calledNumbers: [],
        history: [],
        status: 'idle',
        operatorUid: null,
        lastUpdatedAt: getServerTimestampValue(),
        lastUpdatedBy: 'system',
      });

      return code;
    } catch (err) {
      console.error('Failed to create room:', err);
      return null;
    }
  }

  return null;
}

/**
 * Check if a game room exists in Firebase.
 * Returns true if the room exists, false otherwise.
 */
export async function checkRoomExists(code) {
  if (!code) return false;

  const normalizedCode = code.toUpperCase().trim();
  if (!normalizedCode) return false;

  try {
    await waitForAuth();
    const gameRef = ref(db, `games/${normalizedCode}`);
    const snapshot = await get(gameRef);
    return snapshot.exists();
  } catch (err) {
    console.error('Failed to check room:', err);
    return false;
  }
}
