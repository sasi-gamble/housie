let wakeLockSentinel = null;

/**
 * Request a screen wake lock. Silently fails if unsupported.
 */
export async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    wakeLockSentinel = await navigator.wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
    });
  } catch {
    // Wake lock request failed (e.g., low battery, tab not visible)
  }
}

/**
 * Release the current wake lock if active.
 */
export async function releaseWakeLock() {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch {
      // Silently fail
    }
    wakeLockSentinel = null;
  }
}

/**
 * Set up automatic re-acquisition on page visibility change.
 */
export function setupWakeLockListener() {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      requestWakeLock();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Initial request
  requestWakeLock();

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    releaseWakeLock();
  };
}
