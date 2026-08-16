import type { Metadata } from "next";
import { ProcessDeck } from "@/components/process/ProcessDeck";

export const metadata: Metadata = {
  title: "Process — Wedding OS",
  description: "From ideation to a live coordination hub.",
};

export default function ProcessPage() {
  return <ProcessDeck />;
}
