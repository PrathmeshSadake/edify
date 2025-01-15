import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/api-client";
import { RubricResponseSchema } from "@/schemas/rubric-schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received request body:", body);

    if (!body.assignmentType || !body.keyStage || !body.criteria) {
      return NextResponse.json(
        { error: "Missing required fields: assignmentType, keyStage, and criteria" },
        { status: 400 }
      );
    }

    const systemMessage = `You are an educational assessment expert who creates detailed rubrics. You must respond with a valid JSON object that exactly matches the specified schema structure. Do not include any additional text or explanations outside the JSON object.`;

    const userMessage = `Create an assessment rubric with the following details:

    Assignment Details:
    - Type: ${body.assignmentType}
    ${body.customAssignmentType ? `- Custom Type: ${body.customAssignmentType}` : ""}
    - Key Stage: ${body.keyStage}
    - Year Group: ${body.yearGroup}
    - Assessment Type: ${body.assessmentType}
    
    Required Criteria: ${body.criteria.join(", ")}
    ${body.additionalInstructions ? `Additional Instructions: ${body.additionalInstructions}` : ""}

    Return ONLY a JSON object with this exact structure:
    {
      "data": {
        "id": "string",
        "metadata": {
          "assignmentType": "string",
          "keyStage": "string",
          "yearGroup": number,
          "assessmentType": "string"
        },
        "rubric": {
          "criteria": [
            {
              "name": "string",
              "description": "string",
              "feedbackByLevel": {
                "level_name": {
                  "text": "string",
                  "suggestions": ["string"],
                  "actionableSteps": ["string"]
                }
              }
            }
          ],
          "instructions": {
            "teacher": ["string"],
            "peer": ["string"],
            "self": ["string"]
          }
        },
        "createdAt": "string",
        "version": "string"
      }
    }

    For each criterion:
    1. Provide clear name and description
    2. Include detailed feedback for each performance level
    3. Include specific suggestions and actionable steps for improvement
    
    The response must be valid JSON. Do not include any markdown formatting or additional text.`;

    console.log("Generating rubric with prompt:", userMessage);

    const response = await generateAIResponse({
      prompt: systemMessage + "\n\n" + userMessage,
      schema: RubricResponseSchema,
    });

    console.log("Generated rubric:", response);

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error generating rubric:", error);
    let errorMessage = "Failed to generate rubric";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
