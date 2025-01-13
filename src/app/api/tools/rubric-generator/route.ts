import OpenAI from "openai";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  RubricRequest,
  RubricResponse,
  RubricRequestSchema,
  RubricResponseSchema,
  AssessmentTypeEnum,
  PerformanceLevelEnum,
} from "@/schemas/rubric-schema";
import openai from "@/lib/openai";

export async function POST(req: Request) {
  try {
    // Validate request body against schema
    const body = await req.json();
    const validatedRequest = RubricRequestSchema.parse(body);

    const systemMessage = `You are an educational assessment expert who creates detailed rubrics. Your responses must be valid JSON objects that strictly follow the provided schema structure. Generate comprehensive assessment criteria with specific feedback for each performance level.`;

    const userMessage = `Create an assessment rubric following this exact schema:
    ${JSON.stringify(RubricResponseSchema.shape, null, 2)}

    Assignment Details:
    - Type: ${validatedRequest.assignmentType}
    ${
      validatedRequest.customAssignmentType
        ? `- Custom Type: ${validatedRequest.customAssignmentType}`
        : ""
    }
    - Key Stage: ${validatedRequest.keyStage}
    - Year Group: ${validatedRequest.yearGroup}
    - Assessment Type: ${validatedRequest.assessmentType}
    
    Required Criteria: ${validatedRequest.criteria.join(", ")}
    ${
      validatedRequest.additionalInstructions
        ? `Additional Instructions: ${validatedRequest.additionalInstructions}`
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse and structure the response
    const parsedResponse = JSON.parse(responseContent);

    const rubricResponse: RubricResponse = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      metadata: {
        assignmentType: validatedRequest.assignmentType,
        customAssignmentType: validatedRequest.customAssignmentType,
        keyStage: validatedRequest.keyStage,
        yearGroup: validatedRequest.yearGroup,
        assessmentType: validatedRequest.assessmentType,
      },
      rubric: {
        ...parsedResponse.rubric,
        instructions: {
          teacher: parsedResponse.rubric.instructions.teacher,
          ...(validatedRequest.assessmentType === "peer" && {
            peer: parsedResponse.rubric.instructions.peer,
          }),
          ...(validatedRequest.assessmentType === "self" && {
            self: parsedResponse.rubric.instructions.self,
          }),
        },
      },
      version: 1,
    };

    // Validate the response against our schema
    const validatedResponse = RubricResponseSchema.parse(rubricResponse);

    return NextResponse.json(validatedResponse, {
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
