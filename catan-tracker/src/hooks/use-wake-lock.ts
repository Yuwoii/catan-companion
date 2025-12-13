"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface WakeLockState {
  isSupported: boolean;
  isActive: boolean;
  error: string | null;
}

/**
 * Hook to keep the screen awake during active game sessions.
 * Uses the Screen Wake Lock API when available.
 * 
 * @param enabled - Whether to attempt to keep the screen awake
 * @returns Wake lock state
 */
export function useWakeLock(enabled: boolean = true): WakeLockState {
  const [state, setState] = useState<WakeLockState>({
    isSupported: false,
    isActive: false,
    error: null,
  });

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Request wake lock
  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) {
      setState((prev) => ({
        ...prev,
        isSupported: false,
        error: "Wake Lock API not supported",
      }));
      return;
    }

    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      
      setState({
        isSupported: true,
        isActive: true,
        error: null,
      });

      // Listen for release (e.g., when tab becomes hidden)
      wakeLockRef.current.addEventListener("release", () => {
        setState((prev) => ({
          ...prev,
          isActive: false,
        }));
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to acquire wake lock";
      setState({
        isSupported: true,
        isActive: false,
        error,
      });
    }
  }, []);

  // Release wake lock
  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setState((prev) => ({
          ...prev,
          isActive: false,
        }));
      } catch (err) {
        console.error("Error releasing wake lock:", err);
      }
    }
  }, []);

  // Handle visibility change - reacquire lock when page becomes visible
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && enabled) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, requestWakeLock]);

  // Main effect to acquire/release lock based on enabled state
  useEffect(() => {
    // Check support on mount
    setState((prev) => ({
      ...prev,
      isSupported: "wakeLock" in navigator,
    }));

    if (enabled) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [enabled, requestWakeLock, releaseWakeLock]);

  return state;
}

