import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

const NAV = [
  { href: "/dashboard", label: "Home" },
  { href: "/tasks", label: "Tasks" },
  { href: "/workload", label: "Workload" },
  { href: "/timeline", label: "Timeline" },
  { href: "/events", label: "Events" },
  { href: "/guests", label: "Guests" },
  { href: "/seating", label: "Seating" },
  { href: "/vendors", label: "Vendors" },
  { href: "/payments", label: "Payments" },
  { href: "/handoffs", label: "Handoffs" },
  { href: "/decisions", label: "Decisions" },
  { href: "/polls", label: "Polls" },
  { href: "/traditions", label: "Traditions" },
  { href: "/people", label: "People" },
  { href: "/attire", label: "Attire" },
  { href: "/day-of", label: "Day-of" },
  { href: "/legal", label: "Legal" },
  { href: "/budget", label: "Budget" },
  { href: "/music", label: "Music" },
  { href: "/moodboard", label: "Moodboard" },
  { href: "/notes", label: "Notes" },
  { href: "/party", label: "Party view" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <p className="text-sm font-semibold tracking-tight">Wedding OS</p>
          <nav className="flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-600">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-slate-900">
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-slate-500">{session.name}</p>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
