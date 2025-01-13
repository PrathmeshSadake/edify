// schemas/prompt-schema.ts

import { z } from "zod";


// Schema for individual prompt explanation
const PromptExplanationSchema = z.object({
  explanation: z
    .string()
    .min(1, "Explanation cannot be empty")
    .max(500, "Explanation must be less than 500 characters"),
  focusAreas: z
    .array(z.string())
    .min(1, "At least one focus area must be specified"),
  complexityLevel: z.object({
    bloomsLevel: z.enum([
      "Knowledge",
      "Comprehension",
      "Application",
      "Analysis",
      "Synthesis",
      "Evaluation",
    ]),
    cognitiveLoad: z.number().min(1).max(5),
  }),
});

// Schema for individual refined prompt
const RefinedPromptSchema = z.object({
  promptText: z
    .string()
    .min(10, "Prompt must be at least 10 characters")
    .max(1000, "Prompt must be less than 1000 characters"),
  explanation: PromptExplanationSchema,
  ratings: z
    .object({
      averageRating: z.number().min(0).max(5).optional(),
      totalRatings: z.number().min(0).optional(),
    })
    .optional(),
});

// Main response schema
export const PromptGeneratorResponseSchema = z.object({
  originalPrompt: z
    .string()
    .min(1, "Original prompt cannot be empty")
    .max(500, "Original prompt must be less than 500 characters"),
  refinedPrompts: z
    .array(RefinedPromptSchema)
    .length(3, "Must provide exactly three refined prompts"),
  metadata: z.object({
    generatedAt: z.string().datetime(),
    version: z.string(),
    processingTimeMs: z.number().positive(),
  }),
});

// Type inference
export type PromptGeneratorResponse = z.infer<
  typeof PromptGeneratorResponseSchema
>;
