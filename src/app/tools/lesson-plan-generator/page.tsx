"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

import type { LessonPlan } from "@/schemas/lesson-plan-schema";

// Helper function to check if an array is empty or undefined
const hasItems = (arr: any[] | undefined | null) => arr && arr.length > 0;

// Helper function to check if an object has any non-null properties
const hasContent = (obj: any | undefined | null) => {
  if (!obj) return false;
  return Object.values(obj).some(
    (value) => value !== null && value !== undefined && value !== ""
  );
};

const MetadataSection = ({
  metadata,
}: {
  metadata: LessonPlan["metadata"];
}) => {
  if (!metadata) return null;
  return (
    <div className='mb-6'>
      <h3 className='text-xl font-semibold mb-3'>Lesson Overview</h3>
      <div className='grid grid-cols-2 gap-4'>
        {metadata.topic && (
          <div>
            <span className='font-medium'>Topic:</span> {metadata.topic}
          </div>
        )}
        {metadata.yearGroup && (
          <div>
            <span className='font-medium'>Year Group:</span>{" "}
            {metadata.yearGroup}
          </div>
        )}
        {metadata.duration && (
          <div>
            <span className='font-medium'>Duration:</span> {metadata.duration}{" "}
            minutes
          </div>
        )}
        {metadata.subject && (
          <div>
            <span className='font-medium'>Subject:</span> {metadata.subject}
          </div>
        )}
      </div>
    </div>
  );
};

const ObjectivesSection = ({
  objectives,
}: {
  objectives: LessonPlan["objectives"];
}) => {
  if (!objectives) return null;
  return (
    <div className='mb-6'>
      <h3 className='text-xl font-semibold mb-3'>Objectives</h3>
      {hasItems(objectives.learning) && (
        <div className='mb-4'>
          <h4 className='font-medium mb-2'>Learning Objectives:</h4>
          <ul className='list-disc pl-6'>
            {objectives.learning?.map((obj, idx) => (
              <li key={idx}>{obj}</li>
            ))}
          </ul>
        </div>
      )}
      {hasItems(objectives.success) && (
        <div>
          <h4 className='font-medium mb-2'>Success Criteria:</h4>
          <ul className='list-disc pl-6'>
            {objectives.success?.map((criteria, idx) => (
              <li key={idx}>{criteria}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ActivitySection = ({ activity }: { activity: any }) => {
  if (!activity) return null;
  return (
    <div className='mb-4'>
      {activity.title && <h4 className='font-medium'>{activity.title}</h4>}
      {activity.description && (
        <p className='text-gray-600 mb-2'>{activity.description}</p>
      )}
      {activity.duration && (
        <p className='text-sm text-gray-500'>
          Duration: {activity.duration} minutes
        </p>
      )}
      {hasItems(activity.instructions) && (
        <div className='mt-2'>
          <h5 className='font-medium'>Instructions:</h5>
          <ul className='list-decimal pl-6'>
            {activity.instructions?.map((instruction: string, idx: number) => (
              <li key={idx}>{instruction}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const LessonStructureSection = ({
  lessonStructure,
}: {
  lessonStructure: LessonPlan["lessonStructure"];
}) => {
  if (!lessonStructure) return null;
  return (
    <div className='mb-6'>
      <h3 className='text-xl font-semibold mb-3'>Lesson Structure</h3>

      {hasContent(lessonStructure.introduction) && (
        <div className='mb-4'>
          <h4 className='font-medium mb-2'>Introduction</h4>
          {hasItems(lessonStructure.introduction?.activities) && (
            <div className='pl-4'>
              {lessonStructure.introduction?.activities?.map(
                (activity, idx) => (
                  <ActivitySection key={idx} activity={activity} />
                )
              )}
            </div>
          )}
        </div>
      )}

      {hasItems(lessonStructure.mainActivities) && (
        <div className='mb-4'>
          <h4 className='font-medium mb-2'>Main Activities</h4>
          <div className='pl-4'>
            {lessonStructure.mainActivities?.map((activity, idx) => (
              <ActivitySection key={idx} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {hasContent(lessonStructure.plenary) && (
        <div>
          <h4 className='font-medium mb-2'>Plenary</h4>
          {hasItems(lessonStructure.plenary?.activities) && (
            <div className='pl-4'>
              {lessonStructure.plenary?.activities?.map((activity, idx) => (
                <ActivitySection key={idx} activity={activity} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AssessmentSection = ({
  assessment,
}: {
  assessment: LessonPlan["assessment"];
}) => {
  if (!assessment) return null;
  return (
    <div className='mb-6'>
      <h3 className='text-xl font-semibold mb-3'>Assessment</h3>
      {hasItems(assessment.formative) && (
        <div className='mb-4'>
          <h4 className='font-medium mb-2'>Formative Assessment</h4>
          {assessment.formative?.map((item, idx) => (
            <div key={idx} className='mb-3'>
              {item.type && (
                <span className='text-sm text-gray-500'>[{item.type}]</span>
              )}
              {item.question && <p className='font-medium'>{item.question}</p>}
              {item.suggestedAnswer && (
                <p className='text-gray-600'>Answer: {item.suggestedAnswer}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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
                  <MetadataSection metadata={lessonPlan.metadata} />
                  <ObjectivesSection objectives={lessonPlan.objectives} />
                  <LessonStructureSection
                    lessonStructure={lessonPlan.lessonStructure}
                  />
                  <AssessmentSection assessment={lessonPlan.assessment} />
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
