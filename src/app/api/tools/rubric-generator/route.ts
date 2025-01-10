import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

interface RubricRequest {
  task: string;
  subject?: string;
  grade?: string;
  criteriaCount?: number;
  performanceLevels?: string[];
}

interface RubricResponse {
  content: {
    criteria: {
      name: string;
      description: string;
      levels: {
        level: string;
        description: string;
        points: number;
      }[];
    }[];
  };
  metadata: {
    task: string;
    subject?: string;
    grade?: string;
    timestamp: string;
  };
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

export async function POST(req: Request) {
  try {
    const body: RubricRequest = await req.json();

    if (!body.task) {
      return NextResponse.json(
        { error: "Missing required field: task" },
        { status: 400 }
      );
    }

    const systemPrompt = `Generate a detailed assessment rubric with the following structure:
    - Each criterion should have a clear name and description
    - For each criterion, provide performance level descriptions and point values
    - Performance levels should be: Excellent (4), Proficient (3), Developing (2), Beginning (1)

    Consider these details:
    ${body.subject ? `Subject: ${body.subject}` : ""}
    ${body.grade ? `Grade Level: ${body.grade}` : ""}
    Number of criteria: ${body.criteriaCount || 4}
    
    Task to assess: ${body.task}
    
    Format the response as structured data with clear sections for each criterion and its performance levels.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Process and structure the response
    const sections = text
      .split(/Criterion \d+:|Criteria \d+:/i)
      .filter((section) => section.trim().length > 0);

    const criteria = sections.map((section) => {
      const lines = section
        .trim()
        .split("\n")
        .filter((line) => line.trim());
      const name = lines[0]?.trim() ?? "";
      const description = lines[1]?.trim() ?? "";

      const levels = [
        { level: "Excellent", points: 4 },
        { level: "Proficient", points: 3 },
        { level: "Developing", points: 2 },
        { level: "Beginning", points: 1 },
      ].map((level) => ({
        ...level,
        description:
          lines
            .find((l) => l.includes(level.level))
            ?.replace(level.level, "")
            .trim() ?? "",
      }));

      return { name, description, levels };
    });

    const responseData: RubricResponse = {
      content: { criteria },
      metadata: {
        task: body.task,
        subject: body.subject,
        grade: body.grade,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error generating rubric:", error);
    return NextResponse.json(
      {
        error: "Failed to generate rubric",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
