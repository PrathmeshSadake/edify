import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Book, MessageSquare, ClipboardCheck, Brain } from "lucide-react";

const tools = [
  {
    title: "Lesson Planner",
    description:
      "Create comprehensive lesson plans with learning objectives and activities",
    icon: Book,
    href: "/tools/lesson-plan-generator",
  },
  {
    title: "Prompt Generator",
    description:
      "Generate engaging educational prompts for discussions and assignments",
    icon: MessageSquare,
    href: "/tools/prompt-generator",
  },
  {
    title: "Peel Generator",
    description:
      "Designed to enhance the clarity and coherence of your writing.",
    icon: Brain,
    href: "/tools/peel-generator",
  },
  {
    title: "Rubrik Generator",
    description: "Create detailed assessment rubrics for any subject or task",
    icon: ClipboardCheck,
    href: "/tools/rubric-generator",
  },
];

function ToolsGrid() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {tools.map((tool) => (
        <Card key={tool.title} className='hover:bg-accent transition-colors'>
          <Link href={tool.href}>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <tool.icon className='w-6 h-6 text-emerald-500' />
                <CardTitle>{tool.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{tool.description}</CardDescription>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}

export default ToolsGrid;
