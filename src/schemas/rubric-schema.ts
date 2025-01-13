// schemas/rubric-schema.ts
import { z } from "zod";

// Enums for fixed values
export const AssignmentTypeEnum = z.enum([
  "analytical_essay",
  "debate",
  "research_project",
  "presentation",
  "other",
]);

export const KeyStageEnum = z.enum(["ks3", "ks4", "ks5"]);

export const AssessmentTypeEnum = z.enum(["teacher", "peer", "self"]);

export const PerformanceLevelEnum = z.enum([
  "advanced",
  "proficient",
  "developing",
  "needs_improvement",
]);

// Schema for feedback comments at each performance level
const FeedbackCommentSchema = z.object({
  text: z.string().min(1),
  suggestions: z.array(z.string()),
  actionableSteps: z.array(z.string()),
});

// Schema for each criterion
const CriterionSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  feedbackByLevel: z.record(PerformanceLevelEnum, FeedbackCommentSchema),
});

// Request Schema
export const RubricRequestSchema = z.object({
  assignmentType: AssignmentTypeEnum,
  customAssignmentType: z.string().optional(),
  keyStage: KeyStageEnum,
  yearGroup: z.number().min(7).max(13),
  assessmentType: AssessmentTypeEnum,
  criteria: z.array(z.string()).min(1).max(6),
  additionalInstructions: z.string().optional(),
});

// Response Schema
export const RubricResponseSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  metadata: z.object({
    assignmentType: AssignmentTypeEnum,
    customAssignmentType: z.string().optional(),
    keyStage: KeyStageEnum,
    yearGroup: z.number(),
    assessmentType: AssessmentTypeEnum,
  }),
  rubric: z.object({
    criteria: z.array(CriterionSchema),
    instructions: z.object({
      teacher: z.array(z.string()),
      peer: z.array(z.string()).optional(),
      self: z.array(z.string()).optional(),
    }),
    reflectionPrompts: z.array(z.string()),
  }),
  version: z.number().default(1),
});

// Example type usage
export type RubricRequest = z.infer<typeof RubricRequestSchema>;
export type RubricResponse = z.infer<typeof RubricResponseSchema>;

// Helper function to validate request
export const validateRubricRequest = (data: unknown): RubricRequest => {
  return RubricRequestSchema.parse(data);
};

// Helper function to validate response
export const validateRubricResponse = (data: unknown): RubricResponse => {
  return RubricResponseSchema.parse(data);
};
