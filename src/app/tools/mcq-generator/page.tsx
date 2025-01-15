"use client";
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { APIResponseType } from "@/schemas/mcq-schema";

const taxonomyLevels = [
  { id: "remembering", label: "Remembering" },
  { id: "understanding", label: "Understanding" },
  { id: "applying", label: "Applying" },
  { id: "analyzing", label: "Analyzing" },
  { id: "evaluating", label: "Evaluating" },
  { id: "creating", label: "Creating" },
];

export default function MCQGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [mcqResponse, setMCQResponse] = useState<APIResponseType | null>(null);
  const [error, setError] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      topic: formData.get("topic"),
      taxonomyLevels: selectedLevels,
      answersPerQuestion: Number(formData.get("answerCount") || 4),
      difficulty: formData.get("difficulty") || "medium",
    };

    // Validate required fields
    if (!data.topic || selectedLevels.length === 0) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/tools/mcq-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMCQResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate MCQs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLevelToggle = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            MCQ Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate multiple-choice questions with varying complexity levels
            based on Bloom's Taxonomy.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-7xl mx-auto">
          {/* Form Card */}
          <Card className="p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic or Concept</Label>
                <Input
                  id="topic"
                  name="topic"
                  required
                  placeholder="Enter the topic..."
                />
              </div>

              <div className="space-y-2">
                <Label>Bloom's Taxonomy Levels</Label>
                <div className="grid grid-cols-2 gap-4">
                  {taxonomyLevels.map((level) => (
                    <div key={level.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={level.id}
                        checked={selectedLevels.includes(level.id)}
                        onCheckedChange={() => handleLevelToggle(level.id)}
                      />
                      <Label htmlFor={level.id}>{level.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="answerCount">Answers per Question</Label>
                <Select name="answerCount" defaultValue="4">
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of answers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 answers</SelectItem>
                    <SelectItem value="4">4 answers</SelectItem>
                    <SelectItem value="5">5 answers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select name="difficulty" defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={isLoading || selectedLevels.length === 0}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Questions"
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
              Generated Questions
            </h2>

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : mcqResponse?.data ? (
              <div className="space-y-8">
                {mcqResponse.data.questions.map((question, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-lg border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold">
                        Question {idx + 1}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {question.taxonomyLevel}
                      </span>
                    </div>

                    <p className="text-gray-800 mb-4">{question.text}</p>

                    <div className="space-y-3">
                      {question.answers.map((answer, ansIdx) => (
                        <div
                          key={ansIdx}
                          className={`p-3 rounded-lg ${
                            answer.isCorrect
                              ? "bg-green-50 border border-green-200"
                              : "bg-gray-50 border border-gray-200"
                          }`}
                        >
                          <p className="font-medium">{answer.text}</p>
                          {answer.explanation && (
                            <p className="text-sm text-gray-600 mt-1">
                              {answer.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Explanation: </span>
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                <div className="text-sm text-gray-500 mt-4">
                  <p>Topic: {mcqResponse.data.metadata.topic}</p>
                  <p>Difficulty: {mcqResponse.data.metadata.difficulty}</p>
                  <p>Generated: {mcqResponse.data.metadata.timestamp}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Your generated questions will appear here
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 