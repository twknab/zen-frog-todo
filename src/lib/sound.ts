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
 * Synthesizes a soft two-note bell via the Web Audio API rather than
 * shipping an audio asset — keeps the app fully local/offline (constitution
 * Principle III) with no licensing concerns.
 */
export function playChime(variant: ChimeVariant = "focus-complete") {
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
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

  setTimeout(() => ctx.close(), 2200);
}

/**
 * A short, filtered noise burst — a soft "shh" for dragging a rake through
 * sand. Synthesized (not sampled) for the same offline/no-asset reasons as
 * playChime.
 */
export function playRake() {
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) return;

  const ctx = new AudioContextClass();
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

  setTimeout(() => ctx.close(), 500);
}

export type AmbientLoop = {
  stop: () => void;
};

/**
 * A continuous, gently swelling filtered-noise loop — a stand-in for wind or
 * rain during a focus session. Synthesized rather than sampled, same
 * offline/no-licensing reasoning as playChime/playRake.
 */
export function startAmbientLoop(): AmbientLoop | null {
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) return null;

  const ctx = new AudioContextClass();
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

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 500;

  const gain = ctx.createGain();
  gain.gain.value = 0;

  // A slow LFO on the gain gives the loop a natural "breathing" wind swell
  // rather than a flat, mechanical hiss.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.15;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.02;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.06, now + 1.5);

  noise.start();
  lfo.start();

  let stopped = false;
  function stop() {
    if (stopped) return;
    stopped = true;
    const releaseStart = ctx.currentTime;
    gain.gain.cancelScheduledValues(releaseStart);
    gain.gain.setValueAtTime(gain.gain.value, releaseStart);
    gain.gain.linearRampToValueAtTime(0, releaseStart + 0.6);
    setTimeout(() => {
      noise.stop();
      lfo.stop();
      ctx.close();
    }, 700);
  }

  return { stop };
}
