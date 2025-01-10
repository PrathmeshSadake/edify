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
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function PromptPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [promptContent, setPromptContent] = useState<{
    instructions?: string;
    successCriteria?: string;
    keyVocabulary?: string[];
    scaffolding?: string[];
  }>({});
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      topic: formData.get("topic"),
      grade: formData.get("grade"),
      subject: formData.get("subject"),
      skillLevel: formData.get("skillLevel"),
    };

    try {
      const response = await fetch("/api/tools/prompt-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPromptContent(result.content);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate educational prompt"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      <div className='container mx-auto px-4 py-12'>
        {/* Header Section */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            Educational Prompt Generator
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Create comprehensive educational prompts tailored to your needs.
            Perfect for teachers and educators looking to generate engaging
            learning materials.
          </p>
        </div>

        <div className='grid gap-8 lg:grid-cols-2 max-w-7xl mx-auto'>
          {/* Form Card */}
          <Card className='p-8 shadow-lg hover:shadow-xl transition-shadow duration-300'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='topic' className='text-sm font-semibold'>
                  Topic
                </Label>
                <Input
                  id='topic'
                  name='topic'
                  required
                  placeholder='Enter your topic...'
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

              <div className='space-y-2'>
                <Label htmlFor='subject' className='text-sm font-semibold'>
                  Subject
                </Label>
                <Input
                  id='subject'
                  name='subject'
                  placeholder='e.g., Biology'
                  className='h-12 transition-colors focus:border-blue-400'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='skillLevel' className='text-sm font-semibold'>
                  Skill Level
                </Label>
                <Select name='skillLevel'>
                  <SelectTrigger className='h-12'>
                    <SelectValue placeholder='Select skill level' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='beginner'>Beginner</SelectItem>
                    <SelectItem value='intermediate'>Intermediate</SelectItem>
                    <SelectItem value='advanced'>Advanced</SelectItem>
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
                    Generating...
                  </>
                ) : (
                  "Generate Educational Prompt"
                )}
              </Button>
            </form>
          </Card>

          {/* Result Card */}
          <Card className='p-8 shadow-lg'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Generated Educational Prompt
            </h2>

            {error && (
              <div className='bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100'>
                <p className='font-medium'>{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className='animate-pulse space-y-6'>
                <div className='space-y-3'>
                  <div className='h-4 bg-gray-200 rounded w-1/4'></div>
                  <div className='h-4 bg-gray-200 rounded w-full'></div>
                  <div className='h-4 bg-gray-200 rounded w-5/6'></div>
                </div>
                <div className='space-y-3'>
                  <div className='h-4 bg-gray-200 rounded w-1/4'></div>
                  <div className='h-4 bg-gray-200 rounded w-full'></div>
                </div>
              </div>
            ) : promptContent.instructions ? (
              <div className='space-y-8'>
                <div className='bg-white p-6 rounded-lg border border-gray-100 shadow-sm'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                    Instructions
                  </h3>
                  <div className='prose prose-sm max-w-none text-gray-700'>
                    <ReactMarkdown>{promptContent.instructions}</ReactMarkdown>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-lg border border-gray-100 shadow-sm'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                    Success Criteria
                  </h3>
                  <div className='prose prose-sm max-w-none text-gray-700'>
                    <ReactMarkdown>
                      {promptContent.successCriteria || ""}
                    </ReactMarkdown>
                  </div>
                </div>

                <div className='bg-white p-6 rounded-lg border border-gray-100 shadow-sm'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                    Key Vocabulary
                  </h3>
                  <ul className='list-disc pl-5 space-y-2'>
                    {promptContent.keyVocabulary?.map((word, index) => (
                      <li key={index} className='text-gray-700'>
                        <ReactMarkdown>{word}</ReactMarkdown>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='bg-white p-6 rounded-lg border border-gray-100 shadow-sm'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                    Scaffolding Suggestions
                  </h3>
                  <ul className='list-disc pl-5 space-y-2'>
                    {promptContent.scaffolding?.map((step, index) => (
                      <li key={index} className='text-gray-700'>
                        <ReactMarkdown>{step}</ReactMarkdown>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className='text-center py-12 text-gray-500'>
                <p className='text-lg'>
                  Your generated educational prompt will appear here
                </p>
                <p className='text-sm mt-2'>
                  Fill out the form and click generate to get started
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
