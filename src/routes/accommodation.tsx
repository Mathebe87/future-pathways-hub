/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Home, Search, MapPin, ShieldCheck, Heart, Star, BedDouble,
  Wifi, Bus, Utensils, Sparkles, Tag,
} from "lucide-react";
import { StudentShell } from "@/components/StudentShell";
import { PageHeader, StatCard, Panel, StatusPill, btn } from "@/components/dashboard/ui";
import { CardGridSkeleton } from "@/components/dashboard/skeletons";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/accommodation")({
  head: () => ({ meta: [{ title: "Accommodation Hub · Varsity Hub" }] }),
  component: Accommodation,
});

type Accommodation = {
  id: string;
  name: string;
  type: string;
  pricePerMonth: number;
  campus: string | null;
  distanceText: string | null;
  rating: number | null;
  reviewsCount: number;
  amenities: string[];
  isVerified: boolean;
  nsfasAccredited: boolean;
  isFavourited: boolean;
};

const typeLabels: Record<string, string> = {
  single_room: "Single Room",
  shared_room: "Shared Room",
  bachelor: "Bachelor",
  res: "Res",
  apartment: "Apartment",
};
const tabs = [
  { id: "all", label: "All" },
  { id: "single_room", label: "Single Room" },
  { id: "shared_room", label: "Shared Room" },
  { id: "bachelor", label: "Bachelor" },
  { id: "res", label: "Res" },
];

const amenityMeta: Record<string, { icon: typeof Wifi; label: string }> = {
  wifi: { icon: Wifi, label: "Wi-Fi" },
  meals: { icon: Utensils, label: "Meals" },
  transport: { icon: Bus, label: "Transport" },
};
const typeEmoji: Record<string, string> = {
  single_room: "🏢",
  shared_room: "🏘️",
  bachelor: "🏬",
  res: "🏫",
  apartment: "🏙️",
};

function Accommodation() {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(6000);
  const [nsfasOnly, setNsfasOnly] = useState(false);
  const [favOverride, setFavOverride] = useState<Record<string, boolean>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["accommodations", tab, nsfasOnly],
    queryFn: () => {
      const qs = new URLSearchParams();
      if (tab !== "all") qs.set("type", tab);
      if (nsfasOnly) qs.set("nsfasOnly", "true");
      return api.get<Accommodation[]>(`/api/Accommodations?${qs.toString()}`);
    },
  });

  const favourite = useMutation({
    mutationFn: ({ id, on }: { id: string; on: boolean }) =>
      on ? api.post(`/api/Accommodations/${id}/favourite`) : api.del(`/api/Accommodations/${id}/favourite`),
  });

  const isFav = (a: Accommodation) => favOverride[a.id] ?? a.isFavourited;
  function toggleFav(a: Accommodation) {
    const next = !isFav(a);
    setFavOverride((m) => ({ ...m, [a.id]: next }));
    favourite.mutate({ id: a.id, on: next });
  }

  const all = data ?? [];
  const filtered = useMemo(
    () =>
      all.filter(
        (p) =>
          p.pricePerMonth <= maxPrice &&
          (query === "" ||
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.campus ?? "").toLowerCase().includes(query.toLowerCase())),
      ),
    [all, query, maxPrice],
  );
  const savedCount = all.filter(isFav).length;

  return (
    <StudentShell>
      <PageHeader
        icon={Home}
        eyebrow="Opportunities"
        title="Accommodation Hub"
        subtitle="Find safe, verified student accommodation near your university."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Home} tone="primary" label="Listings" value={all.length || "—"} />
        <StatCard icon={ShieldCheck} tone="emerald" label="Verified" value={all.filter((a) => a.isVerified).length} />
        <StatCard icon={Sparkles} tone="indigo" label="NSFAS accredited" value={all.filter((a) => a.nsfasAccredited).length} />
        <StatCard icon={Heart} tone="rose" label="Saved" value={savedCount} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <Panel title="Filters" className="h-fit">
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Search</label>
              <div className="relative mt-1.5">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="University or area…"
                  className="w-full rounded-lg border border-border/70 bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">Max price / month</label>
                <span className="text-xs font-bold text-primary">R {maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range" min={2000} max={6000} step={100} value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={nsfasOnly} onChange={(e) => setNsfasOnly(e.target.checked)} className="accent-primary" />
              NSFAS accredited only
            </label>
          </div>
        </Panel>

        {/* Results */}
        <div>
          <div className="mb-4 inline-flex flex-wrap gap-1 rounded-xl border border-border/70 bg-muted/40 p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === t.id ? "bg-card text-foreground shadow-(--shadow-xs)" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {isLoading && <CardGridSkeleton columns="sm:grid-cols-2" />}
          {isError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-700">
              Couldn't load accommodation right now. Please try again shortly.
            </div>
          )}

          {!isLoading && !isError && (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((p) => (
                <div key={p.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-(--shadow-card) transition-all hover:-translate-y-1 hover:shadow-(--shadow-md)">
                  <div className="relative flex h-36 items-center justify-center bg-linear-to-br from-primary/10 to-brand-cyan/10 text-5xl">
                    {typeEmoji[p.type] ?? "🏠"}
                    <button
                      onClick={() => toggleFav(p)}
                      className={cn(
                        "absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm transition-colors",
                        isFav(p) ? "text-rose-500" : "text-muted-foreground hover:text-rose-500",
                      )}
                      aria-label="Save accommodation"
                    >
                      <Heart className={cn("h-4 w-4", isFav(p) && "fill-current")} />
                    </button>
                    {p.isVerified && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-tight">{p.name}</h3>
                      {p.nsfasAccredited && <StatusPill tone="indigo" dot={false} className="shrink-0 px-2 py-0.5 text-[10px]">NSFAS</StatusPill>}
                    </div>
                    {(p.distanceText || p.campus) && (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {p.distanceText ?? p.campus}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {typeLabels[p.type] ?? p.type}</span>
                      {p.rating != null && (
                        <span className="inline-flex items-center gap-0.5 text-amber-500">
                          <Star className="h-3 w-3 fill-current" /> {p.rating} <span className="text-muted-foreground">({p.reviewsCount})</span>
                        </span>
                      )}
                    </div>
                    {p.amenities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.amenities.map((a) => {
                          const A = amenityMeta[a];
                          return (
                            <span key={a} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                              {A ? <A.icon className="h-3 w-3" /> : <Tag className="h-3 w-3" />} {A?.label ?? a}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3">
                      <span className="text-base font-bold text-primary">
                        R {p.pricePerMonth.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span>
                      </span>
                      <button className={cn(btn.primary, "h-8 px-3 py-0 text-xs")}>View</button>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="sm:col-span-2 rounded-2xl border border-border/60 bg-card p-12 text-center text-sm text-muted-foreground">
                  No accommodation matches your filters.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </StudentShell>
  );
}
