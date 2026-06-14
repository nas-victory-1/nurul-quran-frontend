"use client";

import Link from "next/link";

import ContestControl from "@/features/contest-control";
import QuestionDisplay from "@/features/question-display";
import ContestComplete from "@/features/contest-complete";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks";

export default function ContestPage() {
  const { phase, contestantIds } = useAppSelector((state) => state.contest);

  // Guard: a contest must be hydrated (via the dashboard "Start" button) first.
  if (contestantIds.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          No contest loaded
        </h1>
        <p className="text-gray-600 max-w-md">
          Start a contest from the dashboard to load its contestants and
          questions before running the judge panel.
        </p>
        <Link href="/contests">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Go to Contests
          </Button>
        </Link>
      </div>
    );
  }

  switch (phase) {
    case "display":
      return <QuestionDisplay />;
    case "complete":
      return <ContestComplete />;
    case "control":
    default:
      return <ContestControl />;
  }
}
