import { AIMessage, AIResponse, AIModel } from "@/types/ai";

export class AIService {
  private static baseUrl = "http://localhost:11434/api";
  private static currentModel = "deepseek-r1:1.5b";

  static async sendMessage(messages: AIMessage[]): Promise<AIResponse> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.currentModel,
        prompt: messages[messages.length - 1].content,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    return await response.json();
  }

  static async listModels(): Promise<AIModel[]> {
    const response = await fetch(`${this.baseUrl}/tags`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const data = await response.json();
    return data.models || [];
  }

  static setModel(model: string): void {
    this.currentModel = model;
  }

  static getCurrentModel(): string {
    return this.currentModel;
  }
}
