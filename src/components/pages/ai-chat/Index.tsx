"use client";

import { Terminal } from "@/components/Terminal";
import { useTheme } from "next-themes";

const AIChatIndex = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`  transition-colors duration-300 ${
        theme === "dark" ? " " : "bg-gray-50"
      }`}
    >
      <div className="container mx-auto ">
        <div className="flex items-center justify-between "></div>

        <Terminal />
      </div>
    </div>
  );
};

export default AIChatIndex;
