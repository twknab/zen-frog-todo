/**
 * Routes work credit to Day Garden or Night Camp by effective realm (017).
 */

"use client";

import { useCallback } from "react";
import { useBonsai } from "./bonsai";
import {
  DEV_MODE_KEY,
  REALM_OVERRIDE_KEY,
  normalizeRealmOverride,
  resolveRealm,
  useWorkWindow,
  type RealmOverride,
} from "./gardenRealm";
import { useNightCamp } from "./nightCamp";
import { usePersistentState } from "./storage";

/**
 * Credit leaves/frogs to the correct ledger for the current effective realm.
 *
 * At night, any credit-worthy completion (task, focus session, frog task) that
 * passes a leaf weight advances the Night Camp ledger — not frog-only events.
 * Night uses leaf-magnitude as weight (mirrors day task/session/frog weights);
 * day frogs are not minted after hours (bonsai sleeps).
 */
export function useCreditWork() {
  const { workWindow } = useWorkWindow();
  const [devMode] = usePersistentState(DEV_MODE_KEY, false);
  const [realmOverride] = usePersistentState<RealmOverride>(REALM_OVERRIDE_KEY, null);
  const { recordGrowth } = useBonsai();
  const { recordNightGrowth } = useNightCamp();

  return useCallback(
    (leaves: number, frogs: number) => {
      const realm = resolveRealm({
        now: new Date(),
        window: workWindow,
        override: normalizeRealmOverride(realmOverride),
        devToolsEnabled: devMode,
      });
      if (realm === "night") {
        // Task / session / frog completions all route here via leaf weight.
        recordNightGrowth(Math.max(0, leaves));
        return;
      }
      recordGrowth(leaves, frogs);
    },
    [workWindow, realmOverride, devMode, recordGrowth, recordNightGrowth],
  );
}
