// pages/api/admin/users.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient } from "../../../lib/supabaseServer";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { z } from "zod";

const UpdateUserSchema = z.object({
  role: z.enum(["buyer", "seller", "stylist", "driver", "admin"]),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "PATCH") {
    res.setHeader("Allow", ["GET", "PATCH"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const supabase = createSupabaseServerClient(req, res);

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    switch (req.method) {
      case "GET":
        return handleGetUsers(req, res, supabase as unknown as SupabaseClient<Database>);
      case "PATCH":
        return handleUpdateUser(req, res, supabase as unknown as SupabaseClient<Database>);
      default:
        res.setHeader("Allow", ["GET", "PATCH"]);
        return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Admin users handler error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGetUsers(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: SupabaseClient<Database>,
) {
  try {
    const { role } = req.query;

    let query = supabase.from("profiles").select(`
        id,
        full_name,
        email,
        role,
        created_at,
        verification_url
      `);

    if (typeof role === "string") {
      query = query.eq("role", role);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ users: data || [] });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ error: errorMessage });
  }
}

async function handleUpdateUser(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: SupabaseClient<Database>,
) {
  try {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Validate input
    const parsed = UpdateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join("; ");
      return res.status(400).json({ error: `Invalid payload: ${msg}` });
    }

    const input = parsed.data;

    // Update user profile
    const { data: updatedUser, error } = await supabase
      .from("profiles")
      .update({
        role: input.role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ user: updatedUser });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ error: errorMessage });
  }
}
