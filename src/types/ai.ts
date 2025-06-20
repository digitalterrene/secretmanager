export interface AIMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface AIResponse {
  response: string;
  model: string;
  created_at: string;
  done: boolean;
}

export interface AIModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}
