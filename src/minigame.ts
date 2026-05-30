import { playMinigameStart, playMinigameCatch } from './sound';
import type { GameState } from './game';
import { calcZzzPerSec, BALANCE } from './game';
import { formatZzz } from './ui';

const COOLDOWN_MS = BALANCE.minigameCooldownMins * 60 * 1000;
let cooldownEnd = 0;
let active = false;

export function isMinigameAvailable(): boolean {
  return !active && Date.now() >= cooldownEnd;
}

export function getMinigameCooldownSec(): number {
  return Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
}

export function startMinigame(state: GameState, onEarn: (zzz: number) => void, onPlayedFirst: () => void): void {
  if (!isMinigameAvailable()) return;
  active = true;
  cooldownEnd = Date.now() + COOLDOWN_MS;
  onPlayedFirst();
  playMinigameStart();

  // Base reward: 20 seconds of current production
  const baseReward = Math.max(50, calcZzzPerSec(state) * 20);
  const duration = 15_000;
  let caught = 0;
  let earned = 0;
  const rewardPerCatch = baseReward / 20; // 20 catches to claim the full base reward

  // Build modal
  const overlay = document.createElement('div');
  overlay.id = 'minigame-overlay';

  const box = document.createElement('div');
  box.id = 'minigame-box';

  const header = document.createElement('div');
  header.id = 'minigame-header';

  const title = document.createElement('div');
  title.id = 'minigame-title';
  title.textContent = '🚨 RESCUE RUSH! 🚨';

  const timerEl = document.createElement('div');
  timerEl.id = 'minigame-timer';

  const scoreEl = document.createElement('div');
  scoreEl.id = 'minigame-score';
  scoreEl.textContent = `Rescued: 0   |   Bonus: 0 Zzz`;

  header.appendChild(title);
  header.appendChild(timerEl);

  const arena = document.createElement('div');
  arena.id = 'minigame-arena';

  box.appendChild(header);
  box.appendChild(arena);
  box.appendChild(scoreEl);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // Spawn sloths
  const SLOTH_EMOJIS = ['🦥', '🕺', '🌈', '🧙', '🚀', '🍕', '🦄', '👻', '🤖'];
  const activeSlots = new Set<HTMLElement>();

  function spawnSloth(): void {
    if (!active) return;
    const el = document.createElement('div');
    el.className = 'mg-sloth';
    const s = SLOTH_EMOJIS[Math.floor(Math.random() * SLOTH_EMOJIS.length)];
    el.textContent = s;
    const x = 5 + Math.random() * 82;
    const y = 5 + Math.random() * 75;
    el.style.left = x + '%';
    el.style.top = y + '%';
    el.style.animationDelay = (Math.random() * 1).toFixed(2) + 's';
    el.addEventListener('click', () => {
      if (!el.parentNode) return;
      caught++;
      earned += rewardPerCatch;
      playMinigameCatch();

      // Burst effect
      el.classList.add('mg-caught');
      const burst = document.createElement('div');
      burst.className = 'mg-burst';
      burst.textContent = `+${formatZzz(rewardPerCatch)} 💤`;
      burst.style.left = el.style.left;
      burst.style.top = el.style.top;
      arena.appendChild(burst);
      setTimeout(() => burst.remove(), 700);

      el.remove();
      activeSlots.delete(el);
      scoreEl.textContent = `Rescued: ${caught}   |   Bonus: ${formatZzz(earned)} Zzz`;
      setTimeout(spawnSloth, 300);
    });
    arena.appendChild(el);
    activeSlots.add(el);
  }

  // Start with 6 sloths
  for (let i = 0; i < 6; i++) setTimeout(spawnSloth, i * 200);

  // Timer countdown
  const startTime = Date.now();
  const timerInterval = setInterval(() => {
    const remaining = Math.max(0, Math.ceil((duration - (Date.now() - startTime)) / 1000));
    timerEl.textContent = `⏱ ${remaining}s`;
    if (remaining === 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 100);

  function endGame(): void {
    active = false;
    activeSlots.forEach(el => el.remove());
    activeSlots.clear();

    // Result screen
    arena.innerHTML = '';
    const result = document.createElement('div');
    result.id = 'minigame-result';
    result.innerHTML = `
      <div class="mg-result-emoji">🦥</div>
      <div class="mg-result-title">Time's up!</div>
      <div class="mg-result-stats">
        Sloths rescued: <strong>${caught}</strong><br>
        Zzz earned: <strong>${formatZzz(earned)}</strong>
      </div>
      <button id="mg-close-btn">Collect &amp; Close!</button>
    `;
    arena.appendChild(result);
    scoreEl.style.display = 'none';
    timerEl.textContent = '✅ Done!';

    document.getElementById('mg-close-btn')!.addEventListener('click', () => {
      onEarn(earned);
      overlay.remove();
    });
  }
}
