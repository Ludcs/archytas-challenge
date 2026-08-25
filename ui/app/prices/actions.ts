"use server";

import {
  getEligiblePriceSyncRuns,
  getLatestPriceSync,
  getPriceSyncRunById,
} from "@/lib/prices/queries";
import type { SyncRun } from "@/lib/prices/types";
import { getPriceSyncWebhookUrl } from "@/lib/env";

const REQUEST_TIMEOUT_MS = 10_000;
const CLOCK_TOLERANCE_MS = 10_000;

export type PriceSyncActionResult =
  | {
      success: true;
      message: "Sincronización iniciada.";
      requestedAt: string;
      baselineSyncRunId: string | null;
      baselineStartedAt: string | null;
    }
  | {
      success: false;
      message: "No se pudo iniciar la sincronización. Verificá que n8n esté disponible.";
    };

export type PriceSyncPollRequest = {
  requestedAt: string;
  baselineSyncRunId: string | null;
  baselineStartedAt: string | null;
  syncRunId?: string;
};

export type PriceSyncStatus =
  | { state: "waiting" }
  | { state: "running"; syncRunId: string }
  | { state: "success"; syncRunId: string; rowsReceived: number }
  | { state: "failed"; syncRunId: string }
  | { state: "partial"; syncRunId: string; rowsRejected: number }
  | { state: "ambiguous" }
  | { state: "unavailable" };

export async function simulatePriceSync(): Promise<PriceSyncActionResult> {
  try {
    const baselineSync = await getLatestPriceSync();
    const requestedAt = new Date().toISOString();
    const response = await fetch(getPriceSyncWebhookUrl(), {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      return startFailure();
    }

    return {
      success: true,
      message: "Sincronización iniciada.",
      requestedAt,
      baselineSyncRunId: baselineSync?.id ?? null,
      baselineStartedAt: baselineSync?.started_at ?? null,
    };
  } catch {
    return startFailure();
  }
}

export async function getPriceSyncStatus(
  request: PriceSyncPollRequest,
): Promise<PriceSyncStatus> {
  const requestedAt = parseTimestamp(request.requestedAt);

  if (!requestedAt || !isValidPollRequest(request)) {
    return { state: "unavailable" };
  }

  try {
    if (request.syncRunId) {
      return toPriceSyncStatus(await getPriceSyncRunById(request.syncRunId));
    }

    const candidates = await getEligiblePriceSyncRuns(
      getAssociationLowerBound(requestedAt, request.baselineStartedAt),
      request.baselineSyncRunId,
    );

    if (candidates.length === 0) {
      return { state: "waiting" };
    }

    if (candidates.length > 1) {
      return { state: "ambiguous" };
    }

    return toPriceSyncStatus(candidates[0]);
  } catch {
    return { state: "unavailable" };
  }
}

function startFailure(): PriceSyncActionResult {
  return {
    success: false,
    message: "No se pudo iniciar la sincronización. Verificá que n8n esté disponible.",
  };
}

function isValidPollRequest(request: PriceSyncPollRequest): boolean {
  const baselineIsValid =
    (request.baselineSyncRunId === null && request.baselineStartedAt === null) ||
    (request.baselineSyncRunId !== null &&
      request.baselineStartedAt !== null &&
      isUuid(request.baselineSyncRunId) &&
      parseTimestamp(request.baselineStartedAt) !== null);

  return baselineIsValid && (request.syncRunId === undefined || isUuid(request.syncRunId));
}

function parseTimestamp(value: string): Date | null {
  const timestamp = new Date(value);

  if (Number.isNaN(timestamp.getTime())) {
    return null;
  }

  return timestamp;
}

function getAssociationLowerBound(requestedAt: Date, baselineStartedAt: string | null): string {
  const requestToleranceLowerBound = requestedAt.getTime() - CLOCK_TOLERANCE_MS;
  const baselineTime = baselineStartedAt ? parseTimestamp(baselineStartedAt)?.getTime() : null;
  const lowerBound = Math.max(requestToleranceLowerBound, baselineTime ?? Number.NEGATIVE_INFINITY);

  return new Date(lowerBound).toISOString();
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function toPriceSyncStatus(syncRun: SyncRun | null): PriceSyncStatus {
  if (!syncRun) {
    return { state: "waiting" };
  }

  switch (syncRun.status) {
    case "running":
      return { state: "running", syncRunId: syncRun.id };
    case "success":
      return {
        state: "success",
        syncRunId: syncRun.id,
        rowsReceived: syncRun.rows_received,
      };
    case "failed":
      return { state: "failed", syncRunId: syncRun.id };
    case "partial":
      return {
        state: "partial",
        syncRunId: syncRun.id,
        rowsRejected: syncRun.rows_rejected,
      };
  }
}
