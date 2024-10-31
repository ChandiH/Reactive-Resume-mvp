import { defaultResumeData, idSchema, resumeDataSchema } from "@reactive-resume/schema";
import { createZodDto } from "nestjs-zod/dto";
import { z } from "nestjs-zod/z";

export const resumeSchema = z.object({
  id: idSchema,
  title: z.string(),
  slug: z.string(),
  data: resumeDataSchema.default(defaultResumeData),
  visibility: z.enum(["private", "public"]).default("private"),
  locked: z.boolean().default(false),
  createdAt: z.date().or(z.dateString()),
  updatedAt: z.date().or(z.dateString()),
});

export class ResumeDto extends createZodDto(resumeSchema) {}
