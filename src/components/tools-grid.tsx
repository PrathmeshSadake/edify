"use client";

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

  // {
  //   title: "Rubrik Generator",
  //   description: "Create detailed assessment rubrics for any subject or task",
  //   icon: ClipboardCheck,
  //   href: "/tools/rubric-generator",
  // },
];

const disabledTools = [
  {
    title: "Peel Generator",
    description:
      "Designed to enhance the clarity and coherence of your writing.",
    icon: Brain,
    href: "/tools/peel-generator",
  },
  {
    title: "Quiz Generator",
    description: "Coming soon",
    icon: MessageSquare,
    href: "#",
  },
  {
    title: "Report Generator",
    description: "Coming soon",
    icon: ClipboardCheck,
    href: "#",
  },
  {
    title: "MCQ Generator",
    description: "Coming soon",
    icon: Brain,
    href: "#",
  },
  {
    title: "SOW Generator",
    description: "Coming soon",
    icon: Book,
    href: "#",
  },
];

export default function ToolsGrid() {
  return (
    <div className='max-w-6xl mx-auto px-4'>
      <div className='text-center mb-12'>
        <h1 className='text-5xl font-bold text-[#70CDB3] mb-4'>Our AI Tools</h1>
        <p className='text-muted-foreground max-w-3xl mx-auto'>
          These tools are crafted to inspire and nurture critical thinking,
          serving as a companion to both teaching and learning. They're here to
          present thoughtful options, prompting deeper reflection and
          exploration.
        </p>
      </div>
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {tools.map((tool) => (
          <Link href={tool.href} key={tool.title}>
            <Card className='h-full hover:bg-accent/50 transition-colors cursor-pointer'>
              <CardHeader>
                <div className='flex items-center gap-2'>
                  <tool.icon className='w-6 h-6 text-[#70CDB3]' />
                  <CardTitle className='text-lg'>{tool.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
        {disabledTools.map((tool) => (
          <div key={tool.title}>
            <Card className='h-full opacity-50 cursor-not-allowed'>
              <CardHeader>
                <div className='flex items-center gap-2'>
                  <tool.icon className='w-6 h-6 text-[#70CDB3]' />
                  <CardTitle className='text-lg'>{tool.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
