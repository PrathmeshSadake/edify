import { NextResponse } from "next/server";
import {
  RubricRequestSchema,
  RubricResponseSchema,
} from "@/schemas/rubric-schema";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    // Validate request body against schema
    const body = await req.json();
    // const validatedRequest = RubricRequestSchema.parse(body);

    const systemMessage = `You are an educational assessment expert who creates detailed rubrics. Your responses must be valid JSON objects that strictly follow the provided schema structure. Generate comprehensive assessment criteria with specific feedback for each performance level.`;

    const userMessage = `Create an assessment rubric following this exact schema:
    Assignment Details:
    - Type: ${body.assignmentType}
    ${
      body.customAssignmentType
        ? `- Custom Type: ${body.customAssignmentType}`
        : ""
    }
    - Key Stage: ${body.keyStage}
    - Year Group: ${body.yearGroup}
    - Assessment Type: ${body.assessmentType}
    
    Required Criteria: ${body.criteria.join(", ")}
    ${
      body.additionalInstructions
        ? `Additional Instructions: ${body.additionalInstructions}`
        : ""
    }

    For each criterion:
    1. Provide clear name and description
    2. Include detailed feedback for each performance level (advanced, proficient, developing, needs_improvement)
    3. Include specific suggestions and actionable steps for improvement
    
    Also include:
    1. Appropriate instructions based on assessment type (teacher/peer/self)
    2. Relevant reflection prompts
    
    Respond with ONLY a valid JSON object matching the provided schema.`;

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: RubricResponseSchema,
      prompt: systemMessage + userMessage,
    });
    console.log(object);

    return NextResponse.json(object, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating rubric:", error);

    return NextResponse.json(
      {
        error: "Failed to generate rubric",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
