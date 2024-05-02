import { z } from "zod";

export interface Piece {
  id: number;
  title: string;
  year_published?: number;
  path: string;
  difficulty?: number;
  notes: string;
  created_at: string;
  updated_at: string;
  composers: Musician[];
  arrangers: Musician[];
  orchestrators: Musician[];
  transcribers: Musician[];
  lyricists: Musician[];
  scores: Score[];
  parts: Part[];
  setlists: Setlist[];
  tags: Tag[];
}

export const musicianSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Musician = z.infer<typeof musicianSchema>;

export interface Score {
  id: number;
  name: string;
  path?: string;
  created_at: string;
  updated_at: string;
}
export interface Part {
  id: number;
  name: string;
  path?: string;
  created_at: string;
  updated_at: string;
  piece_id: number;
  instruments: Instrument[];
}

export const instrumentSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  category: z.string().optional(),
  is_default: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Instrument = z.infer<typeof instrumentSchema>

export const tagSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Tag = z.infer<typeof tagSchema>;

export interface Ensemble {
  id: number;
  name: string;
  category: string;
  created_at: String;
  updated_at: String;
  parts?: Part[];
}

export const byteFileSchema = z.object({
  id: z.number(),
  name: z.string(),
  bytearray: z.custom<Uint8Array>((data) => data instanceof Uint8Array),
});

export type ByteFile = z.infer<typeof byteFileSchema>;

export interface Setlist {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}
