"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ClipboardCopy } from "lucide-react";
import { toast } from "sonner";

interface Criterion {
  name: string;
  description: string;
  levels: {
    level: string;
    description: string;
    points: number;
  }[];
}

export default function RubricGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [rubric, setRubric] = useState<Criterion[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      task: formData.get("task"),
      subject: formData.get("subject"),
      grade: formData.get("grade"),
      criteriaCount: Number(formData.get("criteriaCount") || 4),
    };

    try {
      const response = await fetch("/api/tools/rubric-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setRubric(result.content.criteria);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate rubric"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const rubricText = rubric
      .map((criterion) => {
        const levelsText = criterion.levels
          .map(
            (level) =>
              `${level.level} (${level.points} points): ${level.description}`
          )
          .join("\n");
        return `${criterion.name}\n${criterion.description}\n\nPerformance Levels:\n${levelsText}`;
      })
      .join("\n\n---\n\n");

    navigator.clipboard.writeText(rubricText);
    toast("The rubric has been copied to your clipboard.");
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold'>Rubric Generator</h1>
          <p className='text-muted-foreground mt-2'>
            Create detailed assessment rubrics for any subject or task
          </p>
        </div>

        <div className='grid gap-8'>
          <Card className='p-6'>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <Label htmlFor='task'>Task or Assignment</Label>
                <Input
                  id='task'
                  name='task'
                  required
                  placeholder='Describe the task to be assessed...'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='subject'>Subject</Label>
                  <Input
                    id='subject'
                    name='subject'
                    placeholder='e.g., Mathematics'
                  />
                </div>

                <div>
                  <Label htmlFor='grade'>Grade Level</Label>
                  <Input
                    id='grade'
                    name='grade'
                    placeholder='e.g., 9th Grade'
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='criteriaCount'>Number of Criteria</Label>
                <Select name='criteriaCount' defaultValue='4'>
                  <SelectTrigger>
                    <SelectValue placeholder='Select number of criteria' />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} criteria
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type='submit' disabled={isLoading} className='w-full'>
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Generating Rubric...
                  </>
                ) : (
                  "Generate Rubric"
                )}
              </Button>
            </form>
          </Card>

          {error && (
            <div className='text-red-500 p-4 bg-red-50 rounded-lg'>{error}</div>
          )}

          {rubric.length > 0 && (
            <Card className='p-6'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold'>Generated Rubric</h2>
                <Button variant='outline' onClick={copyToClipboard}>
                  <ClipboardCopy className='h-4 w-4 mr-2' />
                  Copy to Clipboard
                </Button>
              </div>

              <div className='space-y-8'>
                {rubric.map((criterion, idx) => (
                  <div key={idx} className='space-y-4'>
                    <div>
                      <h3 className='font-semibold text-lg'>
                        {criterion.name}
                      </h3>
                      <p className='text-muted-foreground'>
                        {criterion.description}
                      </p>
                    </div>

                    <div className='grid gap-4'>
                      {criterion.levels.map((level, levelIdx) => (
                        <div key={levelIdx} className='border p-4 rounded-lg'>
                          <div className='flex justify-between items-center mb-2'>
                            <span className='font-medium'>{level.level}</span>
                            <span className='text-sm text-muted-foreground'>
                              {level.points} points
                            </span>
                          </div>
                          <p>{level.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
