let ctx: AudioContext | null = null;
export let muted = false;

function ac(): AudioContext | null {
  if (muted) return null;
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch { return null; }
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, delay = 0): void {
  const c = ac();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.connect(g);
    g.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);
    g.gain.setValueAtTime(0, c.currentTime + delay);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + dur + 0.05);
    osc.onended = () => { osc.disconnect(); g.disconnect(); };
  } catch { /* ignore */ }
}

export function toggleMute(): boolean {
  muted = !muted;
  return muted;
}

// Boing! A short descending slide
export function playRescue(): void {
  const c = ac();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.connect(g);
    g.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, c.currentTime + 0.18);
    g.gain.setValueAtTime(0.22, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22);
    osc.start();
    osc.stop(c.currentTime + 0.25);
    osc.onended = () => { osc.disconnect(); g.disconnect(); };
  } catch { /* ignore */ }
}

// Happy ascending arpeggio
export function playBuySloth(): void {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.18, i * 0.08));
}

// Sparkle — rapid descending notes
export function playBuyUpgrade(): void {
  [1047, 880, 698, 587, 523, 659].forEach((f, i) => tone(f, 0.12, 'sine', 0.14, i * 0.055));
}

// Triumphant fanfare
export function playAchievement(): void {
  [523, 659, 784, 659, 1047, 1319].forEach((f, i) => tone(f, 0.32, 'square', 0.1, i * 0.1));
}

// Soft story chime
export function playStory(): void {
  [880, 1108, 1318, 1108].forEach((f, i) => tone(f, 0.4, 'sine', 0.12, i * 0.18));
}

// Minigame start — energetic blip
export function playMinigameStart(): void {
  [261, 329, 392, 523, 659, 784].forEach((f, i) => tone(f, 0.14, 'square', 0.09, i * 0.07));
}

// Minigame sloth caught — quick pop
export function playMinigameCatch(): void {
  const c = ac();
  if (!c) return;
  try {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.connect(g);
    g.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, c.currentTime + 0.08);
    g.gain.setValueAtTime(0.18, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
    osc.start();
    osc.stop(c.currentTime + 0.12);
    osc.onended = () => { osc.disconnect(); g.disconnect(); };
  } catch { /* ignore */ }
}

// Milestone reached — ascending power chord
export function playMilestone(): void {
  [261, 392, 523, 784, 1047].forEach((f, i) => tone(f, 0.4, 'triangle', 0.14, i * 0.07));
}
