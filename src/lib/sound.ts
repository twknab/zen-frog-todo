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

type RibbitOpts = {
  /** Peak amplitude for the voiced croak (keep gentle). */
  peakGain?: number;
  /** Pitch at the start of the “ri-”. */
  startHz?: number;
  /** Peak pitch before the fall into “-bbit”. */
  peakHz?: number;
  /** Pitch at the end of the croak. */
  endHz?: number;
  /** Total ribbit length in seconds. */
  duration?: number;
};

/**
 * One froggy ribbit: two-syllable croak (ri / bbit), throaty formant,
 * vibrato buzz, and a whisper of noise — more amphibian than a plain beep.
 */
function scheduleRibbit(
  ctx: AudioContext,
  startAt: number,
  {
    peakGain = 0.16,
    startHz = 260,
    peakHz = 420,
    endHz = 110,
    duration = 0.22,
  }: RibbitOpts = {},
) {
  const safeStart = Math.max(startHz, 60);
  const safePeak = Math.max(peakHz, safeStart);
  const safeEnd = Math.max(endHz, 40);
  const stopAt = startAt + duration + 0.04;

  const master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);

  // Throaty formant — bandpass keeps it croaky, not whistle-y.
  const formant = ctx.createBiquadFilter();
  formant.type = "bandpass";
  formant.frequency.setValueAtTime(safePeak * 1.15, startAt);
  formant.frequency.exponentialRampToValueAtTime(
    Math.max(safeEnd * 2.2, 180),
    startAt + duration,
  );
  formant.Q.value = 3.2;

  // Voiced croak body (slightly buzzy saw → amphibian, not a clean triangle).
  const voice = ctx.createOscillator();
  voice.type = "sawtooth";
  voice.frequency.setValueAtTime(safeStart, startAt);
  // “ri-” rise…
  voice.frequency.linearRampToValueAtTime(safePeak, startAt + duration * 0.28);
  // …then the classic fall into “-bbit”.
  voice.frequency.exponentialRampToValueAtTime(safeEnd, startAt + duration);

  // Fast vibrato = croak buzz / rattle in the throat.
  const vibrato = ctx.createOscillator();
  vibrato.type = "sine";
  vibrato.frequency.value = 28;
  const vibratoDepth = ctx.createGain();
  vibratoDepth.gain.value = safePeak * 0.045;
  vibrato.connect(vibratoDepth);
  vibratoDepth.connect(voice.frequency);

  const voiceGain = ctx.createGain();
  // Two amplitude humps → audible “ri-bbit” syllables.
  const dip = startAt + duration * 0.38;
  voiceGain.gain.setValueAtTime(0, startAt);
  voiceGain.gain.linearRampToValueAtTime(peakGain, startAt + 0.012);
  voiceGain.gain.linearRampToValueAtTime(peakGain * 0.35, dip);
  voiceGain.gain.linearRampToValueAtTime(peakGain * 0.95, dip + 0.02);
  voiceGain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  const voiceTone = ctx.createBiquadFilter();
  voiceTone.type = "lowpass";
  voiceTone.frequency.setValueAtTime(1400, startAt);
  voiceTone.frequency.exponentialRampToValueAtTime(480, startAt + duration);
  voiceTone.Q.value = 0.8;

  voice.connect(voiceTone);
  voiceTone.connect(formant);
  formant.connect(voiceGain);
  voiceGain.connect(master);

  // Soft noise tick for the croak’s attack / wet mouth texture.
  const noiseDur = Math.min(0.07, duration * 0.35);
  const noiseBuf = ctx.createBuffer(
    1,
    Math.max(1, Math.floor(ctx.sampleRate * noiseDur)),
    ctx.sampleRate,
  );
  const noiseData = noiseBuf.getChannelData(0);
  for (let i = 0; i < noiseData.length; i += 1) {
    noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseData.length);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 700;
  noiseFilter.Q.value = 1.4;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, startAt);
  noiseGain.gain.linearRampToValueAtTime(peakGain * 0.22, startAt + 0.008);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, startAt + noiseDur);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(master);

  voice.start(startAt);
  vibrato.start(startAt);
  noise.start(startAt);
  voice.stop(stopAt);
  vibrato.stop(stopAt);
  noise.stop(startAt + noiseDur + 0.02);
}

/** Single joyful frog ribbit — non-frog task completed. */
export function playRibbit() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    scheduleRibbit(ctx, ctx.currentTime, {
      peakGain: 0.15,
      startHz: 240,
      peakHz: 400,
      endHz: 105,
      duration: 0.2,
    });
  } catch {
    // silent
  }
}

/**
 * Cheerful ribbit chorus for completing today’s frog — a little pond of
 * overlapping croaks, brief and delightful (not a long spam cascade).
 */
export function playFrogChorus() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const croaks: Array<RibbitOpts & { at: number }> = [
      { at: 0, startHz: 230, peakHz: 380, endHz: 100, peakGain: 0.14, duration: 0.2 },
      { at: 0.1, startHz: 280, peakHz: 460, endHz: 120, peakGain: 0.16, duration: 0.22 },
      { at: 0.2, startHz: 210, peakHz: 350, endHz: 95, peakGain: 0.13, duration: 0.19 },
      { at: 0.32, startHz: 300, peakHz: 500, endHz: 130, peakGain: 0.15, duration: 0.23 },
      { at: 0.44, startHz: 250, peakHz: 410, endHz: 108, peakGain: 0.12, duration: 0.2 },
      { at: 0.56, startHz: 270, peakHz: 440, endHz: 115, peakGain: 0.11, duration: 0.18 },
    ];
    for (const croak of croaks) {
      const { at, ...opts } = croak;
      scheduleRibbit(ctx, now + at, opts);
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
