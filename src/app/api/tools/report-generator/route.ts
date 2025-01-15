import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/api-client";
import { reportGeneratorSchema } from "@/schemas/report-generator-schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received request body:", body);

    if (!body.studentDetails) {
      return NextResponse.json(
        { error: "Missing required student details" },
        { status: 400 }
      );
    }

    const systemMessage = `You are an educational professional who writes detailed student progress reports. You must respond with a valid JSON object that exactly matches the specified schema structure. Do not include any additional text or explanations outside the JSON object.`;

    const userMessage = `Generate a student progress report with the following details:

    Student Details:
    - Strengths: ${body.studentDetails.strengths}
    - Areas of Development: ${body.studentDetails.areasOfDevelopment}
    - Progress: ${body.studentDetails.progress}
    
    Word Count: ${body.config?.wordCount || 300}
    Student ID: ${body.studentDetails.studentId || 'Student ' + Math.floor(Math.random() * 1000)}

    Return ONLY a JSON object with this exact structure:
    {
      "data": {
        "output": {
          "reportSections": {
            "overarchingAssessment": "string",
            "target": "string",
            "supportiveEndNote": "string"
          },
          "completeReport": "string",
          "metadata": {
            "studentId": "string",
            "generatedAt": "string",
            "wordCount": number,
            "version": "string"
          }
        }
      }
    }

    The report should be professional, constructive, and encouraging. Include specific examples and actionable recommendations.
    The response must be valid JSON. Do not include any markdown formatting or additional text.`;

    console.log("Generating report with prompt:", userMessage);

    const response = await generateAIResponse({
      prompt: systemMessage + "\n\n" + userMessage,
      schema: reportGeneratorSchema,
    });

    console.log("Generated report:", response);

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error generating report:", error);
    let errorMessage = "Failed to generate report";
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