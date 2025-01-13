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
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  ClipboardCopy,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import {
  AssignmentTypeEnum,
  KeyStageEnum,
  AssessmentTypeEnum,
  RubricResponse,
} from "@/schemas/rubric-schema";

export default function RubricGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [rubricResponse, setRubricResponse] = useState<RubricResponse | null>(
    null
  );
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [criteria, setCriteria] = useState<string[]>([""]);

  const addCriterion = () => {
    if (criteria.length < 6) {
      setCriteria([...criteria, ""]);
    }
  };

  const removeCriterion = (index: number) => {
    if (criteria.length > 1) {
      const newCriteria = criteria.filter((_, i) => i !== index);
      setCriteria(newCriteria);
    }
  };

  const updateCriterion = (index: number, value: string) => {
    const newCriteria = [...criteria];
    newCriteria[index] = value;
    setCriteria(newCriteria);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setCopied(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      assignmentType: formData.get("assignmentType") as any,
      customAssignmentType:
        (formData.get("customAssignmentType") as string) || undefined,
      keyStage: formData.get("keyStage") as any,
      yearGroup: Number(formData.get("yearGroup")),
      assessmentType: formData.get("assessmentType") as any,
      criteria: criteria.filter((c) => c.trim() !== ""),
      additionalInstructions:
        (formData.get("additionalInstructions") as string) || undefined,
    };

    try {
      const response = await fetch("/api/tools/rubric-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setRubricResponse(result);
      toast.success("Rubric generated successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate rubric"
      );
      toast.error("Failed to generate rubric");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!rubricResponse) return;

    const rubricText = `
Assignment Type: ${rubricResponse.metadata.assignmentType}
${
  rubricResponse.metadata.customAssignmentType
    ? `Custom Type: ${rubricResponse.metadata.customAssignmentType}\n`
    : ""
}
Key Stage: ${rubricResponse.metadata.keyStage}
Year Group: ${rubricResponse.metadata.yearGroup}

Criteria:
${rubricResponse.rubric.criteria
  .map(
    (criterion, i) => `
${i + 1}. ${criterion.name}
Description: ${criterion.description}

Performance Levels:
${Object.entries(criterion.feedbackByLevel)
  .map(
    ([level, feedback]) => `
${level.toUpperCase()}
- Feedback: ${feedback.text}
- Suggestions: ${feedback.suggestions.join(", ")}
- Actionable Steps: ${feedback.actionableSteps.join(", ")}
`
  )
  .join("\n")}
`
  )
  .join("\n")}

Instructions:
Teacher: ${rubricResponse.rubric.instructions.teacher.join("\n")}
${
  rubricResponse.rubric.instructions.peer
    ? `Peer: ${rubricResponse.rubric.instructions.peer.join("\n")}`
    : ""
}
${
  rubricResponse.rubric.instructions.self
    ? `Self: ${rubricResponse.rubric.instructions.self.join("\n")}`
    : ""
}

Reflection Prompts:
${rubricResponse.rubric.reflectionPrompts.join("\n")}`;

    try {
      await navigator.clipboard.writeText(rubricText);
      setCopied(true);
      toast.success("Rubric copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      <div className='container mx-auto px-4 py-12'>
        <div className='max-w-4xl mx-auto'>
          {/* Header Section */}
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>
              Educational Rubric Generator
            </h1>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              Create detailed assessment rubrics with specific feedback and
              performance levels.
            </p>
          </div>

          {/* Form Card */}
          <Card className='p-8 shadow-lg hover:shadow-xl transition-shadow duration-300'>
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <Label htmlFor='assignmentType'>Assignment Type</Label>
                  <Select name='assignmentType' required>
                    <SelectTrigger>
                      <SelectValue placeholder='Select assignment type' />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(AssignmentTypeEnum).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace("_", " ").charAt(0).toUpperCase() +
                            type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='customAssignmentType'>
                    Custom Assignment Type
                  </Label>
                  <Input
                    id='customAssignmentType'
                    name='customAssignmentType'
                    placeholder='Optional custom type'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='space-y-2'>
                  <Label htmlFor='keyStage'>Key Stage</Label>
                  <Select name='keyStage' required>
                    <SelectTrigger>
                      <SelectValue placeholder='Select key stage' />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(KeyStageEnum).map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='yearGroup'>Year Group</Label>
                  <Select name='yearGroup' required>
                    <SelectTrigger>
                      <SelectValue placeholder='Select year group' />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 7 }, (_, i) => i + 7).map(
                        (year) => (
                          <SelectItem key={year} value={year.toString()}>
                            Year {year}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='assessmentType'>Assessment Type</Label>
                  <Select name='assessmentType' required>
                    <SelectTrigger>
                      <SelectValue placeholder='Select assessment type' />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(AssessmentTypeEnum).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <Label>Assessment Criteria</Label>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addCriterion}
                    disabled={criteria.length >= 6}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Criterion
                  </Button>
                </div>
                {criteria.map((criterion, index) => (
                  <div key={index} className='flex gap-2'>
                    <Input
                      value={criterion}
                      onChange={(e) => updateCriterion(index, e.target.value)}
                      placeholder={`Criterion ${index + 1}`}
                      required
                    />
                    {criteria.length > 1 && (
                      <Button
                        type='button'
                        variant='outline'
                        size='icon'
                        onClick={() => removeCriterion(index)}
                      >
                        <Minus className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='additionalInstructions'>
                  Additional Instructions
                </Label>
                <Textarea
                  id='additionalInstructions'
                  name='additionalInstructions'
                  placeholder='Optional additional instructions...'
                  className='min-h-[100px]'
                />
              </div>

              <Button
                type='submit'
                disabled={isLoading}
                className='w-full h-12 text-base font-semibold'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                    Generating Rubric...
                  </>
                ) : (
                  "Generate Rubric"
                )}
              </Button>
            </form>
          </Card>

          {error && (
            <div className='mt-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg flex items-center'>
              <AlertCircle className='h-5 w-5 mr-2 flex-shrink-0' />
              <p>{error}</p>
            </div>
          )}

          {/* Result Card */}
          {rubricResponse && (
            <Card className='mt-8 p-8 shadow-lg'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>
                  Generated Rubric
                </h2>
                <Button
                  variant='outline'
                  onClick={copyToClipboard}
                  className='transition-all duration-200'
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className='h-4 w-4 mr-2 text-green-500' />
                      Copied!
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className='h-4 w-4 mr-2' />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </div>

              <div className='space-y-8'>
                {/* Metadata Section */}
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <h3 className='text-lg font-semibold mb-2'>Metadata</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm text-gray-500'>Assignment Type</p>
                      <p className='font-medium'>
                        {rubricResponse.metadata.assignmentType.replace(
                          "_",
                          " "
                        )}
                      </p>
                    </div>
                    {rubricResponse.metadata.customAssignmentType && (
                      <div>
                        <p className='text-sm text-gray-500'>Custom Type</p>
                        <p className='font-medium'>
                          {rubricResponse.metadata.customAssignmentType}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className='text-sm text-gray-500'>Key Stage</p>
                      <p className='font-medium'>
                        {rubricResponse.metadata.keyStage.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Year Group</p>
                      <p className='font-medium'>
                        Year {rubricResponse.metadata.yearGroup}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Criteria Section */}
                {rubricResponse.rubric.criteria.map((criterion, index) => (
                  <div
                    key={index}
                    className='bg-white p-6 rounded-lg border border-gray-100 shadow-sm'
                  >
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                      {criterion.name}
                    </h3>
                    <p className='text-gray-600 mb-4'>
                      {criterion.description}
                    </p>

                    <div className='space-y-4'>
                      {Object.entries(criterion.feedbackByLevel).map(
                        ([level, feedback]) => (
                          <div
                            key={level}
                            className='bg-gray-50 p-4 rounded-lg'
                          >
                            <h4 className='font-medium text-gray-900 mb-2'>
                              {level.replace("_", " ").toUpperCase()}
                            </h4>
                            <p className='text-gray-600 mb-2'>
                              {feedback.text}
                            </p>

                            <div className='space-y-2'>
                              <div>
                                <p className='text-sm font-medium text-gray-500'>
                                  Suggestions:
                                </p>
                                <ul className='list-disc list-inside text-gray-600 pl-4'>
                                  {feedback.suggestions.map((suggestion, i) => (
                                    <li key={i}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <p className='text-sm font-medium text-gray-500'>
                                  Actionable Steps:
                                </p>
                                <ul className='list-disc list-inside text-gray-600 pl-4'>
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

                {/* Instructions Section */}
                <div className='bg-white p-6 rounded-lg border border-gray-100 shadow-sm'>
                  <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                    Instructions
                  </h3>

                  <div className='space-y-4'>
                    <div>
                      <h4 className='font-medium text-gray-900 mb-2'>
                        For Teachers:
                      </h4>
                      <ul className='list-disc list-inside text-gray-600 pl-4'>
                        {rubricResponse.rubric.instructions.teacher.map(
                          (instruction, i) => (
                            <li key={i}>{instruction}</li>
                          )
                        )}
                      </ul>
                    </div>

                    {rubricResponse.rubric.instructions.peer && (
                      <div>
                        <h4 className='font-medium text-gray-900 mb-2'>
                          For Peer Assessment:
                        </h4>
                        <ul className='list-disc list-inside text-gray-600 pl-4'>
                          {rubricResponse.rubric.instructions.peer.map(
                            (instruction, i) => (
                              <li key={i}>{instruction}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {rubricResponse.rubric.instructions.self && (
                      <div>
                        <h4 className='font-medium text-gray-900 mb-2'>
                          For Self Assessment:
                        </h4>
                        <ul className='list-disc list-inside text-gray-600 pl-4'>
                          {rubricResponse.rubric.instructions.self.map(
                            (instruction, i) => (
                              <li key={i}>{instruction}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reflection Prompts Section */}
                <div className='bg-white p-6 rounded-lg border border-gray-100 shadow-sm'>
                  <h3 className='text-xl font-semibold text-gray-900 mb-4'>
                    Reflection Prompts
                  </h3>
                  <ul className='list-disc list-inside text-gray-600 pl-4'>
                    {rubricResponse.rubric.reflectionPrompts.map(
                      (prompt, i) => (
                        <li key={i}>{prompt}</li>
                      )
                    )}
                  </ul>
                </div>

                {/* Metadata Footer */}
                <div className='text-sm text-gray-500 mt-4'>
                  <p>Rubric ID: {rubricResponse.id}</p>
                  <p>
                    Created:{" "}
                    {new Date(rubricResponse.createdAt).toLocaleString()}
                  </p>
                  <p>Version: {rubricResponse.version}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
