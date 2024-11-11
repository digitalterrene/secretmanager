"use client";
import { HistoryEntry } from "@/types";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface HistoryContextType {
  history: HistoryEntry[];
  addToHistory: (entry: HistoryEntry) => void;
  removeFromHistory: (timestamp: string) => void; // New method to remove from history
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const addToHistory = (entry: HistoryEntry) => {
    setHistory((prevHistory) => [entry, ...prevHistory]);
  };

  const removeFromHistory = (timestamp: string) => {
    setHistory((prevHistory) =>
      prevHistory.filter((entry) => entry.timestamp !== timestamp)
    );
  };
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set `isMounted` to true only after the component mounts to avoid SSR mismatches
    setIsMounted(true);
  }, []);

  if (typeof window === undefined) {
    // Prevent rendering until mounted to avoid hydration mismatch
    return null;
  }

  return (
    <HistoryContext.Provider
      value={{ history, addToHistory, removeFromHistory }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
};
