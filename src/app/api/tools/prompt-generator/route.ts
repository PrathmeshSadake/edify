import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/api-client";
import { PromptGeneratorResponseSchema } from "@/schemas/prompt-schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received request body:", body);

    if (!body.originalPrompt) {
      return NextResponse.json(
        { error: "Missing required field: originalPrompt" },
        { status: 400 }
      );
    }

    const systemMessage = `You are an educational prompt engineering expert who creates engaging and effective prompts. You must respond with a valid JSON object that exactly matches the specified schema structure. Do not include any additional text or explanations outside the JSON object.`;

    const userMessage = `Generate refined educational prompts for:
    Original Prompt: ${body.originalPrompt}
    Grade Level: ${body.grade || "Not specified"}
    Subject: ${body.subject || "Not specified"}
    Skill Level: ${body.skillLevel || "intermediate"}

    Return ONLY a JSON object with this exact structure:
    {
      "data": {
        "originalPrompt": "string",
        "refinedPrompts": [
          {
            "promptText": "string",
            "explanation": {
              "explanation": "string",
              "focusAreas": ["string"],
              "complexityLevel": {
                "cognitiveLoad": number (1-5),
                "bloomsLevel": "string"
              }
            },
            "ratings": {
              "averageRating": number,
              "totalRatings": number
            }
          }
        ],
        "metadata": {
          "processingTimeMs": number,
          "version": "string"
        }
      }
    }

    For each refined prompt:
    1. Make it clear and actionable
    2. Include pedagogical approach
    3. Consider cognitive load
    4. Align with Bloom's Taxonomy
    5. Provide clear focus areas

    The response must be valid JSON. Do not include any markdown formatting or additional text.`;

    console.log("Generating prompts with prompt:", userMessage);

    const response = await generateAIResponse({
      prompt: systemMessage + "\n\n" + userMessage,
      schema: PromptGeneratorResponseSchema,
    });

    console.log("Generated prompts:", response);

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error generating prompts:", error);
    let errorMessage = "Failed to generate prompts";
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
