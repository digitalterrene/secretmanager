export class CommandHistory {
  private history: string[] = [];
  private maxSize: number = 100;
  private storageKey: string = 'terminal-command-history';

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.history = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load command history:', error);
      this.history = [];
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (error) {
      console.warn('Failed to save command history:', error);
    }
  }

  add(command: string) {
    // Don't add empty commands or duplicates of the last command
    if (!command.trim() || this.history[0] === command) {
      return;
    }

    // Add to beginning of array (most recent first)
    this.history.unshift(command);

    // Keep only the last maxSize commands
    if (this.history.length > this.maxSize) {
      this.history = this.history.slice(0, this.maxSize);
    }

    this.saveHistory();
  }

  getHistory(): string[] {
    return [...this.history];
  }

  clear() {
    this.history = [];
    this.saveHistory();
  }

  search(query: string): string[] {
    return this.history.filter(cmd => 
      cmd.toLowerCase().includes(query.toLowerCase())
    );
  }
}
