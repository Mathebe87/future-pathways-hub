import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { askUniversityAssistant } from "@/lib/university-assistant.functions";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const welcomeMessage: ChatMessage = {
  role: "assistant",
  content: "Hi! Ask me about South African universities, APS, applications, programmes or funding.",
};

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function UniversityAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    conversationRef.current?.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending, error]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    const history = nextMessages.filter((message) => message !== welcomeMessage).slice(-12);
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const { reply } = await askUniversityAssistant({ data: { messages: history } });
      setMessages((current) => [...current, { role: "assistant", content: reply }]);
    } catch (caughtError) {
      setError(errorMessage(caughtError));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          aria-label="South African university assistant"
          className="flex h-[min(34rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-lg)]"
        >
          <header className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-foreground/15">
                <Bot aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">University assistant</h2>
                <p className="text-xs text-primary-foreground/75">South African higher education</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close university assistant"
              onClick={() => setIsOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </header>

          <div
            ref={conversationRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-label="Conversation"
            className="flex-1 space-y-3 overflow-y-auto p-4"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[94%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    message.role === "user"
                      ? "whitespace-pre-wrap rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted text-foreground"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="space-y-3 leading-6">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h3 className="border-b border-border pb-1.5 text-base font-bold leading-snug">
                              {children}
                            </h3>
                          ),
                          h2: ({ children }) => (
                            <h3 className="border-b border-border pb-1.5 text-base font-bold leading-snug">
                              {children}
                            </h3>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-bold leading-snug text-foreground">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => <p className="leading-6">{children}</p>,
                          ul: ({ children }) => (
                            <ul className="list-disc space-y-1.5 pl-5 marker:text-primary">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-primary">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => <li className="pl-0.5 leading-6">{children}</li>,
                          strong: ({ children }) => (
                            <strong className="font-semibold text-foreground">{children}</strong>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-primary/50 pl-3 text-muted-foreground">
                              {children}
                            </blockquote>
                          ),
                          a: ({ children, href }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-primary underline underline-offset-2"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
                <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                Thinking…
              </div>
            )}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={2000}
              placeholder="Ask about universities…"
              aria-label="Ask a question"
              className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              aria-label="Send question"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send aria-hidden="true" className="h-4 w-4" />
            </button>
          </form>
          <p className="px-3 pb-3 text-center text-[11px] text-muted-foreground">
            AI responses may be inaccurate. Avoid sharing personal details and confirm requirements
            with the university.
          </p>
        </section>
      )}

      <button
        type="button"
        aria-label={isOpen ? "Close university assistant" : "Open university assistant"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-lg)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {isOpen ? (
          <X aria-hidden="true" className="h-6 w-6" />
        ) : (
          <MessageCircle aria-hidden="true" className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
