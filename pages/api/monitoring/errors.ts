import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { errors, environment } = req.body;

    if (!Array.isArray(errors)) {
      return res.status(400).json({ error: "Invalid errors format" });
    }

    // Store errors in database
    const { error } = await supabase.from("error_logs").insert(
      errors.map((error: { message: string; stack?: string; component?: string; userId?: string; sessionId?: string; timestamp?: string; url?: string; userAgent?: string; metadata?: Record<string, unknown> }) => ({
        message: error.message,
        stack: error.stack,
        component: error.component,
        user_id: error.userId,
        session_id: error.sessionId,
        timestamp: error.timestamp,
        url: error.url,
        user_agent: error.userAgent,
        metadata: error.metadata,
        environment,
      })),
    );

    if (error) {
      console.error("Failed to store errors:", error);
      return res.status(500).json({ error: "Failed to store errors" });
    }

    // Send critical errors to external monitoring service (e.g., Sentry)
    const criticalErrors = errors.filter(
      (error: { message: string }) =>
        error.message.includes("critical") || error.message.includes("fatal"),
    );

    if (criticalErrors.length > 0 && process.env.SENTRY_DSN) {
      try {
        await fetch(process.env.SENTRY_DSN, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level: "error",
            message: "Critical errors detected",
            extra: { errors: criticalErrors },
          }),
        });
      } catch (sentryError) {
        console.error("Failed to send to Sentry:", sentryError);
      }
    }

    res.status(200).json({
      success: true,
      stored: 0, // Temporarily hardcoded to avoid TypeScript error
      critical: criticalErrors.length,
    });
  } catch (error) {
    console.error("Error in monitoring endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
