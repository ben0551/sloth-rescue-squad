import './style.css';
import { loadGame, saveGame, tick, rescue, buySloth, buyUpgrade, earnZzz, rebirth, canRebirth, getStrainMultiplier, setDifficulty, getDifficulty } from './game';
import type { GameState, Difficulty } from './game';
import { updateStats, updateSanctuary, renderShop, spawnParticle, flashRescueBtn, setActiveTab, pickSituation, showAchievementToast, showStoryEvent, initBackground } from './ui';
import { checkAchievements, unlockAchievement, MINIGAME_ACHIEVEMENT_ID } from './achievements';
import { checkStory } from './story';
import { playRescue, playBuySloth, playBuyUpgrade, playAchievement, playStory, playMilestone, toggleMute } from './sound';
import { startMinigame } from './minigame';

// Apply difficulty before loadGame so offline production uses the right balance
setDifficulty((localStorage.getItem('sloth-difficulty') ?? 'normal') as Difficulty);

let state: GameState = loadGame();
let lastTimestamp = performance.now();
let shopDirty = true;
let lastMilestoneKey = '';
let shopPointerDown = false;

// Pause shop re-renders while the pointer is held inside the shop
// (prevents innerHTML replacement eating a click mid-press)
document.addEventListener('DOMContentLoaded', () => {
  const shopEl = document.getElementById('shop-content')!;
  shopEl.addEventListener('pointerdown', () => { shopPointerDown = true; });
  shopEl.addEventListener('pointerup',   () => { shopPointerDown = false; });
  shopEl.addEventListener('pointerleave',() => { shopPointerDown = false; });
});

// ---- Init ----
pickSituation();
initBackground();
updateSanctuary(state);
renderShop(state);
updateStats(state);

// ---- Post-action: check achievements + story ----
function postAction(): void {
  const { state: s1, newAchievements } = checkAchievements(state);
  const { state: s2, newEvent } = checkStory(s1);
  state = s2;

  for (const ach of newAchievements) {
    showAchievementToast(ach);
    playAchievement();
  }
  if (newEvent) {
    showStoryEvent(newEvent);
    playStory();
  }

  // Milestone sound: when any sloth type crosses a 25-multiple
  const milKey = Object.entries(state.slothCounts)
    .map(([id, c]) => `${id}:${Math.floor(c / 25)}`)
    .join(',');
  if (milKey !== lastMilestoneKey && lastMilestoneKey !== '') {
    playMilestone();
  }
  lastMilestoneKey = milKey;

  shopDirty = true;
}

// ---- Game loop — lean: only state update + sanctuary ----
function loop(now: number): void {
  const dt = Math.min((now - lastTimestamp) / 1000, 0.5);
  lastTimestamp = now;

  state = tick(state, dt);
  updateSanctuary(state);

  if (shopDirty && !shopPointerDown) {
    shopDirty = false;
    renderShop(state);
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Stats update at 10fps — no need to touch 7 DOM elements at 60fps
setInterval(() => { updateStats(state); }, 100);
// Shop affordability refresh
setInterval(() => { shopDirty = true; }, 800);
setInterval(() => { saveGame(state); }, 10_000);

// ---- Rescue button (click + hold) ----
let holdInterval: ReturnType<typeof setInterval> | null = null;
let lastPostAction = 0;

function doRescue(x: number, y: number, manual = false): void {
  const result = rescue(state);
  state = result.state;
  spawnParticle(x, y, result.earned);
  flashRescueBtn();
  pickSituation();
  playRescue();
  // Manual clicks always run postAction immediately.
  // Auto-rescues throttle to once/sec — avoids re-rendering the shop 5×/sec.
  const now = Date.now();
  if (manual || now - lastPostAction >= 1000) {
    lastPostAction = now;
    postAction();
  }
}

function getAutoClickInterval(): number | null {
  if (!state.upgrades['auto_hands']) return null;
  if (state.upgrades['auto_hands_5']) return 200;  // 5/sec
  if (state.upgrades['auto_hands_4']) return 250;  // 4/sec
  if (state.upgrades['auto_hands_3']) return 333;  // 3/sec
  if (state.upgrades['auto_hands_2']) return 500;  // 2/sec
  return 1000;                                      // 1/sec
}

const rescueBtn = document.getElementById('rescue-btn')!;
const rescueZone = document.getElementById('rescue-zone')!;

rescueBtn.addEventListener('click', (e: MouseEvent) => {
  const rect = rescueZone.getBoundingClientRect();
  doRescue(e.clientX - rect.left, e.clientY - rect.top, true);
});

rescueBtn.addEventListener('pointerdown', (e: PointerEvent) => {
  const interval = getAutoClickInterval();
  if (interval === null) return;
  rescueBtn.setPointerCapture(e.pointerId);
  holdInterval = setInterval(() => {
    const rect = rescueZone.getBoundingClientRect();
    doRescue(rect.width / 2, rect.height / 2);
  }, interval);
});

rescueBtn.addEventListener('pointerup',    () => { if (holdInterval) { clearInterval(holdInterval); holdInterval = null; } });
rescueBtn.addEventListener('pointerleave', () => { if (holdInterval) { clearInterval(holdInterval); holdInterval = null; } });

// ---- Passive auto-rescue (Rescue-O-Matic) ----
// Fires at the same speed as the hold tier, but only while tab is focused and not already holding
let lastAutoFire = 0;
setInterval(() => {
  if (!state.upgrades['auto_passive']) return;
  if (!document.hasFocus()) return;
  if (holdInterval) return; // hold takes priority, don't double-fire
  const interval = getAutoClickInterval() ?? 1000;
  const now = Date.now();
  if (now - lastAutoFire >= interval) {
    lastAutoFire = now;
    const rect = rescueZone.getBoundingClientRect();
    doRescue(rect.width / 2, rect.height / 2);
  }
}, 100);

// ---- Shop tabs ----
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    setActiveTab((btn as HTMLElement).dataset.tab as 'sloths' | 'upgrades');
    renderShop(state);
  });
});

// ---- Shop buy (event delegation) ----
document.getElementById('shop-content')!.addEventListener('click', (e: Event) => {
  const btn = (e.target as HTMLElement).closest('[data-id]') as HTMLElement | null;
  if (!btn) return;
  const { id, type } = btn.dataset;
  if (!id || !type) return;
  const prev = state;
  if (type === 'sloth') {
    state = buySloth(state, id);
    if (state !== prev) playBuySloth();
  } else {
    state = buyUpgrade(state, id);
    if (state !== prev) playBuyUpgrade();
  }
  postAction();
  updateSanctuary(state);
});

// ---- Rebirth button ----
document.getElementById('rebirth-btn')?.addEventListener('click', () => {
  if (!canRebirth(state)) return;
  const strainMult = getStrainMultiplier(state);
  const strainMsg = strainMult >= 2
    ? `\n\n⚠️ World Strain is at ×${strainMult.toFixed(1)} — all costs are ${strainMult.toFixed(1)}× more expensive. Rebirthing resets this!`
    : '';
  if (!confirm(`🔄 REBIRTH!\n\nYour sloths and upgrades will reset, but you keep your achievements and earn a permanent +50% production bonus.${strainMsg}\n\nReady to start again?`)) return;
  state = rebirth(state);
  shopDirty = true;
  renderShop(state);
  updateSanctuary(state);
  updateStats(state);
  postAction();
});

// ---- Minigame button ----
document.getElementById('minigame-btn')?.addEventListener('click', () => {
  startMinigame(
    state,
    (amount: number) => {
      state = earnZzz(state, amount);
      shopDirty = true;
      updateStats(state);
    },
    () => {
      const { state: s, achievement } = unlockAchievement(state, MINIGAME_ACHIEVEMENT_ID);
      state = s;
      if (achievement) {
        showAchievementToast(achievement);
        playAchievement();
      }
    },
  );
});

// ---- Mute button ----
document.getElementById('mute-btn')?.addEventListener('click', () => {
  const nowMuted = toggleMute();
  const btn = document.getElementById('mute-btn')!;
  btn.textContent = nowMuted ? '🔇' : '🔊';
  btn.title = nowMuted ? 'Unmute' : 'Mute';
});

// ---- Reset save button ----
document.getElementById('reset-btn')?.addEventListener('click', () => {
  if (!confirm('🗑️ Wipe save and start fresh?\n\nAll progress will be lost!')) return;
  localStorage.removeItem('sloth-rescue-save');
  location.reload();
});

// ---- Hidden difficulty menu (click the first 🦥 in the title) ----
const diffModal = document.getElementById('difficulty-modal')!;

document.getElementById('secret-sloth')?.addEventListener('click', () => {
  document.querySelectorAll('.diff-btn').forEach(btn => {
    (btn as HTMLElement).classList.toggle('diff-active', (btn as HTMLElement).dataset.diff === getDifficulty());
  });
  diffModal.style.display = 'flex';
});

document.getElementById('difficulty-close')?.addEventListener('click', () => {
  diffModal.style.display = 'none';
});

diffModal.addEventListener('click', (e) => {
  if (e.target === diffModal) diffModal.style.display = 'none';
});

document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const diff = (btn as HTMLElement).dataset.diff as Difficulty;
    if (diff === getDifficulty()) { diffModal.style.display = 'none'; return; }

    const label = diff.charAt(0).toUpperCase() + diff.slice(1);
    const neverSet = localStorage.getItem('sloth-difficulty') === null;

    if (neverSet) {
      // First-ever change: keep the existing save, just reload with new difficulty
      localStorage.setItem('sloth-difficulty', diff);
      location.reload();
    } else {
      if (!confirm(`Switch to ${label} mode?\n\nYour current save will be reset.`)) return;
      localStorage.setItem('sloth-difficulty', diff);
      localStorage.removeItem('sloth-rescue-save');
      location.reload();
    }
  });
});
