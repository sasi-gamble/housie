import { useState, useEffect, useCallback } from 'react';
import { loadGameState, saveGameState, clearGameState } from '../lib/localStorage';
import { pickRandomNumber } from '../lib/random';

const OPERATOR_SESSION_KEY = 'shaousi_op';

export function useGameState() {
  const [generatedNumbers, setGeneratedNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [history, setHistory] = useState([]);
  const [isOperator, setIsOperator] = useState(() => {
    try {
      return sessionStorage.getItem(OPERATOR_SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });

  // Load persisted game state on mount
  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      setGeneratedNumbers(saved.generatedNumbers);
      setCurrentNumber(saved.currentNumber);
      setHistory(saved.history);
    }
  }, []);

  // Persist game state on every change
  useEffect(() => {
    saveGameState({ generatedNumbers, currentNumber, history });
  }, [generatedNumbers, currentNumber, history]);

  const isGameComplete = generatedNumbers.length >= 100;

  const callNumber = useCallback((num) => {
    setGeneratedNumbers((prev) => [...prev, num]);
    setCurrentNumber(num);
    setHistory((prev) => [num, ...prev].slice(0, 10));
  }, []);

  const generateNext = useCallback(() => {
    const num = pickRandomNumber(generatedNumbers);
    if (num !== null) {
      callNumber(num);
    }
  }, [generatedNumbers, callNumber]);

  const selectNumber = useCallback(
    (num) => {
      if (!isOperator) return;
      if (generatedNumbers.includes(num)) return;
      callNumber(num);
    },
    [isOperator, generatedNumbers, callNumber]
  );

  const resetGame = useCallback(() => {
    setGeneratedNumbers([]);
    setCurrentNumber(null);
    setHistory([]);
    clearGameState();
  }, []);

  const login = useCallback((password) => {
    if (password === 'sasi1234') {
      setIsOperator(true);
      try {
        sessionStorage.setItem(OPERATOR_SESSION_KEY, '1');
      } catch {
        // Silently fail
      }
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsOperator(false);
    try {
      sessionStorage.removeItem(OPERATOR_SESSION_KEY);
    } catch {
      // Silently fail
    }
  }, []);

  return {
    generatedNumbers,
    currentNumber,
    history,
    isOperator,
    isGameComplete,
    callNumber,
    generateNext,
    selectNumber,
    resetGame,
    login,
    logout,
  };
}
