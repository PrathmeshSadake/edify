"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function LessonPlanPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [lessonPlan, setLessonPlan] = useState("");
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
      setLessonPlan(result.content);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate lesson plan"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Lesson Plan Generator</h1>

      <div className='grid gap-8 md:grid-cols-2'>
        <Card className='p-6'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <Label htmlFor='prompt'>Lesson Objectives</Label>
              <Input
                id='prompt'
                name='prompt'
                required
                placeholder='Enter lesson objectives...'
              />
            </div>

            <div>
              <Label htmlFor='grade'>Grade Level</Label>
              <Input id='grade' name='grade' placeholder='e.g., 8th Grade' />
            </div>

            <div>
              <Label htmlFor='subject'>Subject</Label>
              <Input
                id='subject'
                name='subject'
                placeholder='e.g., Mathematics'
              />
            </div>

            <div>
              <Label htmlFor='duration'>Duration</Label>
              <Input
                id='duration'
                name='duration'
                placeholder='e.g., 45 minutes'
              />
            </div>

            <Button type='submit' disabled={isLoading} className='w-full'>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Generating...
                </>
              ) : (
                "Generate Lesson Plan"
              )}
            </Button>
          </form>
        </Card>

        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Generated Lesson Plan</h2>
          {error && <div className='text-red-500 mb-4'>{error}</div>}
          {lessonPlan && (
            <div className='whitespace-pre-wrap'>{lessonPlan}</div>
          )}
        </Card>
      </div>
    </div>
  );
}
