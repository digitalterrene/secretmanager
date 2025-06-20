import { useState, useEffect, useRef, KeyboardEvent } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Minus, Square, Terminal as TerminalIcon } from "lucide-react";
import { CommandHistory } from "@/utils/CommandHistory";
import { TerminalCommands } from "@/utils/TerminalCommands";
import { useTheme } from "next-themes";

interface TerminalProps {
  theme: "light" | "dark";
}

interface TerminalLine {
  id: string;
  type: "input" | "output" | "error";
  content: string;
  timestamp: Date;
}

export const Terminal = () => {
  const { theme, setTheme } = useTheme();
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [commandHistory] = useState(() => new CommandHistory());
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [promptMode, setPromptMode] = useState<string | null>(null);
  const [isAIChatMode, setIsAIChatMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";

  useEffect(() => {
    // Load terminal history from localStorage
    const savedLines = localStorage.getItem("terminal-history");
    if (savedLines) {
      try {
        const parsed = JSON.parse(savedLines);
        setLines(
          parsed.map((line: any) => ({
            ...line,
            timestamp: new Date(line.timestamp),
          }))
        );
      } catch (error) {
        console.log("Failed to load terminal history");
      }
    }

    // Add welcome message
    const welcomeLine: TerminalLine = {
      id: Date.now().toString(),
      type: "output",
      content:
        'Welcome to Interactive Terminal! Type "help" to see available commands.',
      timestamp: new Date(),
    };
    setLines((prev) => [welcomeLine, ...prev]);

    // Set up AI response callback
    TerminalCommands.setAIResponseCallback(
      (message: string, type: "output" | "error") => {
        addLine(message, type);
      }
    );
  }, []);

  useEffect(() => {
    // Save terminal history to localStorage
    if (lines.length > 0) {
      localStorage.setItem(
        "terminal-history",
        JSON.stringify(lines.slice(0, 100))
      ); // Keep last 100 lines
    }
  }, [lines]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const addLine = (
    content: string,
    type: "input" | "output" | "error" = "output"
  ) => {
    const newLine: TerminalLine = {
      id: Date.now().toString() + Math.random(),
      type,
      content,
      timestamp: new Date(),
    };
    setLines((prev) => [...prev, newLine]);
  };

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;

    // Handle prompt modes
    if (promptMode === "secret-generation") {
      setPromptMode(null);
      addLine(`Secret phrase: ${command}`, "input");
      try {
        const result = await TerminalCommands.generateSecret(command);
        if (result.output) {
          addLine(result.output, result.type);
        }
      } catch (error) {
        addLine(`Error: ${error}`, "error");
      }
      setCurrentInput("");
      setHistoryIndex(-1);
      return;
    }

    // Add command to history
    commandHistory.add(command);

    // Show input in terminal
    const prompt = isAIChatMode ? "You:" : "$";
    addLine(`${prompt} ${command}`, "input");

    // Execute command
    try {
      const result = TerminalCommands.execute(command.trim());

      if (result.output) {
        addLine(result.output, result.type);
      }

      if (result.action === "clear") {
        setLines([]);
      } else if (
        result.action === "prompt" &&
        result.promptType === "secret-generation"
      ) {
        setPromptMode("secret-generation");
        addLine("Enter your secure phrase:", "output");
      } else if (result.action === "ai-chat") {
        setIsAIChatMode(true);
      }

      // Check if we exited AI chat mode
      if (isAIChatMode && !TerminalCommands.isAIChatMode()) {
        setIsAIChatMode(false);
      }
    } catch (error) {
      addLine(`Error: ${error}`, "error");
    }

    setCurrentInput("");
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(currentInput);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const history = commandHistory.getHistory();
      if (history.length > 0) {
        const newIndex =
          historyIndex === -1
            ? 0
            : Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const history = commandHistory.getHistory();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      // Basic tab completion for common commands
      const commands = [
        "help",
        "clear",
        "echo",
        "date",
        "whoami",
        "ls",
        "pwd",
        "cat",
        "calc",
        "run",
        "generate",
        "ai",
      ];
      const matches = commands.filter((cmd) =>
        cmd.startsWith(currentInput.toLowerCase())
      );
      if (matches.length === 1) {
        setCurrentInput(matches[0]);
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getLineColor = (type: string) => {
    if (isDark) {
      switch (type) {
        case "input":
          return "text-green-400";
        case "error":
          return "text-red-400";
        default:
          return "text-gray-300";
      }
    } else {
      switch (type) {
        case "input":
          return "text-green-600";
        case "error":
          return "text-red-600";
        default:
          return "text-gray-700";
      }
    }
  };

  const getPromptSymbol = () => {
    if (promptMode === "secret-generation") {
      return "phrase>";
    }
    if (isAIChatMode) {
      return "You>";
    }
    return "$";
  };

  const getPromptColor = () => {
    if (isAIChatMode) {
      return isDark ? "text-blue-400" : "text-blue-600";
    }
    return isDark ? "text-green-400" : "text-green-600";
  };

  if (isMinimized) {
    return (
      <div
        className={`fixed bottom-4 right-4 ${
          isDark ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"
        } border rounded-lg shadow-lg p-3 cursor-pointer transition-all hover:shadow-xl`}
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-2">
          <TerminalIcon
            className={`h-4 w-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}
          />
          <span
            className={`text-sm font-medium ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Terminal
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        isDark ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"
      } border bg-red-900  h-[70vh] rounded-lg shadow-xl overflow-hidden transition-all duration-300`}
    >
      {/* Terminal Header */}
      <div
        className={`${
          isDark ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-300"
        } border-b px-4 py-2 flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <TerminalIcon
            className={`h-4 w-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}
          />
          <span
            className={`text-sm font-medium ${
              isDark ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Terminal {isAIChatMode ? "- AI Chat Mode" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className={`h-6 w-6 p-0 ${
              isDark
                ? "hover:bg-gray-600 text-gray-400"
                : "hover:bg-gray-200 text-gray-500"
            }`}
          >
            <Minus className="h-3 w-3" />
          </button>
          <button
            onClick={() => setLines([])}
            className={`h-6 w-6 p-0 ${
              isDark
                ? "hover:bg-gray-600 text-gray-400"
                : "hover:bg-gray-200 text-gray-500"
            }`}
          >
            <Square className="h-3 w-3" />
          </button>
          <button
            className={`h-6 w-6 p-0 ${
              isDark
                ? "hover:bg-red-600 text-gray-400 hover:text-white"
                : "hover:bg-red-500 text-gray-500 hover:text-white"
            }`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className={`${isDark ? "bg-gray-900" : "bg-gray-50"} pb-8 h-full`}>
        <div className="h-full overflow-y-auto p-4" ref={scrollRef}>
          <div className="space-y-1 font-mono text-sm">
            {lines.map((line) => (
              <div key={line.id} className="flex items-start gap-2">
                <span
                  className={`text-xs opacity-50 min-w-[60px] ${
                    isDark ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {formatTime(line.timestamp)}
                </span>
                <span
                  className={`flex-1 whitespace-pre-wrap ${getLineColor(
                    line.type
                  )}`}
                >
                  {line.content}
                </span>
              </div>
            ))}
          </div>
          {/* Input Area */}
          <div
            className={`${
              isDark
                ? "bg-gray-800 border-gray-600"
                : "bg-white border-gray-300"
            }  rounded-lg sticky bottom-0 p-4`}
          >
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className={getPromptColor()}>{getPromptSymbol()}</span>
              <input
                ref={inputRef}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  promptMode === "secret-generation"
                    ? "Enter your secure phrase..."
                    : isAIChatMode
                    ? "Type your message to AI..."
                    : "Type a command..."
                }
                type={promptMode === "secret-generation" ? "password" : "text"}
                className={`flex-1 border-0 bg-transparent p-0 font-mono text-sm focus-visible:ring-0 ${
                  isDark
                    ? "text-gray-300 placeholder:text-gray-500"
                    : "text-gray-700 placeholder:text-gray-400"
                }`}
                autoFocus
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
