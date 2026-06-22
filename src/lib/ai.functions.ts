import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

function handleAiError(err: unknown): never {
  const e = err as { statusCode?: number; message?: string };
  if (e?.statusCode === 429) {
    throw new Error("AI rate limit exceeded. Please try again in a moment.");
  }
  if (e?.statusCode === 402) {
    throw new Error("AI credits exhausted. Please add credits to continue.");
  }
  throw new Error(e?.message || "AI request failed");
}

/* ------------------------------ Email ------------------------------ */

const EmailInput = z.object({
  emailType: z.string(),
  recipient: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  purpose: z.string().min(1).max(2000),
  tone: z.string(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const gateway = getGateway();
      const { text } = await generateText({
        model: gateway(MODEL),
        system:
          "You are an expert email writer. Produce clear, well-structured emails. Output the email body only (no preamble, no subject line, no markdown fences). Include a greeting and signoff.",
        prompt: `Write a ${data.tone.toLowerCase()} ${data.emailType.toLowerCase()} email.

Recipient: ${data.recipient}
Subject: ${data.subject}
Purpose / Instructions: ${data.purpose}

Keep it concise and natural.`,
      });
      return { email: text.trim() };
    } catch (e) {
      handleAiError(e);
    }
  });

/* ------------------------------ Meeting Summarizer ------------------------------ */

const MeetingInput = z.object({
  title: z.string().min(1).max(200),
  participants: z.string().max(500).optional().default(""),
  notes: z.string().min(10).max(20000),
});

const MeetingSummarySchema = z.object({
  executiveSummary: z.string(),
  keyPoints: z.array(z.string()),
  decisions: z.array(z.string()),
  actionItems: z.array(z.object({ task: z.string(), owner: z.string() })),
  followUps: z.array(z.string()),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MeetingInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const gateway = getGateway();
      const { output } = await generateText({
        model: gateway(MODEL),
        output: Output.object({ schema: MeetingSummarySchema }),
        system:
          "You summarize meeting notes into structured outputs. Be concise, factual, and useful.",
        prompt: `Meeting Title: ${data.title}
Participants: ${data.participants || "Not specified"}

Notes / Transcript:
${data.notes}

Produce a structured summary.`,
      });
      return output;
    } catch (e) {
      handleAiError(e);
    }
  });

/* ------------------------------ Task Planner ------------------------------ */

const PlannerInput = z.object({
  goals: z.string().min(1).max(2000),
  tasks: z.string().min(1).max(4000),
  deadline: z.string().max(100).optional().default(""),
  priority: z.string(),
  hoursPerDay: z.number().min(1).max(16),
});

const PlanSchema = z.object({
  prioritizedTasks: z.array(
    z.object({
      title: z.string(),
      priority: z.string(),
      estimateHours: z.number(),
    }),
  ),
  dailyPlan: z.array(
    z.object({
      day: z.string(),
      blocks: z.array(z.object({ time: z.string(), task: z.string() })),
    }),
  ),
  weeklyOverview: z.string(),
  recommendations: z.array(z.string()),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlannerInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const gateway = getGateway();
      const { output } = await generateText({
        model: gateway(MODEL),
        output: Output.object({ schema: PlanSchema }),
        system:
          "You are an expert productivity coach. Create realistic, prioritized schedules.",
        prompt: `Goals: ${data.goals}
Tasks: ${data.tasks}
Deadline: ${data.deadline || "Flexible"}
Priority Level: ${data.priority}
Available Working Hours per Day: ${data.hoursPerDay}

Generate a prioritized task list with time estimates, a daily plan (up to 5 days), a weekly overview, and recommendations.`,
      });
      return output;
    } catch (e) {
      handleAiError(e);
    }
  });
