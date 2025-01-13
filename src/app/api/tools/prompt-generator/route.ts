import openai from "@/lib/openai";
import {
  PromptGeneratorResponse,
  PromptGeneratorResponseSchema,
} from "@/schemas/prompt-schema";
import { NextResponse } from "next/server";

interface PromptRequest {
  topic: string;
  grade?: string;
  subject?: string;
  skillLevel?: string;
}

export async function POST(req: Request) {
  try {
    const startTime = Date.now();
    const body: PromptRequest = await req.json();

    if (!body.topic) {
      return NextResponse.json(
        { error: "Missing required field: topic" },
        { status: 400 }
      );
    }

    const systemMessage = `You are an educational prompt generator. Your responses must be valid JSON objects that strictly follow the provided schema structure. Generate exactly three different versions of educational prompts based on the given topic and parameters.`;

    const userMessage = `Generate three educational prompts following this exact schema:
    ${JSON.stringify(PromptGeneratorResponseSchema.shape, null, 2)}

    Each prompt must include:
    1. Clear prompt text
    2. Pedagogical approach explanation
    3. Specific focus areas
    4. Complexity level (Bloom's Taxonomy and cognitive load 1-5)

    Topic: ${body.topic}
    ${body.grade ? `Grade Level: ${body.grade}` : ""}
    ${body.subject ? `Subject: ${body.subject}` : ""}
    ${body.skillLevel ? `Skill Level: ${body.skillLevel}` : ""}

    Ensure each prompt has different:
    - Bloom's Taxonomy levels
    - Cognitive load ratings
    - Pedagogical approaches
    - Focus areas

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

    // Parse and validate the response
    const parsedResponse = JSON.parse(responseContent);

    const responseData: PromptGeneratorResponse = {
      ...parsedResponse,
      metadata: {
        generatedAt: new Date().toISOString(),
        version: "1.0.0",
        processingTimeMs: Date.now() - startTime,
      },
    };

    // Validate against schema
    const validatedResponse = PromptGeneratorResponseSchema.parse(responseData);

    return NextResponse.json(validatedResponse, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating educational prompt:", error);

    return NextResponse.json(
      {
        error: "Failed to generate educational prompt",
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
