import { NextResponse } from "next/server";
import {
  LessonPlanSchema,
  type LessonPlan,
} from "@/schemas/lesson-plan-schema";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

interface LessonPlanRequest {
  prompt: string;
  grade?: string;
  subject?: string;
  duration?: string;
}

export async function POST(req: Request) {
  try {
    const body: LessonPlanRequest = await req.json();

    if (!body.prompt) {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 }
      );
    }

    // Create a structured prompt for OpenAI
    const systemMessage = `You are a professional curriculum developer who creates detailed lesson plans. Your responses must be valid JSON objects that strictly follow the provided schema structure. Do not include any additional text or explanations outside the JSON object.`;

    const userMessage = `Generate a detailed lesson plan following this exact schema structure:

    Topic: ${body.prompt}
    Year Group: ${body.grade || "To be determined"}
    Subject: ${body.subject || "To be determined"}
    Duration: ${body.duration || "60 minutes"}

    Include:
    1. Clear learning objectives and success criteria
    2. A structured lesson with timed introduction, main activities, and plenary
    3. Assessment questions based on Bloom's taxonomy
    4. Differentiation strategies for different learning needs
    5. Cross-curricular connections
    6. Required and optional resources
    7. Extension activities and homework ideas
    8. Teacher preparation notes and safety considerations

    Respond with ONLY a valid JSON object matching the provided schema.`;

    const { object } = await generateObject({
      model: openai("gpt-4-turbo"),
      schema: LessonPlanSchema,
      prompt: systemMessage + userMessage,
    });

    // Parse and validate the response
    let lessonPlanData: any;
    try {
      const parsed = JSON.stringify(object, null, 2);
      console.log(parsed);
      lessonPlanData = parsed;
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      return NextResponse.json(
        {
          error: "Failed to generate valid lesson plan format",
          details:
            parseError instanceof Error ? parseError.message : "Invalid format",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Cache control headers for better performance
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    };

    return NextResponse.json(lessonPlanData, { headers });
  } catch (error) {
    console.error("Error generating lesson plan:", error);

    return NextResponse.json(
      {
        error: "Failed to generate lesson plan",
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
