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

export default function PEELPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [peelContent, setPeelContent] = useState<{
    point?: string;
    evidence?: string;
    explanation?: string;
    link?: string;
  }>({});
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

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>PEEL Paragraph Generator</h1>

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
              <Label htmlFor='subject'>Subject</Label>
              <Input id='subject' name='subject' placeholder='e.g., History' />
            </div>

            <div>
              <Label htmlFor='complexity'>Complexity Level</Label>
              <Select name='complexity'>
                <SelectTrigger>
                  <SelectValue placeholder='Select complexity' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='basic'>Basic</SelectItem>
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
                "Generate PEEL Paragraph"
              )}
            </Button>
          </form>
        </Card>

        <Card className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>
            Generated PEEL Paragraph
          </h2>
          {error && <div className='text-red-500 mb-4'>{error}</div>}
          {peelContent.point && (
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold'>Point</h3>
                <p>{peelContent.point}</p>
              </div>
              <div>
                <h3 className='font-semibold'>Evidence</h3>
                <p>{peelContent.evidence}</p>
              </div>
              <div>
                <h3 className='font-semibold'>Explanation</h3>
                <p>{peelContent.explanation}</p>
              </div>
              <div>
                <h3 className='font-semibold'>Link</h3>
                <p>{peelContent.link}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
