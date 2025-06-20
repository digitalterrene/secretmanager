"use client";
import { Terminal } from "@/components/Terminal";
import { useTheme } from "next-themes";

const TerminalIndex = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <Terminal />
    </div>
  );
};

export default TerminalIndex;
