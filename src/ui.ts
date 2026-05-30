import type { GameState } from './game';
import type { Achievement } from './achievements';
import type { StoryEvent } from './story';
import {
  SLOTH_TYPES, UPGRADES, calcZzzPerSec, getClickValue,
  getSlothCost, RESCUE_SITUATIONS, getNextPrestigeUpgrade,
  getMilestoneMult, getNextMilestoneMult, getNextMilestone, canRebirth, getRebirthMultiplier,
  getLateTierStrain, getStrainMultiplier,
} from './game';
import { isMinigameAvailable, getMinigameCooldownSec } from './minigame';

export function formatZzz(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '∞';
  if (n < 1)        return n.toFixed(2);
  if (n < 1_000)    return Math.floor(n).toLocaleString();
  if (n < 1e6)      return (n / 1e3).toFixed(1) + 'K';
  if (n < 1e9)      return (n / 1e6).toFixed(1) + 'M';
  if (n < 1e12)     return (n / 1e9).toFixed(1) + 'B';
  if (n < 1e15)     return (n / 1e12).toFixed(1) + 'T';
  if (n < 1e18)     return (n / 1e15).toFixed(1) + 'Qa';
  if (n < 1e21)     return (n / 1e18).toFixed(1) + 'Qi';
  if (n < 1e24)     return (n / 1e21).toFixed(1) + 'Sx';
  if (n < 1e27)     return (n / 1e24).toFixed(1) + 'Sp';
  return n.toExponential(2);
}

let currentSituation = RESCUE_SITUATIONS[0];
export function pickSituation(): void {
  currentSituation = RESCUE_SITUATIONS[Math.floor(Math.random() * RESCUE_SITUATIONS.length)];
}

// ---- Stats bar ----
export function updateStats(state: GameState): void {
  const zps = calcZzzPerSec(state);
  const clickVal = getClickValue(state);
  (document.getElementById('zzz-display')!).textContent = `💤 ${formatZzz(state.zzz)} Zzz's`;
  (document.getElementById('rate-display')!).textContent = `${formatZzz(zps)}/sec`;
  (document.getElementById('total-rescues')!).textContent = `🦥 ${state.totalRescues.toLocaleString()} rescued`;
  (document.getElementById('click-value')!).textContent = `+${formatZzz(clickVal)} per rescue`;
  (document.getElementById('situation-display')!).textContent = `🚨 Sloth spotted: ${currentSituation}!`;

  // Rebirth badge
  const rb = document.getElementById('rebirth-badge')!;
  if (state.rebirthCount > 0) {
    const mult = getRebirthMultiplier(state);
    rb.textContent = `⚗️ Rebirth ×${state.rebirthCount}  (+${((mult - 1) * 100).toFixed(0)}%)`;
    rb.style.display = 'inline-block';
  } else {
    rb.style.display = 'none';
  }

  // World Strain badge
  const strainBadge = document.getElementById('strain-badge')!;
  const strain = getLateTierStrain(state);
  if (strain > 0) {
    const mult = getStrainMultiplier(state);
    strainBadge.textContent = `🔥 Strain ×${mult >= 10 ? mult.toFixed(0) : mult.toFixed(1)} costs`;
    strainBadge.style.display = 'inline-block';
    strainBadge.classList.toggle('strain-critical', mult >= 5);
    strainBadge.title = `Dragon+ sloths are overloading the sanctuary! All costs ×${mult.toFixed(1)}. Rebirth resets strain!`;
  } else {
    strainBadge.style.display = 'none';
  }

  // Rebirth button
  const rebirthBtn = document.getElementById('rebirth-btn') as HTMLButtonElement;
  if (rebirthBtn) {
    const can = canRebirth(state);
    rebirthBtn.disabled = !can;
    rebirthBtn.classList.toggle('rebirth-ready', can);
    if (strain > 0) {
      const mult = getStrainMultiplier(state);
      rebirthBtn.title = `Rebirth resets World Strain (currently ×${mult.toFixed(1)} costs) + earns +50% permanent production!`;
    } else {
      rebirthBtn.title = 'Requires 1 Dragon Sloth + 1M Zzz earned';
    }
  }

  // Minigame button
  const mgBtn = document.getElementById('minigame-btn') as HTMLButtonElement;
  if (mgBtn) {
    const avail = isMinigameAvailable();
    mgBtn.disabled = !avail;
    if (avail) {
      mgBtn.textContent = '🎮 Rescue Rush!';
      mgBtn.classList.add('mg-ready');
    } else {
      const cd = getMinigameCooldownSec();
      mgBtn.textContent = cd > 0 ? `🎮 Ready in ${cd}s` : '🎮 Rescue Rush!';
      mgBtn.classList.remove('mg-ready');
    }
  }
}

// ---- Sanctuary ----
let lastSlothKey = '';
export function updateSanctuary(state: GameState): void {
  const key = JSON.stringify(state.slothCounts);
  if (key === lastSlothKey) return;
  lastSlothKey = key;

  const container = document.getElementById('sloth-display')!;
  const sloths: string[] = [];
  for (const s of SLOTH_TYPES) {
    const count = state.slothCounts[s.id] ?? 0;
    for (let i = 0; i < Math.min(count, 15); i++) sloths.push(s.emoji);
  }

  if (sloths.length === 0) {
    container.innerHTML = '<div class="empty-msg">Your sanctuary is empty...<br>Rescue some sloths! 🦥</div>';
    return;
  }

  container.innerHTML = sloths
    .map((e, i) => `<span class="sanctuary-sloth" style="animation-delay:${((i * 0.37) % 3).toFixed(2)}s;animation-duration:${(2.5 + (i % 4) * 0.4).toFixed(1)}s">${e}</span>`)
    .join('');
}

// ---- Shop ----
let activeTab: 'sloths' | 'upgrades' = 'sloths';
export function setActiveTab(tab: 'sloths' | 'upgrades'): void { activeTab = tab; }

export function renderShop(state: GameState): void {
  const content = document.getElementById('shop-content')!;

  if (activeTab === 'sloths') {
    content.innerHTML = SLOTH_TYPES.map(sloth => {
      const cost = getSlothCost(state, sloth.id);
      const count = state.slothCounts[sloth.id] ?? 0;
      const canAfford = state.zzz >= cost;
      const milMult = getMilestoneMult(count);
      const nextMil = getNextMilestone(count);
      const nextMilMult = getNextMilestoneMult(count);
      const toNext = nextMil - count;
      const milLabel = count === 0
        ? `🏅 Buy 25 → ×2! (then ×6 at 50)`
        : toNext > 0
          ? `🏅 ×${formatZzz(milMult)} now — ${toNext} more → ×${formatZzz(nextMilMult)}!`
          : `🏅 ×${formatZzz(milMult)} — next: ×${formatZzz(nextMilMult)} at ${nextMil}`;

      return `<div class="shop-card ${canAfford ? '' : 'cant-afford'}" style="--card-color:${sloth.color}">
        <div class="card-emoji">${sloth.emoji}</div>
        <div class="card-info">
          <div class="card-name">${sloth.name}</div>
          <div class="card-desc">${sloth.description}</div>
          <div class="card-zps">${formatZzz(sloth.baseZzzPerSec * milMult)} Zzz/sec each</div>
          <div class="card-milestone">${milLabel}</div>
        </div>
        <div class="card-right">
          <div class="card-count">×${count}</div>
          <button class="buy-btn" data-id="${sloth.id}" data-type="sloth" ${canAfford ? '' : 'disabled'} style="background:${sloth.color}">
            💤 ${formatZzz(cost)}
          </button>
        </div>
      </div>`;
    }).join('');

  } else {
    const available = UPGRADES.filter(u => state.totalZzzEarned >= u.unlockAt);
    const prestige = getNextPrestigeUpgrade(state);
    if (state.totalZzzEarned >= prestige.unlockAt) available.push(prestige);

    if (available.length === 0) {
      content.innerHTML = '<div class="empty-msg">Keep rescuing sloths to unlock upgrades! 🦥</div>';
      return;
    }

    content.innerHTML = available.map(upgrade => {
      const bought = !!state.upgrades[upgrade.id];
      const canAfford = state.zzz >= upgrade.cost;
      const isPrestige = upgrade.id.startsWith('prestige_');
      return `<div class="shop-card upgrade-card ${isPrestige ? 'prestige-card' : ''} ${bought ? 'bought' : canAfford ? '' : 'cant-afford'}">
        <div class="card-emoji">${upgrade.emoji}</div>
        <div class="card-info">
          <div class="card-name">${upgrade.name}</div>
          <div class="card-desc">${upgrade.description}</div>
          <div class="card-effect">${upgrade.effect}</div>
        </div>
        <div class="card-right">
          ${bought
            ? '<div class="bought-badge">✓ Owned</div>'
            : `<button class="buy-btn upgrade-btn" data-id="${upgrade.id}" data-type="upgrade" ${canAfford ? '' : 'disabled'}>
                💤 ${formatZzz(upgrade.cost)}
              </button>`}
        </div>
      </div>`;
    }).join('');
  }
}

// ---- Particles ----
export function spawnParticle(x: number, y: number, value: number): void {
  const container = document.getElementById('particles-container')!;
  const el = document.createElement('div');
  el.className = 'particle';
  el.textContent = `+${formatZzz(value)} 💤`;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.style.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

export function flashRescueBtn(): void {
  const btn = document.getElementById('rescue-btn')!;
  btn.classList.add('clicked');
  setTimeout(() => btn.classList.remove('clicked'), 120);
}

// ---- Achievement toasts ----
export function showAchievementToast(ach: Achievement): void {
  const container = document.getElementById('toast-container')!;
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="toast-emoji">${ach.emoji}</div>
    <div class="toast-body">
      <div class="toast-title">Achievement!</div>
      <div class="toast-name">${ach.name}</div>
      <div class="toast-desc">${ach.description}</div>
    </div>
  `;
  container.appendChild(toast);
  // Animate in
  requestAnimationFrame(() => toast.classList.add('toast-visible'));
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

// ---- Story bar ----
export function showStoryEvent(ev: StoryEvent): void {
  const bar = document.getElementById('story-bar')!;
  const ticker = document.getElementById('story-ticker')!;
  ticker.textContent = `${ev.emoji} ${ev.message}`;
  bar.classList.add('story-visible');
  bar.classList.remove('story-hidden');
}

// ---- Background floaties ----
const BG_EMOJIS = ['🍃', '🍃', '🍃', '💤', '💤', '🌿', '⭐', '🦥'];

export function initBackground(): void {
  const bg = document.getElementById('bg-layer')!;
  function spawn(): void {
    if (bg.children.length >= 10) return; // cap simultaneous floaties
    const el = document.createElement('div');
    el.className = 'bg-float';
    el.textContent = BG_EMOJIS[Math.floor(Math.random() * BG_EMOJIS.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.animationDuration = (14 + Math.random() * 14).toFixed(1) + 's';
    el.style.animationDelay = '0s';
    el.style.fontSize = (0.9 + Math.random() * 1.2).toFixed(1) + 'rem';
    el.style.opacity = (0.06 + Math.random() * 0.1).toFixed(2);
    bg.appendChild(el);
    setTimeout(() => el.remove(), 30_000);
  }
  // Smaller initial batch, staggered
  for (let i = 0; i < 6; i++) setTimeout(spawn, i * 600);
  // Slower spawn rate
  setInterval(spawn, 3_000);
}
