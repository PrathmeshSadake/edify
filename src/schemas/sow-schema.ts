import { z } from "zod";

const LessonSchema = z.object({
  lessonNumber: z.number(),
  duration: z.number(),
  learningObjectives: z.array(z.string()),
  activities: z.array(z.object({
    title: z.string(),
    description: z.string(),
    duration: z.number(),
    resources: z.array(z.string()).optional(),
  })),
  assessment: z.array(z.string()).optional(),
  differentiation: z.object({
    support: z.array(z.string()).optional(),
    core: z.array(z.string()).optional(),
    extension: z.array(z.string()).optional(),
  }).optional(),
});

const MetadataSchema = z.object({
  author: z.string(),
  createdAt: z.string(),
  version: z.string(),
});

export const SOWSchema = z.object({
  data: z.object({
    subject: z.string(),
    topic: z.string(),
    ageGroup: z.object({
      year: z.number(),
      ageRange: z.tuple([z.number(), z.number()]),
    }),
    overarchingObjectives: z.array(z.string()),
    lessons: z.array(LessonSchema),
    metadata: MetadataSchema,
  }),
});

export type Lesson = z.infer<typeof LessonSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
export type SOW = z.infer<typeof SOWSchema>;
