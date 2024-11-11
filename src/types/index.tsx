export interface GenerateSecretResponse {
  secret: string;
}

export interface GenerateSecretError {
  error: string;
}

export interface GenerateSecretOptions {
  phrase: string;
  timestamp: string;
}
export interface HistoryEntry {
  timestamp: string;
  phrase: string;
  secret: string;
}
