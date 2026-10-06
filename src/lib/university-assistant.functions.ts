import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getServerConfig } from "./config.server";

const chatMessagesSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .min(1)
    .max(12),
});

type GroqChatResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

export const askUniversityAssistant = createServerFn({ method: "POST" })
  .validator(chatMessagesSchema)
  .handler(async ({ data }) => {
    const { groqApiKey } = getServerConfig();
    if (!groqApiKey) {
      throw new Error(
        "The university assistant is not configured. Set GROQ_API_KEY on the server.",
      );
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        temperature: 0.4,
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content:
              "You are Varsity Hub's helpful assistant for South African higher education. Answer questions about South African universities, applications, admissions, APS, programmes, funding and student life. Be clear, practical, and concise. Requirements and deadlines change, so encourage users to confirm important details with the relevant university or official source. If a question is unrelated to South African universities or higher education, politely say you can help with those topics and invite a relevant question. Never claim to submit applications or verify live information.",
          },
          ...data.messages,
        ],
      }),
    });

    if (!response.ok) {
      console.error(`Groq university assistant request failed with HTTP ${response.status}.`);
      throw new Error("The assistant could not answer right now. Please try again shortly.");
    }

    const result = (await response.json()) as GroqChatResponse;
    const reply = result.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || reply.trim().length === 0) {
      console.error("Groq university assistant returned an invalid response.");
      throw new Error("The assistant returned an empty response. Please try again.");
    }

    return { reply: reply.trim() };
  });
