// pages/api/items.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseServerClient } from "../../lib/supabaseServer";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { z } from "zod";

const CreateItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
  description: z.string().optional(),
  // Accept image url from client, map to image_url in DB
  image: z.string().url().optional(),
  // Keep seller_id optional placeholder for future; we derive from user
  category: z.string().optional(),
});

const UpdateItemSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  price: z.number().positive("Price must be positive").optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const supabase = createSupabaseServerClient(req, res);

  // Auth check
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  switch (req.method) {
    case "GET":
      return handleGetItems(req, res, supabase as unknown as SupabaseClient<Database>);
    case "POST":
      return handleCreateItem(req, res, supabase as unknown as SupabaseClient<Database>, user);
    case "PATCH":
      return handleUpdateItem(req, res, supabase as unknown as SupabaseClient<Database>, user);
    default:
      res.setHeader("Allow", ["GET", "POST", "PATCH"]);
      return res.status(405).json({ error: "Method Not Allowed" });
  }
}

async function handleGetItems(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: SupabaseClient<Database>,
) {
  try {
    const { seller_id } = req.query as { seller_id?: string };

    let query = supabase
      .from("products")
      .select("*");

    if (typeof seller_id === "string") {
      query = query.eq("seller_id", seller_id);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ items: data || [] });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ error: errorMessage });
  }
}

async function handleCreateItem(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: SupabaseClient<Database>,
  user: { id: string },
) {
  try {
    // Validate input
    const parsed = CreateItemSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join("; ");
      return res.status(400).json({ error: `Invalid payload: ${msg}` });
    }

    const input = parsed.data;

    // Create product (map image -> image_url)
    const { data: item, error } = await supabase
      .from("products")
      .insert({
        name: input.name,
        price: input.price,
        description: input.description ?? null,
        image_url: input.image ?? null,
        seller_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ item });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ error: errorMessage });
  }
}

async function handleUpdateItem(
  req: NextApiRequest,
  res: NextApiResponse,
  supabase: SupabaseClient<Database>,
  _user: { id: string },
) {
  try {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Item ID is required" });
    }

    // Validate input
    const parsed = UpdateItemSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join("; ");
      return res.status(400).json({ error: `Invalid payload: ${msg}` });
    }

    const input = parsed.data;

    // Update product
    const { data: item, error } = await supabase
      .from("products")
      .update({
        name: input.name,
        price: input.price,
        description: input.description ?? null,
        image_url: input.image ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ item });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Server error";
    return res.status(500).json({ error: errorMessage });
  }
}
