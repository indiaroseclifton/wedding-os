"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { openControl } from "@/components/v2/ControlDrawer";

export default function ControlPage() {
  const router = useRouter();
  useEffect(() => {
    openControl();
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.replace("/dashboard");
  }, [router]);
  return null;
}
