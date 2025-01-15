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
import type { ApiResponse } from "@/schemas/report-generator-schema";

export default function ReportGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [reportResponse, setReportResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      studentDetails: {
        strengths: formData.get("strengths"),
        areasOfDevelopment: formData.get("areasOfDevelopment"),
        progress: formData.get("progress"),
      },
      config: {
        wordCount: Number(formData.get("wordCount")),
        studentId: formData.get("studentId"),
      },
    };

    try {
      const response = await fetch("/api/tools/report-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setReportResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Student Report Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Generate comprehensive student progress reports with detailed feedback
            and actionable targets.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-7xl mx-auto">
          {/* Form Card */}
          <Card className="p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  required
                  placeholder="e.g., Student 123"
                  pattern="^Student \d+$"
                  title="Format: Student X (where X is a number)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="strengths">Student Strengths</Label>
                <Textarea
                  id="strengths"
                  name="strengths"
                  required
                  placeholder="Describe student's strengths..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areasOfDevelopment">Areas for Development</Label>
                <Textarea
                  id="areasOfDevelopment"
                  name="areasOfDevelopment"
                  required
                  placeholder="Describe areas needing improvement..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress">Overall Progress</Label>
                <Textarea
                  id="progress"
                  name="progress"
                  required
                  placeholder="Describe student's progress..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wordCount">Report Word Count</Label>
                <Select name="wordCount" defaultValue="200">
                  <SelectTrigger>
                    <SelectValue placeholder="Select word count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100 words</SelectItem>
                    <SelectItem value="200">200 words</SelectItem>
                    <SelectItem value="300">300 words</SelectItem>
                    <SelectItem value="500">500 words</SelectItem>
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
                  "Generate Report"
                )}
              </Button>
            </form>
          </Card>

          {/* Results Card */}
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Generated Report
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
            ) : reportResponse?.data ? (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Overall Assessment
                  </h3>
                  <p className="text-gray-700">
                    {reportResponse.data.output.reportSections.overarchingAssessment}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Target for Improvement
                  </h3>
                  <p className="text-gray-700">
                    {reportResponse.data.output.reportSections.target}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Supportive End Note
                  </h3>
                  <p className="text-gray-700">
                    {reportResponse.data.output.reportSections.supportiveEndNote}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Complete Report
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {reportResponse.data.output.completeReport}
                  </p>
                </div>

                <div className="text-sm text-gray-500 mt-4">
                  <p>Generated: {new Date(reportResponse.data.output.metadata.generatedAt).toLocaleString()}</p>
                  <p>Word Count: {reportResponse.data.output.metadata.wordCount}</p>
                  <p>Version: {reportResponse.data.output.metadata.version}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Your generated report will appear here
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
} 