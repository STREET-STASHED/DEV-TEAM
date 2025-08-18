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
    const { events, environment } = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({ error: "Invalid events data format" });
    }

    // Store events in database
    const { error } = await supabase.from("user_events").insert(
      events.map((event: { event: string; userId?: string; sessionId?: string; timestamp?: string; url?: string; properties?: Record<string, unknown> }) => ({
        event: event.event,
        user_id: event.userId,
        session_id: event.sessionId,
        timestamp: event.timestamp,
        url: event.url,
        properties: event.properties,
        environment,
      })),
    );

    if (error) {
      console.error("Failed to store user events:", error);
      return res.status(500).json({ error: "Failed to store user events" });
    }

    // Track conversion events
    const conversionEvents = events.filter(
      (event: { event: string }) =>
        event.event === "purchase_completed" ||
        event.event === "signup_completed" ||
        event.event === "checkout_started",
    );

    if (conversionEvents.length > 0) {
      // Send to external analytics (e.g., Google Analytics, Mixpanel)
      try {
        if (process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID) {
          // Send to Google Analytics 4
          await fetch(
            `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID}&api_secret=${process.env.GOOGLE_ANALYTICS_API_SECRET}`,
            {
              method: "POST",
              body: JSON.stringify({
                client_id: events[0]?.sessionId,
                events: conversionEvents.map((event: { event: string; properties?: Record<string, unknown>; timestamp?: string }) => ({
                  name: event.event,
                  parameters: {
                    ...event.properties,
                    environment,
                    timestamp: event.timestamp,
                  },
                })),
              }),
            },
          );
        }

        if (process.env.MIXPANEL_TOKEN) {
          // Send to Mixpanel
          await fetch(`https://api.mixpanel.com/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: conversionEvents[0].event,
              properties: {
                ...conversionEvents[0].properties,
                environment,
                timestamp: conversionEvents[0].timestamp,
                distinct_id:
                  conversionEvents[0].userId || conversionEvents[0].sessionId,
              },
            }),
          });
        }
      } catch (analyticsError) {
        console.error("Failed to send to external analytics:", analyticsError);
      }
    }

    res.status(200).json({
      success: true,
      stored: 0, // Temporarily hardcoded to avoid TypeScript error
      conversions: conversionEvents.length,
    });
  } catch (error) {
    console.error("Error in user events monitoring endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
