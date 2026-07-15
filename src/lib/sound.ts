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
}

/**
 * A short, filtered noise burst — a soft "shh" for dragging a rake through
 * sand. Synthesized (not sampled) for the same offline/no-asset reasons as
 * playChime.
 */
export function playRake() {
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
