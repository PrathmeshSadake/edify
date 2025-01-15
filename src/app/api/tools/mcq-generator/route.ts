import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/api-client";
import { MCQGeneratorSchema } from "@/schemas/mcq-schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.topic || !body.taxonomyLevels || body.taxonomyLevels.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: topic and taxonomyLevels" },
        { status: 400 }
      );
    }

    const systemMessage = `You are an educational assessment expert who creates high-quality multiple choice questions. You must respond with a valid JSON object that exactly matches the specified schema structure. Do not include any additional text or explanations outside the JSON object.`;

    const userMessage = `Create multiple choice questions for:
    Topic: ${body.topic}
    Number of Options per Question: ${body.answersPerQuestion || 4}
    Bloom's Taxonomy Levels: ${body.taxonomyLevels.join(", ")}

    Return ONLY a JSON object with this exact structure:
    {
      "data": {
        "questions": [
          {
            "text": "string",
            "taxonomyLevel": "string",
            "answers": [
              {
                "text": "string",
                "isCorrect": boolean,
                "explanation": "string"
              }
            ],
            "explanation": "string"
          }
        ],
        "metadata": {
          "topic": "string",
          "difficulty": "string",
          "totalQuestions": number,
          "taxonomyLevels": ["string"],
          "timestamp": "string"
        }
      }
    }

    Ensure:
    1. Each question has exactly ${body.answersPerQuestion || 4} answer options
    2. Only one answer is marked as correct
    3. Each question matches its specified Bloom's taxonomy level
    4. Include explanations for both correct and incorrect answers
    
    The response must be valid JSON. Do not include any markdown formatting or additional text.`;

    console.log("Generating MCQs with prompt:", userMessage);

    const response = await generateAIResponse({
      prompt: systemMessage + "\n\n" + userMessage,
      schema: MCQGeneratorSchema,
    });

    console.log("Generated MCQs:", response);

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error generating MCQs:", error);
    let errorMessage = "Failed to generate MCQs";
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