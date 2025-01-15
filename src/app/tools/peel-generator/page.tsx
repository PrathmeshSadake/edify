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
import type { PEELResponse } from "@/schemas/peel-schema";

const complexityLevels = [
  { value: "basic", label: "Basic" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function PEELGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [peelResponse, setPEELResponse] = useState<PEELResponse | null>(null);
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
      setPEELResponse(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate PEEL paragraph"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PEEL Paragraph Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate well-structured paragraphs using the PEEL (Point, Evidence,
            Explanation, Link) format to enhance your writing.
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
                  placeholder="Enter your topic..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject Area</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="e.g., History, Science..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complexity">Complexity Level</Label>
                <Select name="complexity" defaultValue="intermediate">
                  <SelectTrigger>
                    <SelectValue placeholder="Select complexity level" />
                  </SelectTrigger>
                  <SelectContent>
                    {complexityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate PEEL Paragraph"
                )}
              </Button>
            </form>
          </Card>

          {/* Results Card */}
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Generated PEEL Paragraph
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
            ) : peelResponse ? (
              <div className="space-y-6">
                {/* Point Section */}
                <div className="bg-white p-6 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Point</h3>
                  <p className="text-gray-700">{peelResponse.content.point}</p>
                </div>

                {/* Evidence Section */}
                <div className="bg-white p-6 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Evidence</h3>
                  <p className="text-gray-700">{peelResponse.content.evidence}</p>
                </div>

                {/* Explanation Section */}
                <div className="bg-white p-6 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Explanation
                  </h3>
                  <p className="text-gray-700">
                    {peelResponse.content.explanation}
                  </p>
                </div>

                {/* Link Section */}
                <div className="bg-white p-6 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Link</h3>
                  <p className="text-gray-700">{peelResponse.content.link}</p>
                </div>

                {/* Metadata */}
                <div className="text-sm text-gray-500 mt-4">
                  {peelResponse.metadata.subject && (
                    <p>Subject: {peelResponse.metadata.subject}</p>
                  )}
                  {peelResponse.metadata.complexity && (
                    <p>Complexity: {peelResponse.metadata.complexity}</p>
                  )}
                  <p>
                    Generated:{" "}
                    {new Date(peelResponse.metadata.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Your generated PEEL paragraph will appear here
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
