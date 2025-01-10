import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

interface PEELRequest {
  topic: string;
  subject?: string;
  complexity?: "basic" | "intermediate" | "advanced";
}

interface PEELResponse {
  content: {
    point: string;
    evidence: string;
    explanation: string;
    link: string;
  };
  metadata: {
    topic: string;
    subject?: string;
    complexity?: string;
    timestamp: string;
  };
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

export async function POST(req: Request) {
  try {
    const body: PEELRequest = await req.json();

    if (!body.topic) {
      return NextResponse.json(
        { error: "Missing required field: topic" },
        { status: 400 }
      );
    }

    const systemPrompt = `Generate a structured PEEL paragraph analysis with clear separation between each component for the following topic.
    Consider these details:
    ${body.subject ? `Subject Area: ${body.subject}` : ""}
    ${body.complexity ? `Complexity Level: ${body.complexity}` : ""}
    
    Topic: ${body.topic}
    
    Format the response with clear headings for:
    - Point (main argument)
    - Evidence (supporting facts)
    - Explanation (analysis)
    - Link (connection back to topic)`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse the generated text into PEEL components
    const sections = text
      .split(/Point:|Evidence:|Explanation:|Link:/i)
      .filter((section) => section.trim().length > 0);

    const responseData: PEELResponse = {
      content: {
        point: sections[0]?.trim() ?? "",
        evidence: sections[1]?.trim() ?? "",
        explanation: sections[2]?.trim() ?? "",
        link: sections[3]?.trim() ?? "",
      },
      metadata: {
        topic: body.topic,
        subject: body.subject,
        complexity: body.complexity,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error generating PEEL paragraph:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PEEL paragraph",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
