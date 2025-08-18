import type { NextApiRequest, NextApiResponse } from "next";
import { createServerClient } from "@supabase/ssr";
import * as cookie from "cookie";

export function createSupabaseServerClient(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies[name],
        set: (name, value, options) => {
          const serialized = cookie.serialize(name, value, options);
          const current = res.getHeader("Set-Cookie");
          if (!current) res.setHeader("Set-Cookie", serialized);
          else if (Array.isArray(current))
            res.setHeader("Set-Cookie", [...current, serialized]);
          else res.setHeader("Set-Cookie", [String(current), serialized]);
        },
        remove: (name, options) => {
          const serialized = cookie.serialize(name, "", {
            ...options,
            maxAge: 0,
          });
          const current = res.getHeader("Set-Cookie");
          if (!current) res.setHeader("Set-Cookie", serialized);
          else if (Array.isArray(current))
            res.setHeader("Set-Cookie", [...current, serialized]);
          else res.setHeader("Set-Cookie", [String(current), serialized]);
        },
      },
    },
  );
}
