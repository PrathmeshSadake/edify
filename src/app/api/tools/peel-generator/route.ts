import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

interface PEELRequest {
  topic: string;
  subject?: string;
  complexity?: string;
}

interface PEELContent {
  point: string;
  evidence: string;
  explanation: string;
  link: string;
}

interface PEELResponse {
  content: PEELContent;
  metadata: {
    subject?: string;
    complexity?: string;
    timestamp: string;
  };
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Helper function to extract JSON from text that might contain markdown
function extractJSON(text: string): PEELContent {
  try {
    // First, try parsing the text directly
    return JSON.parse(text) as PEELContent;
  } catch (e) {
    // If direct parsing fails, try to extract JSON from markdown
    const jsonMatch = text.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]) as PEELContent;
      } catch (e) {
        throw new Error("Failed to parse JSON from markdown");
      }
    }

    // If no JSON found in markdown, try to extract structured content
    const sections = {
      point: text.match(/["']point["']\s*:\s*["']([^"']+)["']/)?.[1],
      evidence: text.match(/["']evidence["']\s*:\s*["']([^"']+)["']/)?.[1],
      explanation: text.match(
        /["']explanation["']\s*:\s*["']([^"']+)["']/
      )?.[1],
      link: text.match(/["']link["']\s*:\s*["']([^"']+)["']/)?.[1],
    };

    if (
      sections.point &&
      sections.evidence &&
      sections.explanation &&
      sections.link
    ) {
      return sections as PEELContent;
    }

    throw new Error("Could not extract valid PEEL content from response");
  }
}

export async function POST(req: Request) {
  try {
    const body: PEELRequest = await req.json();

    if (!body.topic) {
      return NextResponse.json(
        { error: "Missing required field: topic" },
        { status: 400 }
      );
    }

    const systemPrompt = `Generate a well-structured PEEL paragraph about the following topic: ${
      body.topic
    }
    ${body.subject ? `Subject area: ${body.subject}` : ""}
    ${body.complexity ? `Complexity level: ${body.complexity}` : ""}
    
    Return ONLY a JSON object with these exact keys:
    {
      "point": "A clear statement of the main idea or argument",
      "evidence": "Specific examples, data, or quotes that support the point",
      "explanation": "Analysis of how the evidence supports the point",
      "link": "A connection back to the main argument or transition to the next paragraph"
    }
    
    Do not include any additional text, markdown formatting, or code block markers.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Extract and validate the JSON content
    const peelContent = extractJSON(text);

    // Validate that all required fields are present
    if (
      !peelContent.point ||
      !peelContent.evidence ||
      !peelContent.explanation ||
      !peelContent.link
    ) {
      throw new Error("Incomplete PEEL content received");
    }

    const responseData: PEELResponse = {
      content: peelContent,
      metadata: {
        subject: body.subject,
        complexity: body.complexity,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(responseData, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating PEEL paragraph:", error);

    return NextResponse.json(
      {
        error: "Failed to generate PEEL paragraph",
        details: error instanceof Error ? error.message : "Unknown error",
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
