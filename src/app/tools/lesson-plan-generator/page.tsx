"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { LessonPlan } from "@/schemas/lesson-plan-schema";

export default function LessonPlanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      prompt: formData.get("prompt"),
      grade: formData.get("grade"),
      subject: formData.get("subject"),
      duration: formData.get("duration"),
    };

    try {
      const response = await fetch("/api/tools/lesson-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setLessonPlan(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate lesson plan"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderLessonPlanContent = () => {
    if (!lessonPlan) return null;

    const content = `
# ${lessonPlan.metadata.topic}

## Lesson Overview
**Year Group:** ${lessonPlan.metadata.yearGroup}
**Duration:** ${lessonPlan.metadata.duration} minutes
**Subject:** ${lessonPlan.metadata.subject}

## Learning Objectives
${lessonPlan.objectives.learning.map((obj) => `- ${obj}`).join("\n")}

## Success Criteria
${lessonPlan.objectives.success.map((crit) => `- ${crit}`).join("\n")}

## Lesson Structure

### Introduction (${lessonPlan.lessonStructure.introduction.duration} minutes)
${lessonPlan.lessonStructure.introduction.activities
  .map(
    (activity) => `
#### ${activity.title} (${activity.duration} minutes)
${activity.description}

Instructions:
${activity.instructions.map((inst) => `- ${inst}`).join("\n")}
${
  activity.materials
    ? `\nMaterials:\n${activity.materials.map((mat) => `- ${mat}`).join("\n")}`
    : ""
}
`
  )
  .join("\n")}

### Main Activities
${lessonPlan.lessonStructure.mainActivities
  .map(
    (activity) => `
#### ${activity.title} (${activity.duration} minutes)
${activity.description}

Instructions:
${activity.instructions.map((inst) => `- ${inst}`).join("\n")}
${
  activity.materials
    ? `\nMaterials:\n${activity.materials.map((mat) => `- ${mat}`).join("\n")}`
    : ""
}
`
  )
  .join("\n")}

### Plenary (${lessonPlan.lessonStructure.plenary.duration} minutes)
${lessonPlan.lessonStructure.plenary.activities
  .map(
    (activity) => `
#### ${activity.title} (${activity.duration} minutes)
${activity.description}

Instructions:
${activity.instructions.map((inst) => `- ${inst}`).join("\n")}
`
  )
  .join("\n")}

## Assessment
### Formative Assessment Questions
${lessonPlan.assessment.formative
  .map(
    (q) => `
- **${q.type.charAt(0).toUpperCase() + q.type.slice(1)}:** ${q.question}
${q.suggestedAnswer ? `  *Suggested Answer:* ${q.suggestedAnswer}` : ""}
`
  )
  .join("\n")}

${
  lessonPlan.assessment.summative
    ? `
### Summative Assessment Questions
${lessonPlan.assessment.summative
  .map(
    (q) => `
- **${q.type.charAt(0).toUpperCase() + q.type.slice(1)}:** ${q.question}
${q.suggestedAnswer ? `  *Suggested Answer:* ${q.suggestedAnswer}` : ""}
`
  )
  .join("\n")}`
    : ""
}

## Differentiation Strategies
${lessonPlan.differentiation.strategies
  .map(
    (strategy) => `
### For ${strategy.studentType}
- Accommodations: ${strategy.accommodations.join(", ")}
${strategy.resources ? `- Resources: ${strategy.resources.join(", ")}` : ""}
- Teaching Strategies: ${strategy.teachingStrategies.join(", ")}
`
  )
  .join("\n")}

## Cross-Curricular Links
${lessonPlan.crossCurricularLinks
  .map(
    (link) => `
- **${link.subject}:** ${link.connection}
${
  link.suggestedActivity
    ? `  *Suggested Activity:* ${link.suggestedActivity}`
    : ""
}
`
  )
  .join("\n")}

## Resources
### Required Resources
${lessonPlan.resources.required.map((resource) => `- ${resource}`).join("\n")}

${
  lessonPlan.resources.optional
    ? `
### Optional Resources
${lessonPlan.resources.optional.map((resource) => `- ${resource}`).join("\n")}
`
    : ""
}

${
  lessonPlan.resources.digital
    ? `
### Digital Resources
${lessonPlan.resources.digital.map((resource) => `- ${resource}`).join("\n")}
`
    : ""
}

${
  lessonPlan.extension
    ? `
## Extension Activities
### Enrichment Activities
${lessonPlan.extension.enrichmentActivities
  .map((activity) => `- ${activity}`)
  .join("\n")}

${
  lessonPlan.extension.homeworkIdeas
    ? `
### Homework Ideas
${lessonPlan.extension.homeworkIdeas.map((idea) => `- ${idea}`).join("\n")}
`
    : ""
}

${
  lessonPlan.extension.furtherReading
    ? `
### Further Reading
${lessonPlan.extension.furtherReading
  .map((reading) => `- ${reading}`)
  .join("\n")}
`
    : ""
}
`
    : ""
}

${
  lessonPlan.teacherNotes
    ? `
## Teacher Notes
${
  lessonPlan.teacherNotes.preparation
    ? `
### Preparation
${lessonPlan.teacherNotes.preparation.map((note) => `- ${note}`).join("\n")}
`
    : ""
}

${
  lessonPlan.teacherNotes.safetyConsiderations
    ? `
### Safety Considerations
${lessonPlan.teacherNotes.safetyConsiderations
  .map((note) => `- ${note}`)
  .join("\n")}
`
    : ""
}

${
  lessonPlan.teacherNotes.commonMisconceptions
    ? `
### Common Misconceptions
${lessonPlan.teacherNotes.commonMisconceptions
  .map((note) => `- ${note}`)
  .join("\n")}
`
    : ""
}

${
  lessonPlan.teacherNotes.tips
    ? `
### Teaching Tips
${lessonPlan.teacherNotes.tips.map((tip) => `- ${tip}`).join("\n")}
`
    : ""
}
`
    : ""
}
`;

    return content.trim();
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-12'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            Lesson Plan Generator
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Create professional lesson plans quickly and easily. Fill in the
            details below to generate a comprehensive plan for your class.
          </p>
        </div>

        <div className='grid gap-8 lg:grid-cols-2 max-w-7xl mx-auto'>
          <Card className='p-8 shadow-lg hover:shadow-xl transition-shadow duration-300'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='prompt' className='text-sm font-semibold'>
                  Lesson Objectives
                </Label>
                <Input
                  id='prompt'
                  name='prompt'
                  required
                  placeholder='Enter lesson objectives...'
                  className='h-12'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='grade' className='text-sm font-semibold'>
                  Grade Level
                </Label>
                <Input
                  id='grade'
                  name='grade'
                  placeholder='e.g., 8th Grade'
                  className='h-12'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='subject' className='text-sm font-semibold'>
                  Subject
                </Label>
                <Input
                  id='subject'
                  name='subject'
                  placeholder='e.g., Mathematics'
                  className='h-12'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='duration' className='text-sm font-semibold'>
                  Duration
                </Label>
                <Input
                  id='duration'
                  name='duration'
                  placeholder='e.g., 45 minutes'
                  className='h-12'
                />
              </div>

              <Button
                type='submit'
                disabled={isLoading}
                className='w-full h-12 text-base font-semibold transition-all duration-200 hover:scale-[1.02]'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                    Generating...
                  </>
                ) : (
                  "Generate Lesson Plan"
                )}
              </Button>
            </form>
          </Card>

          <Card className='p-8 shadow-lg h-fit'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Generated Lesson Plan
            </h2>

            {error && (
              <div className='bg-red-50 text-red-600 p-4 rounded-lg mb-4'>
                {error}
              </div>
            )}

            {isLoading ? (
              <div className='animate-pulse space-y-4'>
                <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                <div className='h-4 bg-gray-200 rounded w-full'></div>
                <div className='h-4 bg-gray-200 rounded w-5/6'></div>
                <div className='h-4 bg-gray-200 rounded w-4/5'></div>
              </div>
            ) : lessonPlan ? (
              <div className='prose prose-gray max-w-none'>
                <div className='bg-white p-6 rounded-lg border border-gray-100 shadow-sm'>
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className='text-2xl font-bold mb-4'>{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className='text-xl font-semibold mb-3'>
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className='text-lg font-medium mb-2'>{children}</h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className='text-base font-medium mb-2'>
                          {children}
                        </h4>
                      ),
                      p: ({ children }) => (
                        <p className='mb-4 text-gray-700'>{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className='list-disc pl-6 mb-4'>{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className='list-decimal pl-6 mb-4'>{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className='mb-2 text-gray-700'>{children}</li>
                      ),
                    }}
                  >
                    {renderLessonPlanContent()}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <p className='text-gray-500 text-center py-8'>
                Your generated lesson plan will appear here
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
