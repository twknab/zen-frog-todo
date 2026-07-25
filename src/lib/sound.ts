type ChimeVariant = "focus-complete" | "break-complete";

const CHIME_NOTES: Record<ChimeVariant, number[]> = {
  "focus-complete": [523.25, 659.25], // C5, E5 — settling, resolved
  "break-complete": [659.25, 783.99], // E5, G5 — a touch brighter
};

function getAudioContextClass(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  );
}

/**
 * A single shared AudioContext reused for every sound effect.
 *
 * Creating a fresh AudioContext per sound (as an earlier version did) is an
 * anti-pattern: each one spins up a real audio hardware thread, and browsers
 * cap the number of live contexts (~6 in Chrome). Rapid raking created one
 * context per click, which piled up past that cap and stalled the page. One
 * lazily-created, never-closed context avoids all of that — individual sounds
 * are just cheap, short-lived nodes created on it and garbage-collected when
 * they finish playing.
 */
let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) return null;
  if (!sharedContext) sharedContext = new AudioContextClass();
  // Browsers start the context suspended until a user gesture; resume on use.
  if (sharedContext.state === "suspended") void sharedContext.resume();
  return sharedContext;
}

/**
 * Synthesizes a soft two-note bell via the Web Audio API rather than
 * shipping an audio asset — keeps the app fully local/offline (constitution
 * Principle III) with no licensing concerns.
 */
export function playChime(variant: ChimeVariant = "focus-complete") {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    CHIME_NOTES[variant].forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + index * 0.22;

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.8);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + 1.9);
    });
  } catch {
    // Audio must never block or surface errors to the UI.
  }
}

/**
 * A short, filtered noise burst — a soft "shh" for dragging a rake through
 * sand. Synthesized (not sampled) for the same offline/no-asset reasons as
 * playChime.
 */
export function playRake() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const durationSeconds = 0.22;
    const bufferSize = Math.floor(ctx.sampleRate * durationSeconds);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1100 + Math.random() * 400;
    filter.Q.value = 0.6;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationSeconds);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + durationSeconds + 0.02);
  } catch {
    // Audio must never block or surface errors to the UI.
  }
}

/**
 * One soft frog "ribbit" — a gentle down-gliding tone with a touch of
 * texture. Used for regular (non-frog) task completion.
 */
function scheduleRibbit(
  ctx: AudioContext,
  startAt: number,
  {
    peakGain = 0.14,
    startHz = 420,
    endHz = 180,
    duration = 0.16,
  }: {
    peakGain?: number;
    startHz?: number;
    endHz?: number;
    duration?: number;
  } = {},
) {
  const osc = ctx.createOscillator();
  const body = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(startHz, startAt);
  osc.frequency.exponentialRampToValueAtTime(Math.max(endHz, 40), startAt + duration);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, startAt);
  filter.frequency.exponentialRampToValueAtTime(320, startAt + duration);
  filter.Q.value = 1.2;

  body.gain.setValueAtTime(0, startAt);
  body.gain.linearRampToValueAtTime(peakGain, startAt + 0.018);
  body.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(filter);
  filter.connect(body);
  body.connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

/** Single light ribbit — non-frog task completed. */
export function playRibbit() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    scheduleRibbit(ctx, ctx.currentTime, { peakGain: 0.12, startHz: 400, endHz: 170 });
  } catch {
    // silent
  }
}

/**
 * Short cheerful ribbit chorus for completing today's frog — a cascade of a
 * few soft ribbits, delightful and brief (not spammy).
 */
export function playFrogChorus() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [
      { at: 0, startHz: 380, endHz: 160, peakGain: 0.11 },
      { at: 0.11, startHz: 440, endHz: 190, peakGain: 0.13 },
      { at: 0.22, startHz: 360, endHz: 150, peakGain: 0.1 },
      { at: 0.34, startHz: 480, endHz: 200, peakGain: 0.12 },
      { at: 0.48, startHz: 400, endHz: 165, peakGain: 0.09 },
    ];
    for (const note of notes) {
      scheduleRibbit(ctx, now + note.at, {
        startHz: note.startHz,
        endHz: note.endHz,
        peakGain: note.peakGain,
        duration: 0.14,
      });
    }
  } catch {
    // silent
  }
}

/**
 * Soft squirrel-like chuckle — a few short, warm chirps. Played once when the
 * bonsai squirrel transitions from absent → present.
 */
export function playSquirrelChuckle() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const chirps = [
      { at: 0, hz: 620, dur: 0.05 },
      { at: 0.07, hz: 540, dur: 0.045 },
      { at: 0.13, hz: 680, dur: 0.055 },
      { at: 0.2, hz: 500, dur: 0.04 },
    ];
    for (const chirp of chirps) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const start = now + chirp.at;

      osc.type = "sine";
      osc.frequency.setValueAtTime(chirp.hz, start);
      osc.frequency.exponentialRampToValueAtTime(chirp.hz * 0.72, start + chirp.dur);

      filter.type = "bandpass";
      filter.frequency.value = chirp.hz;
      filter.Q.value = 2.5;

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.1, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + chirp.dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + chirp.dur + 0.02);
    }
  } catch {
    // silent
  }
}

/**
 * Short positive reward pluck when a task is added — distinct from ribbits
 * and from the focus-session chime (softer, quicker, different intervals).
 */
export function playTaskAdded() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Soft ascending fourth (G4 → C5), short plucks — not the chime's C5–E5 bell.
    const notes = [392.0, 523.25];
    notes.forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + index * 0.07;

      osc.type = "sine";
      osc.frequency.value = frequency;

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.12, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.32);
    });
  } catch {
    // silent
  }
}

export type AmbientLoop = {
  stop: () => void;
};

/**
 * A continuous, gently swelling filtered-noise loop — a stand-in for wind or
 * rain during a focus session. Shares the same AudioContext as the other
 * effects; stopping tears down only this loop's own nodes, never the context.
 */
export function startAmbientLoop(): AmbientLoop | null {
  const ctx = getAudioContext();
  if (!ctx) return null;

  const bufferSeconds = 4;
  const bufferSize = Math.floor(ctx.sampleRate * bufferSeconds);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  // Cutoff in the audible mid-band (not 500Hz) so there's energy small
  // laptop/desktop speakers can actually reproduce — a pure low rumble is
  // inaudible on speakers but fine on headphones (which reproduce lows).
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1400;

  const gain = ctx.createGain();
  gain.gain.value = 0;

  // A slow LFO on the gain gives the loop a natural "breathing" wind swell
  // rather than a flat, mechanical hiss.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.15;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.05;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 1.5);

  noise.start();
  lfo.start();

  const activeCtx = ctx;
  let stopped = false;
  function stop() {
    if (stopped) return;
    stopped = true;
    const releaseStart = activeCtx.currentTime;
    gain.gain.cancelScheduledValues(releaseStart);
    gain.gain.setValueAtTime(gain.gain.value, releaseStart);
    gain.gain.linearRampToValueAtTime(0, releaseStart + 0.6);
    // Stop only this loop's nodes; the shared context stays alive for reuse.
    setTimeout(() => {
      noise.stop();
      lfo.stop();
      noise.disconnect();
      lfo.disconnect();
      gain.disconnect();
      filter.disconnect();
      lfoGain.disconnect();
    }, 700);
  }

  return { stop };
}
