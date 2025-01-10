import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

interface PromptRequest {
  topic: string;
  grade?: string;
  subject?: string;
  skillLevel?: "beginner" | "intermediate" | "advanced";
}

interface PromptResponse {
  content: {
    instructions: string;
    successCriteria: string;
    keyVocabulary: string[];
    scaffolding: string[];
  };
  metadata: {
    topic: string;
    grade?: string;
    subject?: string;
    skillLevel?: string;
    timestamp: string;
  };
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

export async function POST(req: Request) {
  try {
    const body: PromptRequest = await req.json();

    if (!body.topic) {
      return NextResponse.json(
        { error: "Missing required field: topic" },
        { status: 400 }
      );
    }

    const systemPrompt = `Generate an educational prompt with the following components clearly separated:
    - Detailed instructions for students
    - Success criteria
    - Key vocabulary (as a list)
    - Scaffolding suggestions (as a list)

    Consider these details:
    ${body.grade ? `Grade Level: ${body.grade}` : ""}
    ${body.subject ? `Subject: ${body.subject}` : ""}
    ${body.skillLevel ? `Skill Level: ${body.skillLevel}` : ""}
    
    Topic: ${body.topic}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response into sections
    const sections = text
      .split(/Instructions:|Success Criteria:|Key Vocabulary:|Scaffolding:/i)
      .filter((section) => section.trim().length > 0);

    const responseData: PromptResponse = {
      content: {
        instructions: sections[0]?.trim() ?? "",
        successCriteria: sections[1]?.trim() ?? "",
        keyVocabulary:
          sections[2]
            ?.trim()
            .split("\n")
            .map((word) => word.trim())
            .filter((word) => word.length > 0) ?? [],
        scaffolding:
          sections[3]
            ?.trim()
            .split("\n")
            .map((step) => step.trim())
            .filter((step) => step.length > 0) ?? [],
      },
      metadata: {
        topic: body.topic,
        grade: body.grade,
        subject: body.subject,
        skillLevel: body.skillLevel,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error generating educational prompt:", error);
    return NextResponse.json(
      {
        error: "Failed to generate educational prompt",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
