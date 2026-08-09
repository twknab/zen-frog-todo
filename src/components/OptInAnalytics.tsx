"use client";

import Script from "next/script";
import { getPlausibleDomain, useTelemetryConsent } from "@/lib/telemetryConsent";

/**
 * Loads Plausible only when the user has opted in and a domain is configured.
 * No script ⇒ no network to analytics when consent is off (Principle III / 023).
 */
export default function OptInAnalytics() {
  const { consented } = useTelemetryConsent();
  const domain = getPlausibleDomain();

  if (!consented || !domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
