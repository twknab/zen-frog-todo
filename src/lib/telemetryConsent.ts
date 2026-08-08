"use client";

import { usePersistentState } from "./storage";

/** Local opt-in for anonymous visit metrics (Plausible). Default OFF. */
export const TELEMETRY_CONSENT_KEY = "frog-garden:telemetry-consent-v1";

export function useTelemetryConsent() {
  const [consented, setConsented] = usePersistentState<boolean>(
    TELEMETRY_CONSENT_KEY,
    false,
  );

  return {
    consented,
    setConsented,
  } as const;
}

/** Domain passed to Plausible when set (e.g. zenfrog.netlify.app). */
export function getPlausibleDomain(): string | null {
  const raw = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();
  return raw ? raw : null;
}
