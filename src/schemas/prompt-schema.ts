// schemas/prompt-schema.ts

import { z } from "zod";

const ComplexityLevelSchema = z.object({
  cognitiveLoad: z.number().min(1).max(5),
  bloomsLevel: z.string(),
});

const PromptExplanationSchema = z.object({
  explanation: z.string(),
  focusAreas: z.array(z.string()),
  complexityLevel: ComplexityLevelSchema,
});

const PromptRatingsSchema = z.object({
  averageRating: z.number().optional(),
  totalRatings: z.number().optional(),
});

const RefinedPromptSchema = z.object({
  promptText: z.string(),
  explanation: PromptExplanationSchema,
  ratings: PromptRatingsSchema.optional(),
});

export const PromptGeneratorResponseSchema = z.object({
  data: z.object({
    originalPrompt: z.string(),
    refinedPrompts: z.array(RefinedPromptSchema),
    metadata: z.object({
      processingTimeMs: z.number(),
      version: z.string(),
    }).optional(),
  }),
});

export type ComplexityLevel = z.infer<typeof ComplexityLevelSchema>;
export type PromptExplanation = z.infer<typeof PromptExplanationSchema>;
export type RefinedPrompt = z.infer<typeof RefinedPromptSchema>;
export type PromptGeneratorResponse = z.infer<typeof PromptGeneratorResponseSchema>;
