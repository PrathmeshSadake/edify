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
import {
  Loader2,
  ClipboardCopy,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
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
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setCopied(false);

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
      toast.success("Rubric generated successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate rubric"
      );
      toast.error("Failed to generate rubric");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
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

    try {
      await navigator.clipboard.writeText(rubricText);
      setCopied(true);
      toast.success("Rubric copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      <div className='container mx-auto px-4 py-12'>
        <div className='max-w-4xl mx-auto'>
          {/* Header Section */}
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>
              Rubric Generator
            </h1>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Create detailed assessment rubrics tailored to your educational
              needs. Perfect for teachers and educators looking to standardize
              their grading process.
            </p>
          </div>

          <div className='grid gap-8'>
            {/* Form Card */}
            <Card className='p-8 shadow-lg hover:shadow-xl transition-shadow duration-300'>
              <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='space-y-2'>
                  <Label htmlFor='task' className='text-sm font-semibold'>
                    Task or Assignment
                  </Label>
                  <Input
                    id='task'
                    name='task'
                    required
                    placeholder='Describe the task to be assessed...'
                    className='h-12 transition-colors focus:border-blue-400'
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='subject' className='text-sm font-semibold'>
                      Subject
                    </Label>
                    <Input
                      id='subject'
                      name='subject'
                      placeholder='e.g., Mathematics'
                      className='h-12 transition-colors focus:border-blue-400'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='grade' className='text-sm font-semibold'>
                      Grade Level
                    </Label>
                    <Input
                      id='grade'
                      name='grade'
                      placeholder='e.g., 9th Grade'
                      className='h-12 transition-colors focus:border-blue-400'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='criteriaCount'
                    className='text-sm font-semibold'
                  >
                    Number of Criteria
                  </Label>
                  <Select name='criteriaCount' defaultValue='4'>
                    <SelectTrigger className='h-12'>
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

                <Button
                  type='submit'
                  disabled={isLoading}
                  className='w-full h-12 text-base font-semibold transition-all duration-200 hover:scale-[1.02]'
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                      Generating Rubric...
                    </>
                  ) : (
                    "Generate Rubric"
                  )}
                </Button>
              </form>
            </Card>

            {error && (
              <div className='bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center'>
                <AlertCircle className='h-5 w-5 mr-2 flex-shrink-0' />
                <p>{error}</p>
              </div>
            )}

            {/* Result Card */}
            {rubric.length > 0 && (
              <Card className='p-8 shadow-lg'>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-2xl font-bold text-gray-900'>
                    Generated Rubric
                  </h2>
                  <Button
                    variant='outline'
                    onClick={copyToClipboard}
                    className='transition-all duration-200 hover:scale-[1.02]'
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className='h-4 w-4 mr-2 text-green-500' />
                        Copied!
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className='h-4 w-4 mr-2' />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>

                <div className='space-y-8'>
                  {rubric.map((criterion, idx) => (
                    <div
                      key={idx}
                      className='bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200'
                    >
                      <div className='mb-4'>
                        <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                          {criterion.name}
                        </h3>
                        <p className='text-gray-600'>{criterion.description}</p>
                      </div>

                      <div className='grid gap-4'>
                        {criterion.levels.map((level, levelIdx) => (
                          <div
                            key={levelIdx}
                            className='border border-gray-100 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200'
                          >
                            <div className='flex justify-between items-center mb-2'>
                              <span className='font-medium text-gray-900'>
                                {level.level}
                              </span>
                              <span className='text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-full'>
                                {level.points} points
                              </span>
                            </div>
                            <p className='text-gray-600'>{level.description}</p>
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
    </div>
  );
}
