// schemas/lesson-plan-schema.ts
import { z } from "zod";

export const LessonPlanSchema = z.object({
  metadata: z.object({
    topic: z.string(),
    yearGroup: z.string(),
    subject: z.string(),
    duration: z.string(),
  }),
  objectives: z.object({
    learning: z.array(z.string()),
    success: z.array(z.string()),
  }),
  lessonStructure: z.object({
    introduction: z.object({
      duration: z.number(),
      activities: z.array(z.object({
        title: z.string(),
        description: z.string(),
        duration: z.number(),
      })),
    }),
    mainActivities: z.array(z.object({
      title: z.string(),
      description: z.string(),
      duration: z.number(),
    })),
    plenary: z.object({
      duration: z.number(),
      activities: z.array(z.object({
        title: z.string(),
        description: z.string(),
        duration: z.number(),
      })),
    }),
  }),
  assessment: z.object({
    formative: z.array(z.object({
      type: z.string(),
      description: z.string(),
    })),
  }),
  resources: z.array(z.string()),
});

export type LessonPlan = z.infer<typeof LessonPlanSchema>;
