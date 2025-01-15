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
import { Plus, Minus, Loader2 } from "lucide-react";
import type { RubricResponse } from "@/schemas/rubric-schema";

const assignmentTypes = [
  { value: "analytical_essay", label: "Analytical Essay" },
  { value: "debate", label: "Debate" },
  { value: "research_project", label: "Research Project" },
  { value: "presentation", label: "Presentation" },
  { value: "other", label: "Other" },
];

const keyStages = [
  { value: "ks3", label: "Key Stage 3" },
  { value: "ks4", label: "Key Stage 4" },
  { value: "ks5", label: "Key Stage 5" },
];

const assessmentTypes = [
  { value: "teacher", label: "Teacher Assessment" },
  { value: "peer", label: "Peer Assessment" },
  { value: "self", label: "Self Assessment" },
];

export default function RubricGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [rubricResponse, setRubricResponse] = useState<RubricResponse | null>(null);
  const [error, setError] = useState("");
  const [criteria, setCriteria] = useState<string[]>([""]);
  const [showCustomType, setShowCustomType] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      assignmentType: formData.get("assignmentType"),
      customAssignmentType: formData.get("customAssignmentType"),
      keyStage: formData.get("keyStage"),
      yearGroup: Number(formData.get("yearGroup")),
      assessmentType: formData.get("assessmentType"),
      criteria: criteria.filter(c => c.trim() !== ""),
      additionalInstructions: formData.get("additionalInstructions"),
    };

    // Validate required fields
    if (!data.assignmentType || !data.keyStage || data.criteria.length === 0) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/tools/rubric-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setRubricResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate rubric");
    } finally {
      setIsLoading(false);
    }
  };

  const addCriterion = () => {
    if (criteria.length < 6) {
      setCriteria([...criteria, ""]);
    }
  };

  const removeCriterion = (index: number) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter((_, i) => i !== index));
    }
  };

  const updateCriterion = (index: number, value: string) => {
    const newCriteria = [...criteria];
    newCriteria[index] = value;
    setCriteria(newCriteria);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Rubric Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create detailed assessment rubrics with specific criteria and
            performance levels.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-7xl mx-auto">
          {/* Form Card */}
          <Card className="p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="assignmentType">Assignment Type</Label>
                <Select 
                  name="assignmentType" 
                  onValueChange={(value) => setShowCustomType(value === "other")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showCustomType && (
                <div className="space-y-2">
                  <Label htmlFor="customAssignmentType">
                    Custom Assignment Type
                  </Label>
                  <Input
                    id="customAssignmentType"
                    name="customAssignmentType"
                    required
                    placeholder="Enter custom assignment type..."
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keyStage">Key Stage</Label>
                  <Select name="keyStage">
                    <SelectTrigger>
                      <SelectValue placeholder="Select key stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {keyStages.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearGroup">Year Group</Label>
                  <Input
                    id="yearGroup"
                    name="yearGroup"
                    type="number"
                    required
                    min={7}
                    max={13}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessmentType">Assessment Type</Label>
                <Select name="assessmentType">
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assessmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Assessment Criteria</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCriterion}
                    disabled={criteria.length >= 6}
                  >
                    <Plus className="h-4 w-4" />
                    Add Criterion
                  </Button>
                </div>
                {criteria.map((criterion, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={criterion}
                      onChange={(e) => updateCriterion(index, e.target.value)}
                      placeholder={`Criterion ${index + 1}`}
                      required
                    />
                    {criteria.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeCriterion(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInstructions">
                  Additional Instructions (Optional)
                </Label>
                <Textarea
                  id="additionalInstructions"
                  name="additionalInstructions"
                  placeholder="Enter any additional instructions..."
                  className="min-h-[100px]"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || criteria.some((c) => !c.trim())}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Rubric"
                )}
              </Button>
            </form>
          </Card>

          {/* Results Card */}
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Generated Rubric
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
            ) : rubricResponse?.data ? (
              <div className="space-y-6">
                {/* Metadata */}
                <div className="bg-white p-6 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Assignment: {rubricResponse.data.metadata.assignmentType}</p>
                    <p>Key Stage: {rubricResponse.data.metadata.keyStage}</p>
                    <p>Year Group: {rubricResponse.data.metadata.yearGroup}</p>
                    <p>Assessment: {rubricResponse.data.metadata.assessmentType}</p>
                  </div>
                </div>

                {/* Criteria */}
                <div className="space-y-4">
                  {rubricResponse.data.rubric.criteria.map((criterion, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-6 rounded-lg border border-gray-100"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {criterion.name}
                      </h3>
                      <p className="text-gray-600 mb-4">{criterion.description}</p>

                      <div className="space-y-4">
                        {Object.entries(criterion.feedbackByLevel).map(
                          ([level, feedback]) => (
                            <div
                              key={level}
                              className="bg-gray-50 p-4 rounded-lg"
                            >
                              <h4 className="font-medium text-gray-900 mb-2">
                                {level.replace("_", " ").toUpperCase()}
                              </h4>
                              <p className="text-gray-700 mb-2">
                                {feedback.text}
                              </p>

                              <div className="space-y-2">
                                <div>
                                  <p className="text-sm font-medium text-gray-700">
                                    Suggestions:
                                  </p>
                                  <ul className="list-disc list-inside text-sm text-gray-600">
                                    {feedback.suggestions.map((suggestion, i) => (
                                      <li key={i}>{suggestion}</li>
                                    ))}
                                  </ul>
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-gray-700">
                                    Action Steps:
                                  </p>
                                  <ul className="list-disc list-inside text-sm text-gray-600">
                                    {feedback.actionableSteps.map((step, i) => (
                                      <li key={i}>{step}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Instructions */}
                <div className="bg-white p-6 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Instructions
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        For Teachers:
                      </h4>
                      <ul className="list-disc list-inside text-gray-600">
                        {rubricResponse.data.rubric.instructions.teacher.map(
                          (instruction, i) => (
                            <li key={i}>{instruction}</li>
                          )
                        )}
                      </ul>
                    </div>

                    {rubricResponse.data.rubric.instructions.peer && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          For Peer Assessment:
                        </h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {rubricResponse.data.rubric.instructions.peer.map(
                            (instruction, i) => (
                              <li key={i}>{instruction}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {rubricResponse.data.rubric.instructions.self && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          For Self Assessment:
                        </h4>
                        <ul className="list-disc list-inside text-gray-600">
                          {rubricResponse.data.rubric.instructions.self.map(
                            (instruction, i) => (
                              <li key={i}>{instruction}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata Footer */}
                <div className="text-sm text-gray-500 mt-4">
                  <p>ID: {rubricResponse.data.id}</p>
                  <p>Created: {new Date(rubricResponse.data.createdAt).toLocaleString()}</p>
                  <p>Version: {rubricResponse.data.version}</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Your generated rubric will appear here
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
