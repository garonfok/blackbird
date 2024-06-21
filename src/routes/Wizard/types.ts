import { byteFileSchema, instrumentSchema, musicianSchema, tagSchema } from "@/app/types";
import { z } from "zod";

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
  yearPublished: z.number().nullish(),
  difficulty: z.number().nullish(),
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
