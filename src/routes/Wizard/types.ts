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
  yearPublished: z.string().transform(
    (val, ctx) => {
      if (val === "") {
        return undefined;
      }
      const year = parseInt(val);

      if (isNaN(year)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Year must be a number",
          fatal: true,
        })
        return z.NEVER
      }
      if (year < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          message: "Year cannot be less than 1",
          fatal: true,
          minimum: 1,
          type: "number",
          inclusive: true,
        })
        return z.NEVER
      }
      if (year > 9999) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          message: "Year cannot be greater than 9999",
          fatal: true,
          maximum: 9999,
          type: "number",
          inclusive: true,
        })
        return z.NEVER
      }
      return year;
    }
  ).optional(),
  difficulty: z.number({
    invalid_type_error: "Difficulty must be a number",
  }).int().min(1).max(6).optional(),
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
