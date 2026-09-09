import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { format } from "date-fns";
import {
  Eye,
  User,
  IdCard,
  Mail,
  Phone,
  Lock,
  Calendar as CalendarIcon,
  ChevronDown,
  MapPin,
  ShieldCheck,
  GraduationCap,
  FileBadge,
  Building2,
  UsersRound,
  Globe2,
  BookUser,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import heroImage from "@/assets/hero-student.png";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { api, ApiError } from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register · Varsity Hub" }] }),
  component: Register,
});

type StudentType = "sa" | "international";

function Field({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  withEye,
  value,
  onChange,
  name,
}: {
  label: string;
  type?: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  withEye?: boolean;
  value?: string;
  onChange?: (v: string) => void;
  name?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-foreground">{label}</label>
      <div className="relative mt-1">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full rounded-lg border border-border/60 bg-background py-2.5 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {withEye && (
          <Eye className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();
  const [studentType, setStudentType] = useState<StudentType>("sa");
  const [dob, setDob] = useState<Date>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirmPassword") ?? "");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const payload = {
      fullName: String(fd.get("fullName") ?? "").trim(),
      email,
      phone: phone || null,
      password,
      channel: "email",
    };
    setBusy(true);
    try {
      await api.post("/api/Auth/register", payload, { auth: false });
      navigate({ to: "/register-success" });
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? "Registration is not available yet — check the backend /api/Auth/register endpoint."
          : err instanceof ApiError
            ? err.message
            : "Could not create your account. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.012_250)]">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="rounded-2xl border border-border/60 bg-white p-8 shadow-(--shadow-card)">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Join thousands of students and take the next step towards your future.
            </p>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                I am a
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "sa" as const, label: "South African Student", icon: IdCard },
                    { id: "international" as const, label: "International Student", icon: Globe2 },
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setStudentType(id)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border p-3 text-left text-sm font-medium transition-all",
                      studentType === id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border/60 hover:bg-muted/50",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full Name" name="fullName" placeholder="Enter your full name" icon={User} />
                {studentType === "sa" ? (
                  <Field label="ID Number" placeholder="Enter your ID number" icon={IdCard} />
                ) : (
                  <Field label="Passport Number" placeholder="Enter passport number" icon={BookUser} />
                )}
              </div>
              {studentType === "international" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold">Country of Origin</label>
                    <div className="relative mt-1">
                      <Globe2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <select className="w-full appearance-none rounded-lg border border-border/60 bg-background py-2.5 pl-9 pr-9 text-sm">
                        <option>Select country</option>
                        <option>Nigeria</option>
                        <option>Zimbabwe</option>
                        <option>Botswana</option>
                        <option>Other</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                  <Field label="Study Permit (optional)" placeholder="Permit number" icon={FileBadge} />
                </div>
              )}
              <Field label="Email Address" name="email" type="email" placeholder="Enter your email address" icon={Mail} />
              <Field label="Phone Number" name="phone" placeholder="Enter your phone number" icon={Phone} />
              <Field label="Password" name="password" type="password" placeholder="Create a password" icon={Lock} withEye />
              <Field
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                icon={Lock}
                withEye
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold">Date of Birth</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "mt-1 flex w-full items-center rounded-lg border border-border/60 bg-background py-2.5 pl-9 pr-3 text-left text-sm",
                          !dob && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="absolute ml-[-1.5rem] h-4 w-4 text-muted-foreground" />
                        {dob ? format(dob, "dd MMMM yyyy") : "Select date of birth"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dob}
                        onSelect={setDob}
                        disabled={(date) => date > new Date()}
                        captionLayout="dropdown"
                        fromYear={1990}
                        toYear={2012}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-xs font-semibold">Gender</label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select className="w-full appearance-none rounded-lg border border-border/60 bg-background py-2.5 pl-9 pr-9 text-sm text-muted-foreground">
                      <option>Select your gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </div>
              {studentType === "sa" && (
                <div>
                  <label className="text-xs font-semibold">Province</label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <select className="w-full appearance-none rounded-lg border border-border/60 bg-background py-2.5 pl-9 pr-9 text-sm text-muted-foreground">
                      <option>Select your province</option>
                      <option>Gauteng</option>
                      <option>Western Cape</option>
                      <option>KwaZulu Natal</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              )}

              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input type="checkbox" className="mt-0.5" required />
                <span>
                  I agree to the{" "}
                  <a className="font-semibold text-primary underline" href="#">
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a className="font-semibold text-primary underline" href="#">
                    Privacy Policy
                  </a>
                </span>
              </label>

              {error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? "Creating account…" : "Continue to verification"}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-primary underline">
                  Login here
                </Link>
              </p>
            </form>
          </div>

          <div className="sticky top-28 relative mx-auto hidden aspect-square w-full max-w-md items-center justify-center lg:flex">
            <div
              className="absolute inset-10 -z-10 rounded-full opacity-25 blur-3xl"
              style={{ backgroundImage: "var(--gradient-brand)" }}
            />
            <div className="absolute inset-0 rounded-full border-2 border-[oklch(0.72_0.15_230/0.45)]" />
            <div className="absolute inset-6 rounded-full border border-dashed border-[oklch(0.72_0.15_230/0.55)]" />
            <FloatBadge className="left-2 top-[18%]">
              <Building2 className="h-6 w-6 text-primary" />
            </FloatBadge>
            <FloatBadge className="right-2 top-[30%]">
              <UsersRound className="h-6 w-6 text-brand-cyan" />
            </FloatBadge>
            <FloatBadge className="left-4 bottom-[30%]">
              <GraduationCap className="h-6 w-6 text-primary" />
            </FloatBadge>
            <FloatBadge className="right-4 bottom-[18%]">
              <FileBadge className="h-6 w-6 text-brand-cyan" />
            </FloatBadge>
            <img src={heroImage} alt="" loading="lazy" className="relative z-10 w-[82%] object-contain" />
          </div>
        </div>

        <div className="mt-12 flex items-center gap-4 rounded-2xl border border-[oklch(0.9_0.03_260)] bg-[oklch(0.96_0.025_260)] px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Your future, our priority.</h3>
            <p className="text-xs text-muted-foreground">
              Your data is secure with us. We use advanced security to protect your information.
            </p>
          </div>
          <div className="ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-white">
            <Lock className="h-5 w-5 text-primary" />
          </div>
        </div>
      </main>
      <MinimalFooter />
    </div>
  );
}

function FloatBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`absolute z-20 flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-(--shadow-card) ring-1 ring-border ${className}`}
    >
      {children}
    </div>
  );
}

function MinimalFooter() {
  return (
    <footer className="mt-10 border-t border-border/40 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
        <span>© {new Date().getFullYear()} Varsity Hub. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-foreground">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-foreground">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
