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
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Educational Prompt Generator</h1>

      <div className='grid gap-8 md:grid-cols-2'>
        <Card className='p-6'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <Label htmlFor='topic'>Topic</Label>
              <Input
                id='topic'
                name='topic'
                required
                placeholder='Enter your topic...'
              />
            </div>

            <div>
              <Label htmlFor='grade'>Grade Level</Label>
              <Input id='grade' name='grade' placeholder='e.g., 9th Grade' />
            </div>

            <div>
              <Label htmlFor='subject'>Subject</Label>
              <Input id='subject' name='subject' placeholder='e.g., Biology' />
            </div>

            <div>
              <Label htmlFor='skillLevel'>Skill Level</Label>
              <Select name='skillLevel'>
                <SelectTrigger>
                  <SelectValue placeholder='Select skill level' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='beginner'>Beginner</SelectItem>
                  <SelectItem value='intermediate'>Intermediate</SelectItem>
                  <SelectItem value='advanced'>Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type='submit' disabled={isLoading} className='w-full'>
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Generating...
                </>
              ) : (
                "Generate Educational Prompt"
              )}
            </Button>
          </form>
        </Card>

        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>
            Generated Educational Prompt
          </h2>
          {error && <div className='text-red-500 mb-4'>{error}</div>}
          {promptContent.instructions && (
            <div className='space-y-6'>
              <div>
                <h3 className='font-semibold'>Instructions</h3>
                <p>{promptContent.instructions}</p>
              </div>
              <div>
                <h3 className='font-semibold'>Success Criteria</h3>
                <p>{promptContent.successCriteria}</p>
              </div>
              <div>
                <h3 className='font-semibold'>Key Vocabulary</h3>
                <ul className='list-disc pl-4'>
                  {promptContent.keyVocabulary?.map((word, index) => (
                    <li key={index}>{word}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className='font-semibold'>Scaffolding Suggestions</h3>
                <ul className='list-disc pl-4'>
                  {promptContent.scaffolding?.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
