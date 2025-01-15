import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { QuizSchema } from "@/schemas/quiz-schema";

interface QuizRequest {
  topic: string;
  questionCount: number;
  difficulty: string;
  questionTypes: string[];
  subject?: string;
  gradeLevel?: string;
}

export async function POST(req: Request) {
  try {
    const body: QuizRequest = await req.json();

    if (!body.topic || !body.questionCount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const systemMessage = `You are an educational assessment expert who creates engaging quizzes. Your responses must be valid JSON objects that strictly follow the provided schema structure.`;

    const userMessage = `Generate a quiz following this exact schema:

    Topic: ${body.topic}
    Number of Questions: ${body.questionCount}
    Difficulty Level: ${body.difficulty}
    Question Types: ${body.questionTypes.join(", ")}
    ${body.subject ? `Subject: ${body.subject}` : ""}
    ${body.gradeLevel ? `Grade Level: ${body.gradeLevel}` : ""}

    Include:
    1. Clear and concise questions
    2. Multiple options with one correct answer
    3. Explanatory feedback for correct and incorrect answers
    4. Appropriate difficulty level
    
    Respond with ONLY a valid JSON object matching the provided schema.`;

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: QuizSchema,
      prompt: systemMessage + userMessage,
    });

    return NextResponse.json(object, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating quiz:", error);

    return NextResponse.json(
      {
        error: "Failed to generate quiz",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 