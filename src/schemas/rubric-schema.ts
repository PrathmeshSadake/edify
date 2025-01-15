// schemas/rubric-schema.ts
import { z } from "zod";

const FeedbackByLevelSchema = z.object({
  text: z.string(),
  suggestions: z.array(z.string()),
  actionableSteps: z.array(z.string()),
});

const CriterionSchema = z.object({
  name: z.string(),
  description: z.string(),
  feedbackByLevel: z.record(z.string(), FeedbackByLevelSchema),
});

const InstructionsSchema = z.object({
  teacher: z.array(z.string()),
  peer: z.array(z.string()).optional(),
  self: z.array(z.string()).optional(),
});

const RubricSchema = z.object({
  criteria: z.array(CriterionSchema),
  instructions: InstructionsSchema,
});

export const RubricResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    metadata: z.object({
      assignmentType: z.string(),
      keyStage: z.string(),
      yearGroup: z.number(),
      assessmentType: z.string(),
    }),
    rubric: RubricSchema,
    createdAt: z.string(),
    version: z.string(),
  }),
});

export type FeedbackByLevel = z.infer<typeof FeedbackByLevelSchema>;
export type Criterion = z.infer<typeof CriterionSchema>;
export type Instructions = z.infer<typeof InstructionsSchema>;
export type Rubric = z.infer<typeof RubricSchema>;
export type RubricResponse = z.infer<typeof RubricResponseSchema>;
