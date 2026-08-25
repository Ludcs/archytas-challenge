"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  getPriceSyncStatus,
  simulatePriceSync,
  type PriceSyncActionResult,
  type PriceSyncPollRequest,
  type PriceSyncStatus,
} from "@/app/prices/actions";

const POLL_INTERVAL_MS = 3_000;
const POLL_LIMIT_MS = 10 * 60 * 1000;

type Feedback = {
  message: string;
  tone: "neutral" | "success" | "warning" | "error";
};

export function PriceSyncButton() {
  const router = useRouter();
  const [isStarting, startTransition] = useTransition();
  const [activePoll, setActivePoll] = useState<PriceSyncPollRequest | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const pollStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activePoll) {
      return;
    }

    let pollRequest = activePoll;
    let cancelled = false;
    let timeoutId: number | undefined;

    function finishPolling(feedback: Feedback) {
      pollStartedAtRef.current = null;
      setActivePoll(null);
      setFeedback(feedback);
    }

    async function poll(): Promise<void> {
      const pollStartedAt = pollStartedAtRef.current;
      if (pollStartedAt === null || performance.now() - pollStartedAt >= POLL_LIMIT_MS) {
        if (!cancelled) {
          finishPolling({
            message:
              "La sincronización continúa en segundo plano. Actualizá la página más tarde para ver el resultado.",
            tone: "warning",
          });
        }
        return;
      }

      const status = await getPriceSyncStatus(pollRequest);

      if (cancelled) {
        return;
      }

      if (continuePolling(status)) {
        timeoutId = window.setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    function continuePolling(status: PriceSyncStatus): boolean {
      switch (status.state) {
        case "waiting":
          setFeedback({ message: "Sincronización en curso…", tone: "neutral" });
          return true;
        case "running":
          if (!pollRequest.syncRunId) {
            pollRequest = { ...pollRequest, syncRunId: status.syncRunId };
          }
          setFeedback({ message: "Sincronización en curso…", tone: "neutral" });
          return true;
        case "success":
          finishPolling({
            message: "Sincronización completada correctamente.",
            tone: "success",
          });
          router.refresh();
          return false;
        case "failed":
          finishPolling({
            message: "No se pudo completar la sincronización.",
            tone: "error",
          });
          return false;
        case "partial":
          finishPolling({
            message:
              status.rowsRejected > 0
                ? `La sincronización finalizó con observaciones. ${status.rowsRejected} registros no pudieron procesarse.`
                : "La sincronización finalizó con observaciones.",
            tone: "warning",
          });
          return false;
        case "ambiguous":
          finishPolling({
            message:
              "No se pudo asociar la sincronización. Continúa en segundo plano; actualizá la página más tarde.",
            tone: "warning",
          });
          return false;
        case "unavailable":
          setFeedback({
            message: "No se pudo consultar el estado. Reintentando…",
            tone: "warning",
          });
          return true;
      }
    }

    timeoutId = window.setTimeout(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [activePoll, router]);

  function handleClick() {
    setFeedback(null);

    startTransition(async () => {
      const actionResult = await simulatePriceSync();
      applyStartResult(actionResult);
    });
  }

  function applyStartResult(actionResult: PriceSyncActionResult) {
    if (!actionResult.success) {
      setFeedback({ message: actionResult.message, tone: "error" });
      return;
    }

    pollStartedAtRef.current = performance.now();
    setActivePoll({
      requestedAt: actionResult.requestedAt,
      baselineSyncRunId: actionResult.baselineSyncRunId,
      baselineStartedAt: actionResult.baselineStartedAt,
    });
    setFeedback({ message: "Sincronización en curso…", tone: "neutral" });
  }

  const isActive = activePoll !== null;
  const buttonLabel = isStarting
    ? "Iniciando…"
    : isActive
      ? "Sincronizando…"
      : "Simular scheduled trigger 8 AM / 8 PM";

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleClick}
        disabled={isStarting || isActive}
        className="inline-flex min-h-10 items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {buttonLabel}
      </button>
      {feedback ? (
        <p
          className={`max-w-sm text-sm ${feedbackToneClassName(feedback.tone)}`}
          role="status"
          aria-live="polite"
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}

function feedbackToneClassName(tone: Feedback["tone"]): string {
  switch (tone) {
    case "success":
      return "text-emerald-700";
    case "warning":
      return "text-amber-700";
    case "error":
      return "text-red-700";
    case "neutral":
      return "text-slate-600";
  }
}
