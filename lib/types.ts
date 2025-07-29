// lib/types.ts
export interface Profile {
  id: string; // must match your "id" column
  full_name: string; // must match your "full_name" column
  verified: boolean; // must match your "verified" column
  // add any other columns you select…
}
