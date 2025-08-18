import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database: boolean;
    stripe: boolean;
    googleMaps: boolean;
    memory: boolean;
    disk: boolean;
  };
  metrics: {
    memoryUsage: number;
    diskUsage: number;
    responseTime: number;
  };
  errors: string[];
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    checks: {
      database: false,
      stripe: false,
      googleMaps: false,
      memory: false,
      disk: false,
    },
    metrics: {
      memoryUsage: 0,
      diskUsage: 0,
      responseTime: 0,
    },
    errors: [],
  };

  try {
    // Check database connectivity
    try {
      const { error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      if (error) throw error;
      healthStatus.checks.database = true;
    } catch (error) {
      healthStatus.checks.database = false;
      healthStatus.errors.push(
        `Database: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    // Check Stripe connectivity
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        await stripe.paymentMethods.list({ limit: 1 });
        healthStatus.checks.stripe = true;
      } else {
        healthStatus.checks.stripe = false;
        healthStatus.errors.push("Stripe: No API key configured");
      }
    } catch (error) {
      healthStatus.checks.stripe = false;
      healthStatus.errors.push(
        `Stripe: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    // Check Google Maps API
    try {
      if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        healthStatus.checks.googleMaps = true;
      } else {
        healthStatus.checks.googleMaps = false;
        healthStatus.errors.push("Google Maps: No API key configured");
      }
    } catch (error) {
      healthStatus.checks.googleMaps = false;
      healthStatus.errors.push(
        `Google Maps: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    // Check system resources
    try {
      if (typeof process !== "undefined") {
        const memUsage = process.memoryUsage();
        healthStatus.metrics.memoryUsage = Math.round(
          memUsage.heapUsed / 1024 / 1024,
        ); // MB
        healthStatus.checks.memory =
          memUsage.heapUsed < memUsage.heapTotal * 0.9; // Less than 90% usage

        if (!healthStatus.checks.memory) {
          healthStatus.errors.push(
            `Memory: High usage (${healthStatus.metrics.memoryUsage}MB)`,
          );
        }
      }
    } catch (error) {
      healthStatus.checks.memory = false;
      healthStatus.errors.push(
        `Memory: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    // Calculate response time
    healthStatus.metrics.responseTime = Date.now() - startTime;

    // Determine overall status
    const failedChecks = Object.values(healthStatus.checks).filter(
      (check) => !check,
    ).length;
    const totalChecks = Object.keys(healthStatus.checks).length;

    if (failedChecks === 0) {
      healthStatus.status = "healthy";
    } else if (failedChecks <= Math.ceil(totalChecks * 0.3)) {
      healthStatus.status = "degraded";
    } else {
      healthStatus.status = "unhealthy";
    }

    // Set appropriate HTTP status code
    const statusCode =
      healthStatus.status === "healthy"
        ? 200
        : healthStatus.status === "degraded"
          ? 200
          : 503;

    // Add cache headers for health checks
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.status(statusCode).json(healthStatus);
  } catch (error) {
    healthStatus.status = "unhealthy";
    healthStatus.errors.push(
      `Health check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    healthStatus.metrics.responseTime = Date.now() - startTime;

    res.status(503).json(healthStatus);
  }
}
