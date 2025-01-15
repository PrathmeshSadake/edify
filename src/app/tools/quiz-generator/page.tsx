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
import type { Quiz } from "@/schemas/quiz-schema";

const questionTypes = [
  { id: "multiple_choice", label: "Multiple Choice" },
  { id: "true_false", label: "True/False" },
  { id: "short_answer", label: "Short Answer" },
];

const difficultyLevels = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function QuizGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [quizResponse, setQuizResponse] = useState<Quiz | null>(null);
  const [error, setError] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      topic: formData.get("topic"),
      questionCount: Number(formData.get("questionCount")),
      difficulty: formData.get("difficulty"),
      questionTypes: selectedTypes,
      subject: formData.get("subject"),
      gradeLevel: formData.get("gradeLevel"),
    };

    try {
      const response = await fetch("/api/tools/quiz-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setQuizResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Quiz Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate customized quizzes with various question types and
            difficulty levels.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-7xl mx-auto">
          {/* Form Card */}
          <Card className="p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  name="topic"
                  required
                  placeholder="Enter quiz topic..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Input
                    id="subject"
                    name="subject"
                    placeholder="e.g., Mathematics"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Grade Level (Optional)</Label>
                  <Input
                    id="gradeLevel"
                    name="gradeLevel"
                    placeholder="e.g., Grade 10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question Types</Label>
                <div className="grid grid-cols-2 gap-4">
                  {questionTypes.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={type.id}
                        checked={selectedTypes.includes(type.id)}
                        onCheckedChange={() => handleTypeToggle(type.id)}
                      />
                      <Label htmlFor={type.id}>{type.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="questionCount">Number of Questions</Label>
                  <Input
                    id="questionCount"
                    name="questionCount"
                    type="number"
                    required
                    min={1}
                    max={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select name="difficulty" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || selectedTypes.length === 0}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Quiz"
                )}
              </Button>
            </form>
          </Card>

          {/* Results Card */}
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Generated Quiz
            </h2>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : quizResponse ? (
              <div className="space-y-6">
                {/* Quiz Title and Metadata */}
                <div className="bg-white p-6 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {quizResponse.metadata.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    {quizResponse.metadata.subject && (
                      <p>Subject: {quizResponse.metadata.subject}</p>
                    )}
                    {quizResponse.metadata.gradeLevel && (
                      <p>Grade: {quizResponse.metadata.gradeLevel}</p>
                    )}
                    {quizResponse.metadata.duration && (
                      <p>Duration: {quizResponse.metadata.duration} minutes</p>
                    )}
                    {quizResponse.metadata.totalPoints && (
                      <p>Total Points: {quizResponse.metadata.totalPoints}</p>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                {quizResponse.instructions && (
                  <div className="bg-white p-6 rounded-lg border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Instructions
                    </h3>
                    <ul className="list-disc list-inside space-y-2">
                      {quizResponse.instructions.map((instruction, idx) => (
                        <li key={idx} className="text-gray-700">
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Questions */}
                <div className="space-y-4">
                  {quizResponse.questions.map((question, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-6 rounded-lg border border-gray-100"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Question {idx + 1}</h4>
                        <span className="text-sm text-gray-500 capitalize">
                          {question.difficulty} • {question.points} points
                        </span>
                      </div>
                      <p className="text-gray-800 mb-4">{question.questionText}</p>
                      <div className="space-y-3">
                        {question.options.map((option, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-lg ${
                              option.isCorrect
                                ? "bg-green-50 border border-green-200"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <p className="font-medium">{option.text}</p>
                            {option.explanation && (
                              <p className="text-sm text-gray-600 mt-1">
                                {option.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Your generated quiz will appear here
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 