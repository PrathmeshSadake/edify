import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

interface LessonPlanRequest {
  prompt: string;
  grade?: string;
  subject?: string;
  duration?: string;
}

interface LessonPlanResponse {
  content: string;
  metadata: {
    grade?: string;
    subject?: string;
    duration?: string;
    timestamp: string;
  };
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

export async function POST(req: Request) {
  try {
    const body: LessonPlanRequest = await req.json();

    if (!body.prompt) {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 }
      );
    }

    // Create a structured prompt template
    const systemPrompt = `Generate a detailed lesson plan following this format:
    1. Learning Objectives
    2. Required Materials
    3. Introduction (10 minutes)
    4. Main Activities (broken down by time)
    5. Assessment/Evaluation
    6. Homework/Extension Activities
    
    Consider these details:
    ${body.grade ? `Grade Level: ${body.grade}` : ""}
    ${body.subject ? `Subject: ${body.subject}` : ""}
    ${body.duration ? `Duration: ${body.duration}` : ""}
    
    Lesson plan objectives: ${body.prompt}

    Please format the response using markdown for better readability.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Process the text to ensure proper formatting
    const formattedContent = text
      .replace(/\n{3,}/g, "\n\n") // Remove excess newlines
      .trim();

    const responseData: LessonPlanResponse = {
      content: formattedContent,
      metadata: {
        grade: body.grade || undefined,
        subject: body.subject || undefined,
        duration: body.duration || undefined,
        timestamp: new Date().toISOString(),
      },
    };

    // Set appropriate headers for JSON response
    return NextResponse.json(responseData, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating lesson plan:", error);

    // Enhanced error response
    return NextResponse.json(
      {
        error: "Failed to generate lesson plan",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        status: 500,
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
