//api/generate-secret/route.ts

import { NextResponse } from "next/server";
import { ratelimit } from "@/lib/rate-limit";
import {
  GenerateSecretRequest,
  GenerateSecretResponse,
  RateLimitHeaders,
} from "@/lib/types";
import {
  generateRequestFingerprint,
  setSecurityHeaders,
  setSecureCookie,
  validateInputs,
  generateDeterministicSecret,
} from "@/lib/security";

export async function POST(
  req: Request
): Promise<NextResponse<GenerateSecretResponse>> {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      const rateLimitHeaders: RateLimitHeaders = {
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": reset.toString(),
      };

      return NextResponse.json(
        { error: "Too many requests, please try again later." },
        {
          status: 429,
          headers: rateLimitHeaders,
        }
      );
    }

    // Validate content type
    const contentType = req.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type. Expected application/json" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const requestBody: GenerateSecretRequest = await req.json();
    const validationError = validateInputs(
      requestBody.phrase,
      requestBody.timestamp
    );

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Generate secret and fingerprint - now async
    const secret = await generateDeterministicSecret(
      requestBody.phrase,
      requestBody.timestamp
    );
    const fingerprint = await generateRequestFingerprint(req);
    setSecureCookie(fingerprint);

    // Prepare response with security headers
    const responseHeaders = setSecurityHeaders();
    responseHeaders.set("X-RateLimit-Limit", limit.toString());
    responseHeaders.set("X-RateLimit-Remaining", remaining.toString());
    responseHeaders.set("X-RateLimit-Reset", reset.toString());

    return NextResponse.json(
      {
        secret,
        phrase: requestBody.phrase,
        timestamp: requestBody.timestamp,
      },
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error("Error generating secret:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
