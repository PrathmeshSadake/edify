"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { PromptGeneratorResponse } from "@/schemas/prompt-schema";

export default function PromptGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [promptResponse, setPromptResponse] = useState<PromptGeneratorResponse | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      originalPrompt: formData.get("originalPrompt"),
      grade: formData.get("grade"),
      subject: formData.get("subject"),
      skillLevel: formData.get("skillLevel"),
    };

    // Validate required fields
    if (!data.originalPrompt) {
      setError("Please enter an original prompt");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/tools/prompt-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPromptResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate prompts");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Educational Prompt Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate differentiated educational prompts with various complexity levels
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-7xl mx-auto">
          {/* Form Card */}
          <Card className="p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="originalPrompt">Original Prompt</Label>
                <Textarea
                  id="originalPrompt"
                  name="originalPrompt"
                  required
                  placeholder="Enter your prompt..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade Level (Optional)</Label>
                <Input
                  id="grade"
                  name="grade"
                  placeholder="e.g., 9th Grade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="e.g., Mathematics"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skillLevel">Skill Level</Label>
                <Select name="skillLevel" defaultValue="intermediate">
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Prompts"
                )}
              </Button>

              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                  {error}
                </div>
              )}
            </form>
          </Card>

          {/* Results Card */}
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Generated Prompts
            </h2>

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : promptResponse?.data ? (
              <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Original Prompt
                  </h3>
                  <p className="text-gray-700">
                    {promptResponse.data.originalPrompt}
                  </p>
                </div>

                {promptResponse.data.refinedPrompts.map((prompt, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-lg border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        Refined Version {index + 1}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Cognitive Load: {prompt.explanation.complexityLevel.cognitiveLoad}/5
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {prompt.explanation.complexityLevel.bloomsLevel}
                        </span>
                      </div>
                    </div>

                    <div className="prose prose-sm max-w-none">
                      <div className="mb-4">
                        <p className="text-gray-800">{prompt.promptText}</p>
                      </div>

                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium text-gray-900">Explanation</h4>
                        <p className="text-gray-700">{prompt.explanation.explanation}</p>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900">Focus Areas</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {prompt.explanation.focusAreas.map((area, i) => (
                            <li key={i} className="text-gray-700">
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {prompt.ratings && (
                        <div className="mt-4 flex items-center text-sm text-gray-500">
                          {prompt.ratings.averageRating && (
                            <span className="mr-4">
                              Rating: {prompt.ratings.averageRating.toFixed(1)}
                            </span>
                          )}
                          {prompt.ratings.totalRatings && (
                            <span>
                              Total Ratings: {prompt.ratings.totalRatings}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {promptResponse.data.metadata && (
                  <div className="text-sm text-gray-500">
                    Generated in {promptResponse.data.metadata.processingTimeMs}ms •
                    Version {promptResponse.data.metadata.version}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Your generated prompts will appear here
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
