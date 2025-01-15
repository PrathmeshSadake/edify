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
import type { SOW } from "@/schemas/sow-schema";

const emphasisAreas = [
  "metacognition",
  "criticalThinking",
  "research",
  "discussion",
  "practical",
];

const difficultyLevels = [
  { value: "foundation", label: "Foundation" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function SOWGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sowResponse, setSOWResponse] = useState<SOW | null>(null);
  const [error, setError] = useState("");
  const [selectedEmphasis, setSelectedEmphasis] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      subject: formData.get("subject"),
      topic: formData.get("topic"),
      ageGroup: {
        year: Number(formData.get("year")),
        ageRange: [
          Number(formData.get("ageRangeStart")),
          Number(formData.get("ageRangeEnd")),
        ],
      },
      totalLessons: Number(formData.get("totalLessons")),
      lessonDuration: Number(formData.get("lessonDuration")),
      userPreferences: {
        emphasisAreas: selectedEmphasis,
        difficultyLevel: formData.get("difficultyLevel"),
      },
    };

    try {
      const response = await fetch("/api/tools/sow-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setSOWResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate SOW");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmphasisToggle = (area: string) => {
    setSelectedEmphasis((prev) =>
      prev.includes(area)
        ? prev.filter((a) => a !== area)
        : [...prev, area]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Scheme of Work Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create comprehensive schemes of work with detailed lesson plans,
            objectives, and cross-curricular links.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-7xl mx-auto">
          {/* Form Card */}
          <Card className="p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    required
                    placeholder="e.g., Mathematics"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    name="topic"
                    required
                    placeholder="e.g., Algebra Basics"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year Group</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    required
                    min={1}
                    max={13}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ageRangeStart">Age Range Start</Label>
                  <Input
                    id="ageRangeStart"
                    name="ageRangeStart"
                    type="number"
                    required
                    min={5}
                    max={18}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ageRangeEnd">Age Range End</Label>
                  <Input
                    id="ageRangeEnd"
                    name="ageRangeEnd"
                    type="number"
                    required
                    min={5}
                    max={18}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalLessons">Total Lessons</Label>
                  <Input
                    id="totalLessons"
                    name="totalLessons"
                    type="number"
                    required
                    min={1}
                    max={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lessonDuration">
                    Lesson Duration (minutes)
                  </Label>
                  <Input
                    id="lessonDuration"
                    name="lessonDuration"
                    type="number"
                    required
                    min={15}
                    max={180}
                    step={15}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Emphasis Areas</Label>
                <div className="grid grid-cols-2 gap-4">
                  {emphasisAreas.map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={area}
                        checked={selectedEmphasis.includes(area)}
                        onCheckedChange={() => handleEmphasisToggle(area)}
                      />
                      <Label htmlFor={area} className="capitalize">
                        {area}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                <Select name="difficultyLevel" defaultValue="intermediate">
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty level" />
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
                  "Generate Scheme of Work"
                )}
              </Button>
            </form>
          </Card>

          {/* Results Card */}
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Generated Scheme of Work
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
            ) : sowResponse?.data ? (
              <div className="space-y-6">
                {/* Overview Section */}
                <div className="bg-white p-6 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Overview</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p>Subject: {sowResponse.data.subject}</p>
                    <p>Topic: {sowResponse.data.topic}</p>
                    <p>Year: {sowResponse.data.ageGroup.year}</p>
                    <p>
                      Age Range: {sowResponse.data.ageGroup.ageRange[0]}-
                      {sowResponse.data.ageGroup.ageRange[1]}
                    </p>
                  </div>
                </div>

                {/* Objectives Section */}
                <div className="bg-white p-6 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Overarching Objectives
                  </h3>
                  <ul className="list-disc list-inside space-y-2">
                    {sowResponse.data.overarchingObjectives.map((obj, idx) => (
                      <li key={idx} className="text-gray-700">
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Lessons Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Lessons</h3>
                  {sowResponse.data.lessons.map((lesson, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-6 rounded-lg border border-gray-100"
                    >
                      <h4 className="font-medium mb-2">
                        Lesson {lesson.lessonNumber}
                      </h4>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500">
                          Duration: {lesson.duration} minutes
                        </p>
                        
                        {/* Learning Objectives */}
                        <div>
                          <h5 className="text-sm font-medium">Objectives:</h5>
                          <ul className="list-disc list-inside text-sm">
                            {lesson.learningObjectives.map((obj, i) => (
                              <li key={i} className="text-gray-700">
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Activities */}
                        <div>
                          <h5 className="text-sm font-medium">Activities:</h5>
                          <div className="space-y-2">
                            {lesson.activities.map((activity, i) => (
                              <div key={i} className="p-3 bg-gray-50 rounded">
                                <p className="font-medium">{activity.title}</p>
                                <p className="text-sm text-gray-600">
                                  {activity.description}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Duration: {activity.duration} minutes
                                </p>
                                {activity.resources && (
                                  <div className="mt-2">
                                    <p className="text-sm font-medium">Resources:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-600">
                                      {activity.resources.map((resource, ri) => (
                                        <li key={ri}>{resource}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Assessment */}
                        {lesson.assessment && (
                          <div>
                            <h5 className="text-sm font-medium">Assessment:</h5>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                              {lesson.assessment.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Differentiation */}
                        {lesson.differentiation && (
                          <div>
                            <h5 className="text-sm font-medium">Differentiation:</h5>
                            {lesson.differentiation.support && (
                              <div className="ml-4">
                                <p className="text-sm font-medium">Support:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                  {lesson.differentiation.support.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {lesson.differentiation.core && (
                              <div className="ml-4">
                                <p className="text-sm font-medium">Core:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                  {lesson.differentiation.core.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {lesson.differentiation.extension && (
                              <div className="ml-4">
                                <p className="text-sm font-medium">Extension:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                  {lesson.differentiation.extension.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Metadata */}
                <div className="text-sm text-gray-500 mt-4">
                  <p>Author: {sowResponse.data.metadata.author}</p>
                  <p>Created: {new Date(sowResponse.data.metadata.createdAt).toLocaleString()}</p>
                  <p>Version: {sowResponse.data.metadata.version}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Your generated scheme of work will appear here
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 