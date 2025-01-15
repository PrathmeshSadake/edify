import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/api-client";
import { LessonPlanSchema } from "@/schemas/lesson-plan-schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received request body:", body);

    if (!body.prompt) {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 }
      );
    }

    const systemMessage = `You are a professional curriculum developer who creates detailed lesson plans. You must respond with a valid JSON object that exactly matches the specified schema structure. Do not include any additional text or explanations outside the JSON object.`;

    const userMessage = `Create a lesson plan for:
    Topic: ${body.prompt}
    Year Group: ${body.grade || "Not specified"}
    Subject: ${body.subject || "Not specified"}
    Duration: ${body.duration || "60 minutes"}

    Return ONLY a JSON object with this exact structure:
    {
      "metadata": {
        "topic": "string",
        "yearGroup": "string",
        "subject": "string",
        "duration": "string"
      },
      "objectives": {
        "learning": ["string"],
        "success": ["string"]
      },
      "lessonStructure": {
        "introduction": {
          "duration": number,
          "activities": [{"title": "string", "description": "string", "duration": number}]
        },
        "mainActivities": [{"title": "string", "description": "string", "duration": number}],
        "plenary": {
          "duration": number,
          "activities": [{"title": "string", "description": "string", "duration": number}]
        }
      },
      "assessment": {
        "formative": [{"type": "string", "description": "string"}]
      },
      "resources": ["string"]
    }

    The response must be valid JSON. Do not include any markdown formatting or additional text.`;

    console.log("Generating response with prompt:", userMessage);

    const response = await generateAIResponse({
      prompt: systemMessage + "\n\n" + userMessage,
      schema: LessonPlanSchema,
    });

    console.log("Generated response:", response);

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error generating lesson plan:", error);
    let errorMessage = "Failed to generate lesson plan";
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
