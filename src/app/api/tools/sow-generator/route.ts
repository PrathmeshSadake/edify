import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/api-client";
import { SOWSchema } from "@/schemas/sow-schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received request body:", body);

    if (!body.subject || !body.topic || !body.ageGroup) {
      return NextResponse.json(
        { error: "Missing required fields: subject, topic, and age group" },
        { status: 400 }
      );
    }

    const systemMessage = `You are a curriculum planning expert who creates detailed schemes of work. You must respond with a valid JSON object that exactly matches the specified schema structure. Do not include any additional text or explanations outside the JSON object.`;

    const userMessage = `Create a scheme of work with the following details:

    Subject: ${body.subject}
    Topic: ${body.topic}
    Year Group: ${body.ageGroup.year}
    Age Range: ${body.ageGroup.ageRange.join("-")}
    Total Lessons: ${body.totalLessons || 6}
    Lesson Duration: ${body.lessonDuration || 60} minutes

    Emphasis Areas: ${body.userPreferences?.emphasisAreas?.join(", ") || "Not specified"}
    Difficulty Level: ${body.userPreferences?.difficultyLevel || "intermediate"}

    Return ONLY a JSON object with this exact structure:
    {
      "data": {
        "subject": "string",
        "topic": "string",
        "ageGroup": {
          "year": number,
          "ageRange": [number, number]
        },
        "overarchingObjectives": ["string"],
        "lessons": [
          {
            "lessonNumber": number,
            "duration": number,
            "learningObjectives": ["string"],
            "activities": [
              {
                "title": "string",
                "description": "string",
                "duration": number,
                "resources": ["string"]
              }
            ],
            "assessment": ["string"],
            "differentiation": {
              "support": ["string"],
              "core": ["string"],
              "extension": ["string"]
            }
          }
        ],
        "metadata": {
          "author": "string",
          "createdAt": "string",
          "version": "string"
        }
      }
    }

    Ensure:
    1. Each lesson has clear objectives and activities
    2. Activities have appropriate durations
    3. Include assessment opportunities
    4. Consider differentiation strategies
    5. List required resources

    The response must be valid JSON. Do not include any markdown formatting or additional text.`;

    console.log("Generating SOW with prompt:", userMessage);

    const response = await generateAIResponse({
      prompt: systemMessage + "\n\n" + userMessage,
      schema: SOWSchema,
    });

    console.log("Generated SOW:", response);

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error generating SOW:", error);
    let errorMessage = "Failed to generate scheme of work";
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