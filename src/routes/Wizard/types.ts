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
  yearPublished: z.coerce.number().positive().int().min(1, {
    message: "Year cannot be less than 1",
  }).max(9999, {
    message: "Year cannot be greater than 9999",
  }).optional(),
  difficulty: z.number({
    invalid_type_error: "Difficulty must be a number",
  }).int().min(1).max(6).optional(),
  notes: z.string().optional(),
  tags: z.array(tagSchema),
  composers: z.array(musicianSchema).min(1, {
    message: "At least one composer is required",
  }),
  arrangers: z.array(musicianSchema),
  orchestrators: z.array(musicianSchema),
  transcribers: z.array(musicianSchema),
  lyricists: z.array(musicianSchema),
  parts: z.array(partFormSchema),
  scores: z.array(scoreFormSchema)
})
