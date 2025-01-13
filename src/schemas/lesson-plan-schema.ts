// schemas/lesson-plan-schema.ts
import { z } from "zod";

// Schema for activity options
const ActivityOptionSchema = z.object({
  title: z.string(),
  description: z.string(),
  duration: z.number().min(1),
  instructions: z.array(z.string()),
  materials: z.array(z.string()).optional(),
  groupSize: z.number().optional(),
});

// Schema for assessment questions based on Bloom's Taxonomy
const AssessmentQuestionSchema = z.object({
  type: z.enum([
    "knowledge",
    "comprehension",
    "application",
    "analysis",
    "synthesis",
    "evaluation",
  ]),
  question: z.string(),
  suggestedAnswer: z.string().optional(),
});

// Schema for differentiation strategies
const DifferentiationStrategySchema = z.object({
  studentType: z.string(), // e.g., "dyslexia", "ADHD", "visual learners"
  accommodations: z.array(z.string()),
  resources: z.array(z.string()).optional(),
  teachingStrategies: z.array(z.string()),
});

// Schema for cross-curricular links
const CrossCurricularLinkSchema = z.object({
  subject: z.string(),
  connection: z.string(),
  suggestedActivity: z.string().optional(),
});

// Main lesson plan schema
const LessonPlanSchema = z.object({
  metadata: z.object({
    topic: z.string(),
    yearGroup: z.string(),
    duration: z.number().min(1),
    subject: z.string(),
    createdAt: z.string().datetime(),
  }),

  objectives: z.object({
    learning: z.array(z.string()),
    success: z.array(z.string()),
  }),

  lessonStructure: z.object({
    introduction: z.object({
      duration: z.number(),
      activities: z.array(ActivityOptionSchema),
      promptsForThought: z.array(z.string()),
    }),

    mainActivities: z.array(ActivityOptionSchema),

    plenary: z.object({
      duration: z.number(),
      activities: z.array(ActivityOptionSchema),
      reflectionQuestions: z.array(z.string()),
    }),
  }),

  assessment: z.object({
    formative: z.array(AssessmentQuestionSchema),
    summative: z.array(AssessmentQuestionSchema).optional(),
    successCriteria: z.array(z.string()),
  }),

  differentiation: z.object({
    strategies: z.array(DifferentiationStrategySchema),
    resources: z.array(z.string()),
    adaptations: z.record(z.string(), z.array(z.string())),
  }),

  crossCurricularLinks: z.array(CrossCurricularLinkSchema),

  resources: z.object({
    required: z.array(z.string()),
    optional: z.array(z.string()).optional(),
    digital: z.array(z.string()).optional(),
  }),

  extension: z
    .object({
      enrichmentActivities: z.array(z.string()),
      homeworkIdeas: z.array(z.string()).optional(),
      furtherReading: z.array(z.string()).optional(),
    })
    .optional(),

  teacherNotes: z
    .object({
      preparation: z.array(z.string()).optional(),
      safetyConsiderations: z.array(z.string()).optional(),
      commonMisconceptions: z.array(z.string()).optional(),
      tips: z.array(z.string()).optional(),
    })
    .optional(),
});

// Type for the lesson plan data
type LessonPlan = z.infer<typeof LessonPlanSchema>;

export { LessonPlanSchema, type LessonPlan };
