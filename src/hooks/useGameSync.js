import { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { db, auth, waitForAuth, getServerTimestampValue } from '../lib/firebase';
import { saveGameState, loadGameState, clearGameState } from '../lib/localStorage';
import { pickRandomNumber } from '../lib/random';

/**
 * Real-time game sync hook.
 * Subscribes to a Firebase game room and exposes state + mutation functions.
 * Non-operators get read-only state; mutations are no-ops.
 */
export function useGameSync(gameId) {
  // Game state
  const [currentNumber, setCurrentNumber] = useState(null);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('idle');
  const [operatorUid, setOperatorUid] = useState(null);
  const [queuedNumber, setQueuedNumber] = useState(null);

  // Local state
  const [isOperator, setIsOperator] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('reconnecting');

  // Ref to track if we've loaded from cache already
  const cacheLoaded = useRef(false);

  const isGameComplete = calledNumbers.length >= 90;

  // Load from localStorage cache on mount (instant render before Firebase responds)
  useEffect(() => {
    if (cacheLoaded.current) return;
    cacheLoaded.current = true;
    const cached = loadGameState();
    if (cached && cached.gameId === gameId) {
      setCalledNumbers(cached.generatedNumbers || []);
      setCurrentNumber(cached.currentNumber);
      setHistory(cached.history || []);
    }
  }, [gameId]);

  // Subscribe to Firebase game room
  useEffect(() => {
    if (!gameId) return;

    const gameRef = ref(db, `games/${gameId}`);
    const unsubscribe = onValue(
      gameRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const cn = data.calledNumbers || [];
          const hist = data.history || [];
          const curr = data.currentNumber ?? null;
          const st = data.status || 'idle';
          const opUid = data.operatorUid || null;
          const qNum = data.queuedNumber ?? null;

          setCalledNumbers(cn);
          setCurrentNumber(curr);
          setHistory(hist);
          setStatus(st);
          setOperatorUid(opUid);
          setQueuedNumber(qNum);

          // Check if current user is the operator AND they have the session flag
          const currentUser = auth.currentUser;
          const isSessionOp = sessionStorage.getItem(`shaousi_op_${gameId}`) === '1';
          setIsOperator(currentUser != null && opUid === currentUser.uid && isSessionOp);

          // Cache to localStorage
          saveGameState({
            gameId,
            generatedNumbers: cn,
            currentNumber: curr,
            history: hist,
          });
        }
        setConnectionStatus('connected');
      },
      (error) => {
        console.error('Firebase onValue error:', error);
        setConnectionStatus('offline');
      }
    );

    return () => unsubscribe();
  }, [gameId]);

  // Monitor connection state
  useEffect(() => {
    const connRef = ref(db, '.info/connected');
    const unsubscribe = onValue(connRef, (snapshot) => {
      if (snapshot.val() === true) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('reconnecting');
      }
    });
    return () => unsubscribe();
  }, []);

  // Generate next number (Viewer clicks Generate)
  const generateNext = useCallback(async () => {
    if (!gameId) return;
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    let num = queuedNumber;
    if (num === null || num === undefined) {
      num = pickRandomNumber(calledNumbers);
    }
    
    if (num === null) return; // No numbers left

    const newCalled = [...calledNumbers, num];
    const newHistory = [num, ...history].slice(0, 10);
    const newStatus = newCalled.length >= 90 ? 'completed' : 'active';

    const gameRef = ref(db, `games/${gameId}`);
    try {
      await update(gameRef, {
        currentNumber: num,
        calledNumbers: newCalled,
        history: newHistory,
        status: newStatus,
        queuedNumber: null, // clear queue
        lastUpdatedAt: getServerTimestampValue(),
        lastUpdatedBy: isOperator ? 'operator' : 'viewer',
      });
    } catch (err) {
      console.error('Failed to call number:', err);
    }
  }, [gameId, calledNumbers, history, queuedNumber, isOperator]);

  // Select a specific number (operator queues it)
  const selectNumber = useCallback(
    async (num) => {
      if (!isOperator || !gameId) return;
      if (calledNumbers.includes(num)) return; // already called

      const newQueued = queuedNumber === num ? null : num;

      const gameRef = ref(db, `games/${gameId}`);
      try {
        await update(gameRef, {
          queuedNumber: newQueued,
          lastUpdatedAt: getServerTimestampValue(),
          lastUpdatedBy: 'operator',
        });
      } catch (err) {
        console.error('Failed to queue number:', err);
      }
    },
    [isOperator, gameId, calledNumbers, queuedNumber]
  );

  // Reset the game
  const resetGame = useCallback(async () => {
    if (!gameId) return;
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const gameRef = ref(db, `games/${gameId}`);
    try {
      await update(gameRef, {
        currentNumber: null,
        calledNumbers: [],
        history: [],
        status: 'idle',
        queuedNumber: null,
        lastUpdatedAt: getServerTimestampValue(),
        lastUpdatedBy: isOperator ? 'operator' : 'viewer',
      });
      clearGameState();
    } catch (err) {
      console.error('Failed to reset game:', err);
    }
  }, [gameId, isOperator]);

  // Claim operator role for this room
  const claimOperator = useCallback(async () => {
    if (!gameId) return false;
    const currentUser = await waitForAuth();
    if (!currentUser) return false;

    const gameRef = ref(db, `games/${gameId}`);
    try {
      // Check if room already has an operator
      const snapshot = await get(gameRef);
      const data = snapshot.val();
      if (data && data.operatorUid && data.operatorUid !== currentUser.uid) {
        // Room already has a different operator
        return false;
      }

      await update(gameRef, {
        operatorUid: currentUser.uid,
        lastUpdatedAt: getServerTimestampValue(),
        lastUpdatedBy: 'operator',
      });
      setIsOperator(true);
      // Store in sessionStorage so we remember across component re-mounts
      try {
        sessionStorage.setItem(`shaousi_op_${gameId}`, '1');
      } catch {
        // Silently fail
      }
      return true;
    } catch (err) {
      console.error('Failed to claim operator:', err);
      return false;
    }
  }, [gameId]);

  // Logout operator
  const logout = useCallback(() => {
    setIsOperator(false);
    try {
      sessionStorage.removeItem(`shaousi_op_${gameId}`);
    } catch {
      // Silently fail
    }
  }, [gameId]);

  // On mount, check if we were operator before (sessionStorage)
  useEffect(() => {
    const checkOperator = async () => {
      try {
        const wasOperator = sessionStorage.getItem(`shaousi_op_${gameId}`) === '1';
        if (wasOperator) {
          const currentUser = await waitForAuth();
          if (currentUser) {
            // Verify we're still the operator in Firebase
            const gameRef = ref(db, `games/${gameId}`);
            const snapshot = await get(gameRef);
            const data = snapshot.val();
            if (data && data.operatorUid === currentUser.uid) {
              setIsOperator(true);
            } else {
              // We're no longer the operator
              sessionStorage.removeItem(`shaousi_op_${gameId}`);
            }
          }
        }
      } catch {
        // Silently fail
      }
    };
    checkOperator();
  }, [gameId]);

  return {
    currentNumber,
    calledNumbers,
    queuedNumber,
    history,
    status,
    isOperator,
    isGameComplete,
    connectionStatus,
    generateNext,
    selectNumber,
    resetGame,
    claimOperator,
    logout,
  };
}
