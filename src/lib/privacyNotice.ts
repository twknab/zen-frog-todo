"use client";

import { usePersistentState } from "./storage";

/**
 * Bump this when the privacy / local-first notice copy or CTA should reappear
 * for users who already dismissed an earlier version (e.g. after a product update).
 */
export const PRIVACY_NOTICE_VERSION = 1;

export const PRIVACY_NOTICE_ACK_KEY = "frog-garden:privacy-notice-ack-v1";

/**
 * Returns whether the current notice version has been acknowledged, plus a
 * dismiss helper that persists the ack so the banner stays gone until the
 * version constant is bumped.
 */
export function usePrivacyNoticeAck() {
  const [ackedVersion, setAckedVersion] = usePersistentState<number>(
    PRIVACY_NOTICE_ACK_KEY,
    0,
  );

  return {
    acknowledged: ackedVersion >= PRIVACY_NOTICE_VERSION,
    dismiss: () => setAckedVersion(PRIVACY_NOTICE_VERSION),
  } as const;
}
