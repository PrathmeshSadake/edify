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
    
    Lesson plan objectives: ${body.prompt}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    const responseData: LessonPlanResponse = {
      content: text,
      metadata: {
        grade: body.grade,
        subject: body.subject,
        duration: body.duration,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error generating lesson plan:", error);
    return NextResponse.json(
      {
        error: "Failed to generate lesson plan",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
