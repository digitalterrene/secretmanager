//utils/generate-timestamp.ts
// Helper function for consistent timestamps
export function getCurrentTimestamp(): string {
  return Date.now().toString().padStart(13, "0");
}
