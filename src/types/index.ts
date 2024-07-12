import { z } from "zod";

export const musicianSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});


export const instrumentSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  category: z.string().optional(),
  is_default: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});


export const tagSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const byteFileSchema = z.object({
  id: z.number(),
  name: z.string(),
  bytearray: z.custom<Uint8Array>((data) => data instanceof Uint8Array),
});

export const partFormSchema = z.object({
  id: z.number(),
  name: z.string().min(1, {
    message: "Name is required",
  }),
  instruments: z.array(instrumentSchema),
  file: byteFileSchema.optional(),
})

export const scoreFormSchema = z.object({
  id: z.number(),
  name: z.string().min(1, {
    message: "Name is required",
  }),
  file: byteFileSchema.optional(),
})

export const pieceFormSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  yearPublished: z.number().optional(),
  difficulty: z.number().optional(),
  notes: z.string(),
  tags: z.array(tagSchema),
  composers: z.array(musicianSchema).nonempty({
    message: "At least one composer is required",
  }),
  arrangers: z.array(musicianSchema),
  orchestrators: z.array(musicianSchema),
  transcribers: z.array(musicianSchema),
  lyricists: z.array(musicianSchema),
  parts: z.array(partFormSchema),
  scores: z.array(scoreFormSchema)
})

export type ByteFile = z.infer<typeof byteFileSchema>;
export type Musician = z.infer<typeof musicianSchema>;
export type Instrument = z.infer<typeof instrumentSchema>;
export type Tag = z.infer<typeof tagSchema>;

export type Score = {
  id: number;
  name: string;
  path?: string;
  created_at: string;
  updated_at: string;
}

export type Part = {
  id: number;
  name: string;
  path?: string;
  created_at: string;
  updated_at: string;
  piece_id: number;
  instruments: Instrument[];
}

export type Setlist = {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export type Piece = {
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


export type PartForm = z.infer<typeof partFormSchema>;
export type ScoreForm = z.infer<typeof scoreFormSchema>;
export type PieceForm = z.infer<typeof pieceFormSchema>;
