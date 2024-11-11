"use client";

import { HistoryProvider } from "@/context/HistoryContext";
import { ThemeProvider } from "next-themes";
import React, { ReactNode, useEffect, useState } from "react";

export default function AppWrapper({ children }: { children: ReactNode }) {
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
    <ThemeProvider defaultTheme="system" attribute="class">
      <HistoryProvider>{children}</HistoryProvider>
    </ThemeProvider>
  );
}
