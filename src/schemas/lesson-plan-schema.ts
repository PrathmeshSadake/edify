// schemas/lesson-plan-schema.ts
import { z } from "zod";

// Schema for activity options
const ActivityOptionSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  duration: z.number().min(1).optional(),
  instructions: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional().optional(),
  groupSize: z.number().optional().optional(),
});

// Schema for assessment questions based on Bloom's Taxonomy
const AssessmentQuestionSchema = z.object({
  type: z
    .enum([
      "knowledge",
      "comprehension",
      "application",
      "analysis",
      "synthesis",
      "evaluation",
    ])
    .optional(),
  question: z.string().optional(),
  suggestedAnswer: z.string().optional(),
});

// Schema for differentiation strategies
const DifferentiationStrategySchema = z.object({
  studentType: z.string().optional(), // e.g..optional(), "dyslexia".optional(), "ADHD".optional(), "visual learners"
  accommodations: z.array(z.string()).optional(),
  resources: z.array(z.string()).optional(),
  teachingStrategies: z.array(z.string()).optional(),
});

// Schema for cross-curricular links
const CrossCurricularLinkSchema = z.object({
  subject: z.string().optional(),
  connection: z.string().optional(),
  suggestedActivity: z.string().optional(),
});

// Main lesson plan schema
const LessonPlanSchema = z.object({
  metadata: z
    .object({
      topic: z.string().optional(),
      yearGroup: z.string().optional(),
      duration: z.number().min(1).optional(),
      subject: z.string().optional(),
      createdAt: z.string().datetime().optional(),
    })
    .optional(),

  objectives: z
    .object({
      learning: z.array(z.string()).optional(),
      success: z.array(z.string()).optional(),
    })
    .optional(),

  lessonStructure: z
    .object({
      introduction: z
        .object({
          duration: z.number().optional(),
          activities: z.array(ActivityOptionSchema).optional(),
          promptsForThought: z.array(z.string()).optional(),
        })
        .optional(),

      mainActivities: z.array(ActivityOptionSchema).optional(),

      plenary: z
        .object({
          duration: z.number().optional(),
          activities: z.array(ActivityOptionSchema).optional(),
          reflectionQuestions: z.array(z.string()).optional(),
        })
        .optional(),
    })
    .optional(),

  assessment: z
    .object({
      formative: z.array(AssessmentQuestionSchema).optional(),
      summative: z.array(AssessmentQuestionSchema).optional(),
      successCriteria: z.array(z.string()).optional(),
    })
    .optional(),

  differentiation: z
    .object({
      strategies: z.array(DifferentiationStrategySchema).optional(),
      resources: z.array(z.string()).optional(),
      adaptations: z
        .record(z.string().optional(), z.array(z.string()))
        .optional(),
    })
    .optional(),

  crossCurricularLinks: z.array(CrossCurricularLinkSchema).optional(),

  resources: z
    .object({
      required: z.array(z.string()).optional(),
      optional: z.array(z.string()).optional(),
      digital: z.array(z.string()).optional(),
    })
    .optional(),

  extension: z
    .object({
      enrichmentActivities: z.array(z.string()).optional(),
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
