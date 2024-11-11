import {
  GenerateSecretError,
  GenerateSecretOptions,
  GenerateSecretResponse,
} from "@/types";

export async function generateSecret({
  phrase,
  timestamp,
}: GenerateSecretOptions): Promise<
  GenerateSecretResponse | GenerateSecretError
> {
  const url = "https://secretmanager-server.vercel.app/generate-secret";

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
      throw new Error(errorResponse.error || "Failed to generate secret");
    }

    // Parse and return the JSON response
    const data = (await response.json()) as GenerateSecretResponse;
    return data;
  } catch (error: unknown) {
    // Capture any error and return it as an object
    if (error instanceof Error) {
      return { error: error.message };
    } else {
      return { error: "An unknown error occurred" };
    }
  }
}
