import { GenerateSecretResponse } from "@/types";
import { getCurrentTimestamp } from "./generate-timestamp";

interface CommandResult {
  output?: string;
  type: "output" | "error";
  action?: "clear" | "prompt" | "ai-chat";
  promptType?: "secret-generation";
  aiResponse?: boolean;
}

export class TerminalCommands {
  private static fileSystem = {
    "/": {
      home: {
        user: {
          documents: {
            "readme.txt":
              "Welcome to the Interactive Terminal!\n\nThis is a simulated file system.\nYou can explore using commands like ls, cd, cat, etc.",
            projects: {
              terminal: {
                "package.json":
                  '{\n  "name": "interactive-terminal",\n  "version": "1.0.0",\n  "description": "A VS Code inspired terminal"\n}',
              },
            },
          },
          downloads: {},
          ".bashrc":
            'export PATH=$PATH:/usr/local/bin\nalias ll="ls -la"\nalias la="ls -la"',
        },
      },
      usr: {
        bin: {},
        lib: {},
      },
      var: {
        log: {},
      },
    },
  };

  private static currentPath = "/home/user";
  private static username = "developer";
  private static hostname = "terminal-app";
  private static aiChatMode = false;
  private static aiResponseCallback:
    | ((message: string, type: "output" | "error") => void)
    | null = null;

  static setAIResponseCallback(
    callback: (message: string, type: "output" | "error") => void
  ) {
    this.aiResponseCallback = callback;
  }

  static execute(command: string): CommandResult {
    const [cmd, ...args] = command.split(" ");
    const arg = args.join(" ");

    // Handle AI chat mode
    if (this.aiChatMode) {
      if (command.toLowerCase() === "exit chat") {
        this.aiChatMode = false;
        return { output: "AI chat mode exited.", type: "output" };
      }
      // For AI chat, we need to handle async, but return immediately
      this.handleAIChat(command);
      return { output: "", type: "output" }; // Return empty since response will come via callback
    }

    switch (cmd.toLowerCase()) {
      case "help":
        return {
          output: `Available commands:
  help            - Show this help message
  clear           - Clear the terminal
  echo [text]     - Display text
  date            - Show current date and time
  whoami          - Show current user
  pwd             - Show current directory
  ls [path]       - List directory contents
  cd [path]       - Change directory
  cat [file]      - Display file contents
  mkdir [dir]     - Create directory
  touch [file]    - Create empty file
  rm [file]       - Remove file
  history         - Show command history
  uptime          - Show system uptime
  uname           - Show system information
  calc [expr]     - Calculate mathematical expression
  run [file]      - Execute a file
  generate secret - Generate secure secret with phrase
  ai chat         - Start AI chat with Ollama
  ai models       - List available Ollama models`,
          type: "output",
        };

      case "calc":
        return this.calculate(arg);

      case "run":
        return this.runFile(arg);

      case "generate":
        if (args[0] === "secret") {
          return {
            output: "",
            type: "output",
            action: "prompt",
            promptType: "secret-generation",
          };
        }
        return {
          output: `Unknown generate command: ${args[0]}`,
          type: "error",
        };

      case "ai":
        if (args[0] === "chat") {
          this.aiChatMode = true;
          return {
            output:
              'AI chat mode activated. Type your message to chat with AI. Type "exit chat" to quit.',
            type: "output",
            action: "ai-chat",
          };
        } else if (args[0] === "models") {
          this.listOllamaModels();
          return { output: "Fetching available models...", type: "output" };
        }
        return { output: `Unknown ai command: ${args[0]}`, type: "error" };

      case "clear":
        return { output: "", type: "output", action: "clear" };

      case "echo":
        return { output: arg || "", type: "output" };

      case "date":
        return { output: new Date().toString(), type: "output" };

      case "whoami":
        return { output: this.username, type: "output" };

      case "pwd":
        return { output: this.currentPath, type: "output" };

      case "uptime":
        const uptime = performance.now() / 1000;
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        return {
          output: `up ${hours}h ${minutes}m ${seconds}s`,
          type: "output",
        };

      case "uname":
        return {
          output: `Interactive Terminal v1.0.0 (Web Terminal)`,
          type: "output",
        };

      case "ls":
        return this.listDirectory(arg || this.currentPath);

      case "cd":
        return this.changeDirectory(arg || "/home/user");

      case "cat":
        return this.readFile(arg);

      case "mkdir":
        return this.makeDirectory(arg);

      case "touch":
        return this.createFile(arg);

      case "rm":
        return this.removeFile(arg);

      case "history":
        const history = JSON.parse(
          localStorage.getItem("terminal-command-history") || "[]"
        );
        return {
          output: history
            .slice(0, 10)
            .map((cmd: string, i: number) => `${i + 1}  ${cmd}`)
            .join("\n"),
          type: "output",
        };

      default:
        return {
          output: `Command not found: ${cmd}. Type 'help' for available commands.`,
          type: "error",
        };
    }
  }

  private static calculate(expression: string): CommandResult {
    if (!expression) {
      return { output: "calc: missing expression", type: "error" };
    }

    try {
      // Basic math expression evaluation (safe evaluation)
      const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, "");
      if (sanitized !== expression) {
        return {
          output: "calc: invalid characters in expression",
          type: "error",
        };
      }

      const result = Function(`"use strict"; return (${sanitized})`)();
      return { output: `${expression} = ${result}`, type: "output" };
    } catch (error) {
      return { output: `calc: invalid expression - ${error}`, type: "error" };
    }
  }

  private static runFile(filename: string): CommandResult {
    if (!filename) {
      return { output: "run: missing filename", type: "error" };
    }

    try {
      const filePath = this.resolvePath(filename);
      const content = this.getObjectAtPath(filePath);

      if (typeof content === "string") {
        try {
          // Execute the file content as JavaScript
          const result = Function(content)();
          if (result !== undefined) {
            console.log("File execution result:", result);
            return {
              output: `File executed successfully. Result: ${result}`,
              type: "output",
            };
          } else {
            return { output: "File executed successfully.", type: "output" };
          }
        } catch (execError) {
          return {
            output: `run: execution error - ${execError}`,
            type: "error",
          };
        }
      } else if (typeof content === "object") {
        return { output: `run: ${filename}: Is a directory`, type: "error" };
      } else {
        return { output: `run: ${filename}: No such file`, type: "error" };
      }
    } catch (error) {
      return { output: `run: ${filename}: No such file`, type: "error" };
    }
  }

  static async generateSecret(phrase: string): Promise<CommandResult> {
    if (!phrase.trim()) {
      return {
        output: "generate secret: phrase cannot be empty",
        type: "error",
      };
    }

    const timestamp = getCurrentTimestamp();

    const url = "/api/generate-secret";

    try {
      // Send a POST request to the server
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phrase, timestamp }),
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorResponse = await response.json();
        return {
          output: `Secret generation failed: ${errorResponse.error}`,
          type: "error",
        };

        //throw new Error(errorResponse.error || "Failed to generate secret");
      }

      // Parse and return the JSON response
      const data = (await response.json()) as GenerateSecretResponse;
      return {
        output: `Secret generated successfully!\nPassphrase: ${phrase}\nTimestamp: ${timestamp}\nSecret Key: ${data?.secret}\n`,
        type: "output",
      };
    } catch (error) {
      console.error("Secret generation error:", error);
      return { output: `Secret generation error: ${error}`, type: "error" };
    }
  }

  private static async listOllamaModels(): Promise<void> {
    try {
      console.log("Fetching Ollama models...");

      // Use no-cors mode to bypass CORS restrictions
      const response = await fetch("http://localhost:11434/api/tags", {
        method: "GET",
        mode: "no-cors",
      });

      console.log("Models response status:", response.status);

      if (this.aiResponseCallback) {
        this.aiResponseCallback(
          "Available models: Checking Ollama connection...",
          "output"
        );
      }
    } catch (error) {
      console.log("Models fetch error:", error);
      if (this.aiResponseCallback) {
        this.aiResponseCallback(
          `Models Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          "error"
        );
      }
    }
  }

  private static async handleAIChat(message: string): Promise<void> {
    try {
      console.log("Sending message to Ollama:", message);

      // Remove no-cors mode as it prevents reading the response
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-r1:1.5b",
          prompt: message,
          stream: false,
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (this.aiResponseCallback) {
        this.aiResponseCallback(`AI: ${data.response}`, "output");
      }
    } catch (error) {
      console.error("Error in handleAIChat:", error);
      if (this.aiResponseCallback) {
        let errorMessage = "AI Error: ";

        if (
          error instanceof TypeError &&
          error.message.includes("Failed to fetch")
        ) {
          errorMessage +=
            "Failed to connect to Ollama. Make sure Ollama is running and accessible at http://localhost:11434. " +
            "If you're seeing CORS errors, restart Ollama with: OLLAMA_ORIGINS=* ollama serve";
        } else if (error instanceof Error) {
          errorMessage += error.message;
        } else {
          errorMessage += "Unknown error occurred";
        }

        this.aiResponseCallback(errorMessage, "error");
      }
    }
  }
  static isAIChatMode(): boolean {
    return this.aiChatMode;
  }

  private static listDirectory(path: string): CommandResult {
    try {
      const target = this.resolvePath(path);
      const obj = this.getObjectAtPath(target);

      if (!obj || typeof obj !== "object") {
        return {
          output: `ls: ${path}: No such file or directory`,
          type: "error",
        };
      }

      const items = Object.keys(obj).sort();
      if (items.length === 0) {
        return { output: "", type: "output" };
      }

      return {
        output: items
          .map((item) => {
            const itemPath = `${target}/${item}`.replace(/\/+/g, "/");
            const itemObj = this.getObjectAtPath(itemPath);
            return typeof itemObj === "object" ? `${item}/` : item;
          })
          .join("  "),
        type: "output",
      };
    } catch (error) {
      return {
        output: `ls: ${path}: No such file or directory`,
        type: "error",
      };
    }
  }

  private static changeDirectory(path: string): CommandResult {
    try {
      const target = this.resolvePath(path);
      const obj = this.getObjectAtPath(target);

      if (!obj || typeof obj !== "object") {
        return {
          output: `cd: ${path}: No such file or directory`,
          type: "error",
        };
      }

      this.currentPath = target;
      return { output: "", type: "output" };
    } catch (error) {
      return {
        output: `cd: ${path}: No such file or directory`,
        type: "error",
      };
    }
  }

  private static readFile(filename: string): CommandResult {
    if (!filename) {
      return { output: "cat: missing filename", type: "error" };
    }

    try {
      const filePath = this.resolvePath(filename);
      const content = this.getObjectAtPath(filePath);

      if (typeof content === "string") {
        return { output: content, type: "output" };
      } else if (typeof content === "object") {
        return { output: `cat: ${filename}: Is a directory`, type: "error" };
      } else {
        return {
          output: `cat: ${filename}: No such file or directory`,
          type: "error",
        };
      }
    } catch (error) {
      return {
        output: `cat: ${filename}: No such file or directory`,
        type: "error",
      };
    }
  }

  private static makeDirectory(dirname: string): CommandResult {
    if (!dirname) {
      return { output: "mkdir: missing directory name", type: "error" };
    }

    try {
      const dirPath = this.resolvePath(dirname);
      const parentPath = dirPath.substring(0, dirPath.lastIndexOf("/")) || "/";
      const dirName = dirPath.substring(dirPath.lastIndexOf("/") + 1);

      const parent = this.getObjectAtPath(parentPath);
      if (parent && typeof parent === "object") {
        parent[dirName] = {};
        return {
          output: `Directory '${dirname}' created successfully`,
          type: "output",
        };
      } else {
        return {
          output: `mkdir: cannot create directory '${dirname}': No such file or directory`,
          type: "error",
        };
      }
    } catch (error) {
      return {
        output: `mkdir: cannot create directory '${dirname}': ${error}`,
        type: "error",
      };
    }
  }

  private static createFile(filename: string): CommandResult {
    if (!filename) {
      return { output: "touch: missing filename", type: "error" };
    }

    try {
      const filePath = this.resolvePath(filename);
      const parentPath =
        filePath.substring(0, filePath.lastIndexOf("/")) || "/";
      const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);

      const parent = this.getObjectAtPath(parentPath);
      if (parent && typeof parent === "object") {
        parent[fileName] =
          '// Sample JavaScript file\n// Add your code here\nconsole.log("Hello from ' +
          fileName +
          '");';
        return {
          output: `File '${filename}' created successfully`,
          type: "output",
        };
      } else {
        return {
          output: `touch: cannot create file '${filename}': No such file or directory`,
          type: "error",
        };
      }
    } catch (error) {
      return {
        output: `touch: cannot create file '${filename}': ${error}`,
        type: "error",
      };
    }
  }

  private static removeFile(filename: string): CommandResult {
    if (!filename) {
      return { output: "rm: missing filename", type: "error" };
    }

    try {
      const filePath = this.resolvePath(filename);
      const parentPath =
        filePath.substring(0, filePath.lastIndexOf("/")) || "/";
      const fileName = filePath.substring(filePath.lastIndexOf("/") + 1);

      const parent = this.getObjectAtPath(parentPath);
      if (parent && typeof parent === "object" && fileName in parent) {
        delete parent[fileName];
        return {
          output: `File '${filename}' removed successfully`,
          type: "output",
        };
      } else {
        return {
          output: `rm: cannot remove '${filename}': No such file or directory`,
          type: "error",
        };
      }
    } catch (error) {
      return {
        output: `rm: cannot remove '${filename}': ${error}`,
        type: "error",
      };
    }
  }

  private static resolvePath(path: string): string {
    if (path.startsWith("/")) {
      return path;
    }

    if (path === "..") {
      const parts = this.currentPath.split("/").filter(Boolean);
      parts.pop();
      return "/" + parts.join("/");
    }

    if (path === ".") {
      return this.currentPath;
    }

    return `${this.currentPath}/${path}`.replace(/\/+/g, "/");
  }

  private static getObjectAtPath(path: string): any {
    const parts = path.split("/").filter(Boolean);
    let current: any = this.fileSystem["/"];

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }

    return current;
  }
}
