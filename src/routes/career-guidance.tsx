/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StudentShell } from "@/components/StudentShell";
import {
  Compass,
  ArrowRight,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Building2,
} from "lucide-react";
import {
  PageHeader,
  Panel,
  StatusPill,
  IconBadge,
  toneClasses,
  type Tone,
} from "@/components/dashboard/ui";
import { CardGridSkeleton } from "@/components/dashboard/skeletons";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/career-guidance")({
  head: () => ({ meta: [{ title: "Career Guidance · Varsity Hub" }] }),
  component: CareerGuidance,
});

type EligibleProgrammeDto = {
  id: string;
  name: string;
  minAps: number | null;
  university: string;
  shortCode: string;
};

const tabs = ["Programmes you qualify for", "Explore Careers", "Assessment"];

const categories: { label: string; tone: Tone }[] = [
  { label: "Engineering", tone: "amber" },
  { label: "Health Sciences", tone: "rose" },
  { label: "Information Technology", tone: "primary" },
  { label: "Business & Finance", tone: "emerald" },
  { label: "Education", tone: "blue" },
  { label: "Creative Arts", tone: "fuchsia" },
];

const cardTones: Tone[] = ["primary", "violet", "blue", "emerald", "indigo", "teal"];

function CareerGuidance() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["me", "eligible-programmes"],
    queryFn: () => api.get<EligibleProgrammeDto[]>("/api/me/eligible-programmes"),
  });

  const programmes = data ?? [];

  return (
    <StudentShell>
      <PageHeader
        icon={Compass}
        eyebrow="Explore"
        title="Career Guidance"
        subtitle="Explore programmes you qualify for and career paths that match your strengths."
      />

      {/* Tabs (presentational) */}
      <div className="inline-flex flex-wrap gap-1 rounded-xl border border-border/70 bg-muted/40 p-1">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              i === 0
                ? "bg-card text-foreground shadow-(--shadow-xs)"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Based on your APS, you qualify for these programmes:
          </div>

          {isLoading && (
            <CardGridSkeleton
              media={false}
              columns="sm:grid-cols-2 xl:grid-cols-3"
              className="mt-6"
            />
          )}
          {isError && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-700">
              Couldn't load eligible programmes.
            </div>
          )}

          {!isLoading && !isError && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {programmes.map((p, i) => {
                const tone = cardTones[i % cardTones.length];
                return (
                  <div
                    key={p.id}
                    className="group flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-(--shadow-card) transition-all duration-200 hover:-translate-y-1 hover:shadow-(--shadow-md)"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <IconBadge icon={GraduationCap} tone={tone} size="lg" />
                      <StatusPill tone="emerald" dot={false}>Qualifies</StatusPill>
                    </div>
                    <h4 className="mt-3 font-semibold leading-tight tracking-tight">{p.name}</h4>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" /> {p.university}
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
                      <span className="text-xs text-muted-foreground">
                        {p.minAps != null ? `Min APS ${p.minAps}` : "APS not specified"}
                      </span>
                      <StatusPill tone={tone} dot={false}>{p.shortCode}</StatusPill>
                    </div>
                  </div>
                );
              })}
              {programmes.length === 0 && (
                <div className="sm:col-span-2 xl:col-span-3 rounded-2xl border border-border/60 bg-card p-12 text-center text-sm text-muted-foreground">
                  No eligible programmes yet. Capture your Grade 12 results to see matches.
                </div>
              )}
            </div>
          )}

          {!isLoading && !isError && programmes.length === 0 && (
            <Link to={"/academic-results" as string} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Add academic results <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <Panel icon={Compass} tone="violet" title="Explore Careers" description="Browse by field">
          <ul className="space-y-1.5">
            {categories.map((c) => (
              <li key={c.label}>
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium transition-colors hover:border-border/60 hover:bg-muted/40"
                >
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", toneClasses(c.tone).bar)} />
                  <span className="flex-1">{c.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            View all careers <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </Panel>
      </div>
    </StudentShell>
  );
}
