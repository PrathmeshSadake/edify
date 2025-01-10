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
  BookOpen,
  Brain,
  Link as LinkIcon,
  FileText,
} from "lucide-react";

interface PEELContent {
  point?: string;
  evidence?: string;
  explanation?: string;
  link?: string;
}

export default function PEELPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [peelContent, setPeelContent] = useState<PEELContent>({});
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      topic: formData.get("topic"),
      subject: formData.get("subject"),
      complexity: formData.get("complexity"),
    };

    try {
      const response = await fetch("/api/tools/peel-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPeelContent(result.content);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate PEEL paragraph"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderPEELSection = (
    title: string,
    content: string | undefined,
    icon: React.ReactNode,
    iconColor: string
  ) => (
    <div className='bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200'>
      <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center'>
        <div className={`mr-2 ${iconColor}`}>{icon}</div>
        {title}
      </h3>
      <p className='text-gray-700 leading-relaxed whitespace-pre-line'>
        {content}
      </p>
    </div>
  );

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      <div className='container mx-auto px-4 py-12'>
        {/* Header Section */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            PEEL Paragraph Generator
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Generate well-structured paragraphs using the PEEL (Point, Evidence,
            Explanation, Link) format to enhance your writing and argumentation.
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
                <Label htmlFor='subject' className='text-sm font-semibold'>
                  Subject
                </Label>
                <Input
                  id='subject'
                  name='subject'
                  placeholder='e.g., History'
                  className='h-12 transition-colors focus:border-blue-400'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='complexity' className='text-sm font-semibold'>
                  Complexity Level
                </Label>
                <Select name='complexity'>
                  <SelectTrigger className='h-12'>
                    <SelectValue placeholder='Select complexity level' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='basic'>Basic</SelectItem>
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
                  "Generate PEEL Paragraph"
                )}
              </Button>
            </form>
          </Card>

          {/* Result Card */}
          <Card className='p-8 shadow-lg'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6 flex items-center'>
              <FileText className='mr-2 h-6 w-6' />
              Generated PEEL Paragraph
            </h2>

            {error && (
              <div className='bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100'>
                <p className='font-medium'>{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className='animate-pulse space-y-6'>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className='space-y-3'>
                    <div className='h-4 bg-gray-200 rounded w-1/4'></div>
                    <div className='h-4 bg-gray-200 rounded w-full'></div>
                    <div className='h-4 bg-gray-200 rounded w-5/6'></div>
                  </div>
                ))}
              </div>
            ) : peelContent.point ? (
              <div className='space-y-6'>
                {renderPEELSection(
                  "Point",
                  peelContent.point,
                  <Brain className='h-5 w-5' />,
                  "text-blue-500"
                )}
                {renderPEELSection(
                  "Evidence",
                  peelContent.evidence,
                  <BookOpen className='h-5 w-5' />,
                  "text-green-500"
                )}
                {renderPEELSection(
                  "Explanation",
                  peelContent.explanation,
                  <FileText className='h-5 w-5' />,
                  "text-purple-500"
                )}
                {renderPEELSection(
                  "Link",
                  peelContent.link,
                  <LinkIcon className='h-5 w-5' />,
                  "text-orange-500"
                )}
              </div>
            ) : (
              <div className='text-center py-12 text-gray-500'>
                <FileText className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p className='text-lg'>
                  Your generated PEEL paragraph will appear here
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
