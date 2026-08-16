import { Suspense } from "react";
import { emailLoginEnabled } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-muted">
          Loading…
        </div>
      }
    >
      <LoginForm emailReady={emailLoginEnabled()} />
    </Suspense>
  );
}
