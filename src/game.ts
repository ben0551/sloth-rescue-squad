// ============================================================
//  DIFFICULTY
// ============================================================
export type Difficulty = 'easy' | 'normal' | 'hard';
let currentDifficulty: Difficulty = 'normal';

// Easy mode uses these base costs instead of the Normal ones.
// Designed for younger players — ~6× cheaper per tier, gentler ramp.
const EASY_BASE_COSTS: Record<string, number> = {
  basic:   30,
  disco:   200,
  rainbow: 1_200,
  wizard:  7_000,
  space:   40_000,
  pizza:   200_000,
  dino:    1_200_000,
  unicorn: 8_000_000,
  dragon:  50_000_000,
  ghost:   300_000_000,
  robot:   1_800_000_000,
  ninja:   10_800_000_000,
  alien:   65_000_000_000,
  vampire: 390_000_000_000,
  cowboy:  2_300_000_000_000,
  cosmic:  14_000_000_000_000,
};

export function setDifficulty(d: Difficulty): void {
  currentDifficulty = d;
  if (d === 'easy') {
    BALANCE.productionScale  = 1;
    BALANCE.costScale        = 1;
    BALANCE.clickScale       = 3;    // clicks worth 3× more
    BALANCE.strainExponent   = 0.03; // gentle strain
  } else if (d === 'normal') {
    BALANCE.productionScale  = 1;
    BALANCE.costScale        = 1;
    BALANCE.clickScale       = 1;
    BALANCE.strainExponent   = 0.08;
  } else {
    BALANCE.productionScale  = 0.8;  // slower earning
    BALANCE.costScale        = 2;    // double all costs
    BALANCE.clickScale       = 0.7;
    BALANCE.strainExponent   = 0.12; // heavier strain
  }
}

export function getDifficulty(): Difficulty { return currentDifficulty; }

// ============================================================
//  BALANCE CONFIG — tweak these to adjust difficulty/speed
// ============================================================
export const BALANCE = {
  /** Multiply all sloth Zzz/sec by this.  2 = twice as fast,  0.5 = half speed. */
  productionScale: 1,
  /** Multiply all sloth purchase costs by this.  0.5 = half price,  2 = double price. */
  costScale: 1,
  /** Multiply click (rescue button) value by this. */
  clickScale: 1,
  /** Every N sloths of the same type adds one more ×bonus (milestone).  Default 25. */
  milestoneEvery: 25,
  /** Offline production cap in seconds.  Default 3600 (1 hour). */
  offlineCapSecs: 3600,
  /** Rescue Rush minigame cooldown in minutes. */
  minigameCooldownMins: 15,
  /** Each Dragon-tier+ sloth owned raises ALL costs by this fraction (e.g. 0.08 = +8%).
   *  Compounds: 10 dragons = ×2.16 costs, 25 = ×6.8, 50 = ×47, 100 = ×2200.
   *  Resets to 0 on rebirth — the main reason to rebirth. */
  strainExponent: 0.08,
};
// ============================================================

export interface SlothType {
  id: string;
  name: string;
  emoji: string;
  baseCost: number;
  baseZzzPerSec: number;
  costScale: number; // cost multiplier per purchase — higher tiers scale harder
  color: string;
  description: string;
}

export interface Upgrade {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  effect: string;
  multiplier: number;
  clickMultiplier?: number;
  unlockAt: number;
}

export interface GameState {
  zzz: number;
  totalZzzEarned: number;
  totalRescues: number;
  totalClickCount: number;
  slothCounts: Record<string, number>;
  upgrades: Record<string, boolean>;
  achievements: Record<string, boolean>;
  storyIndex: number;
  rebirthCount: number;
  rebirthSouls: number;   // persistent across rebirths
  lastSave: number;
}

export const SLOTH_TYPES: SlothType[] = [
  { id: 'basic',   name: 'Basic Sloth',   emoji: '🦥', baseCost: 30,                  baseZzzPerSec: 0.1,         costScale: 1.12, color: '#8BC34A', description: "A classic, extremely slow sloth. Generates Zzz's by napping." },
  { id: 'disco',   name: 'Disco Sloth',   emoji: '🕺', baseCost: 300,                 baseZzzPerSec: 0.5,         costScale: 1.13, color: '#FF4081', description: "Found on the dancefloor in 1978. Still hasn't left." },
  { id: 'rainbow', name: 'Rainbow Sloth', emoji: '🌈', baseCost: 4_000,               baseZzzPerSec: 2,           costScale: 1.14, color: '#AB47BC', description: "Radiates positivity and colorful Zzz's everywhere." },
  { id: 'wizard',  name: 'Wizard Sloth',  emoji: '🧙', baseCost: 60_000,              baseZzzPerSec: 8,           costScale: 1.15, color: '#5C6BC0', description: 'Studied magic for 400 years. Still on chapter one.' },
  { id: 'space',   name: 'Space Sloth',   emoji: '🚀', baseCost: 1_000_000,           baseZzzPerSec: 30,          costScale: 1.16, color: '#26C6DA', description: 'Drifts through zero gravity at exactly 0.003 mph.' },
  { id: 'pizza',   name: 'Pizza Sloth',   emoji: '🍕', baseCost: 20_000_000,          baseZzzPerSec: 100,         costScale: 1.17, color: '#FFA726', description: 'Smells amazing. Has eaten 47 pizzas since Tuesday.' },
  { id: 'dino',    name: 'Dino Sloth',    emoji: '🦕', baseCost: 450_000_000,         baseZzzPerSec: 400,         costScale: 1.18, color: '#66BB6A', description: 'Ancient and wise. Refuses to hurry for any reason.' },
  { id: 'unicorn', name: 'Unicorn Sloth', emoji: '🦄', baseCost: 12_000_000_000,      baseZzzPerSec: 1_600,       costScale: 1.20, color: '#EC407A', description: 'Mythically lazy. Its horn is purely decorative.' },
  { id: 'dragon',  name: 'Dragon Sloth',  emoji: '🐉', baseCost: 400_000_000_000,     baseZzzPerSec: 6_400,       costScale: 1.22, color: '#EF5350', description: 'Breathes fire — but only to warm up its hammock.' },
  { id: 'ghost',   name: 'Ghost Sloth',   emoji: '👻', baseCost: 16_000_000_000_000,  baseZzzPerSec: 25_600,      costScale: 1.24, color: '#B0BEC5', description: 'Technically haunting your sanctuary. Very gently.' },
  { id: 'robot',   name: 'Robot Sloth',   emoji: '🤖', baseCost: 700_000_000_000_000, baseZzzPerSec: 102_400,     costScale: 1.27, color: '#42A5F5', description: 'Programmed to be efficient. Has a bug making it sleep instead.' },
  { id: 'ninja',   name: 'Ninja Sloth',   emoji: '🥷', baseCost: 3.5e16,              baseZzzPerSec: 409_600,     costScale: 1.30, color: '#78909C', description: 'Silent and deadly slow. You will not see it move. Ever.' },
  { id: 'alien',   name: 'Alien Sloth',   emoji: '👽', baseCost: 2e18,                baseZzzPerSec: 1_638_400,   costScale: 1.33, color: '#26A69A', description: 'Travelled 400 light years for a nap here. Worth it.' },
  { id: 'vampire', name: 'Vampire Sloth', emoji: '🧛', baseCost: 1.5e20,              baseZzzPerSec: 6_553_600,   costScale: 1.36, color: '#7E57C2', description: '900 years old. "Nearly awake" since the 14th century.' },
  { id: 'cowboy',  name: 'Cowboy Sloth',  emoji: '🤠', baseCost: 1.2e22,              baseZzzPerSec: 26_214_400,  costScale: 1.39, color: '#A1887F', description: 'Rode into town at 0.2 mph. Tipped hat. Fell asleep.' },
  { id: 'cosmic',  name: 'Cosmic Sloth',  emoji: '⭐', baseCost: 1.2e24,              baseZzzPerSec: 104_857_600, costScale: 1.42, color: '#FFD54F', description: 'Born in a supernova. Naps measured in millennia.' },
];

export const UPGRADES: Upgrade[] = [
  // Production multipliers — deliberately modest; they multiply each other so keep them small.
  // Full set purchased: ~500,000× total (was ~10^21 — way too much).
  { id: 'hammocks',            name: 'Comfy Hammocks',         emoji: '🛏️', cost: 100,             multiplier: 1.5,    effect: '+50% all sloths',      unlockAt: 50,              description: 'Everyone gets a hammock! +50% all sloth production.' },
  { id: 'party_hats',         name: 'Tiny Party Hats',         emoji: '🎉', cost: 2_000,           multiplier: 2,      effect: '2× all sloths',        unlockAt: 1_000,           description: 'Sloths LOVE tiny hats. 2× all production!' },
  { id: 'yoga',               name: 'Sloth Yoga',              emoji: '🧘', cost: 15_000,          multiplier: 2.5,    effect: '2.5× all sloths',      unlockAt: 7_500,           description: 'Deep relaxation multiplies focus. 2.5× all sloths!' },
  { id: 'leaf_buffet',        name: 'Infinite Leaf Buffet',    emoji: '🍃', cost: 100_000,         multiplier: 3,      effect: '3× all sloths',        unlockAt: 50_000,          description: "Well-fed sloths work harder (barely). 3× all!" },
  { id: 'disco_ball',         name: 'Sanctuary Disco Ball',    emoji: '🪩', cost: 1_000_000,       multiplier: 4,      effect: '4× all sloths',        unlockAt: 500_000,         description: "Maximum vibes. MAXIMUM ZZZ'S. 4× all!" },
  { id: 'rocket_hammocks',    name: 'Rocket Hammocks',         emoji: '🛸', cost: 10_000_000,      multiplier: 5,      effect: '5× all sloths',        unlockAt: 5_000_000,       description: "Sloths go FAST... in their dreams. 5× all!" },
  { id: 'time_crystal',       name: 'Time Crystal',            emoji: '💎', cost: 100_000_000,     multiplier: 7,      effect: '7× all sloths',        unlockAt: 50_000_000,      description: 'Bends spacetime so sloths nap harder. 7× all!' },
  { id: 'sloth_university',   name: 'Sloth University',        emoji: '🎓', cost: 1_000_000_000,   multiplier: 10,     effect: '10× all sloths',       unlockAt: 500_000_000,     description: 'Degrees in Advanced Napping and Applied Laziness. 10×!' },
  { id: 'quantum_nap',        name: 'Quantum Nap Chamber',     emoji: '🔬', cost: 15_000_000_000,  multiplier: 14,     effect: '14× all sloths',       unlockAt: 7_500_000_000,   description: 'Sloths nap in superposition: asleep AND more asleep. 14×!' },
  { id: 'multiverse_hammock', name: 'Multiverse Hammock',      emoji: '🌀', cost: 200_000_000_000, multiplier: 20,     effect: '20× all sloths',       unlockAt: 100_000_000_000, description: 'All 47 parallel-universe sloths now work for you. 20×!' },
  { id: 'cosmic_vibes',       name: 'Cosmic Vibe Alignment',   emoji: '🌌', cost: 3_000_000_000_000, multiplier: 28,   effect: '28× all sloths',       unlockAt: 1_500_000_000_000, description: 'The universe vibrates at sloth frequency. 28×!' },
  { id: 'big_bang_nap',       name: 'Big Bang Nap Theory',     emoji: '💥', cost: 50_000_000_000_000, multiplier: 40,  effect: '40× all sloths',       unlockAt: 25_000_000_000_000, description: 'The Big Bang was a very loud snore. 40×!' },
  { id: 'sloth_singularity',  name: 'Sloth Singularity',       emoji: '🕳️', cost: 1e15,             multiplier: 55,     effect: '55× all sloths',       unlockAt: 5e14,            description: 'A black hole of pure laziness. 55×!' },
  { id: 'infinite_dream',     name: 'The Infinite Dream',      emoji: '🌙', cost: 2e16,             multiplier: 75,     effect: '75× all sloths',       unlockAt: 1e16,            description: "One sloth's dream fills an entire universe. 75×!" },
  // Auto-rescue tiers (hold to click) — each tier requires buying the previous
  { id: 'auto_hands',   name: 'Extra Rescue Hands',      emoji: '🙌', cost: 5_000,         multiplier: 1, clickMultiplier: undefined, effect: 'Hold: 1 rescue/sec',   unlockAt: 2_000,       description: 'Hold the rescue button to auto-rescue 1× per second.' },
  { id: 'auto_hands_2', name: 'Double-Speed Rescue',     emoji: '🙌🙌', cost: 50_000,       multiplier: 1, clickMultiplier: undefined, effect: 'Hold: 2 rescues/sec',  unlockAt: 20_000,      description: 'Auto-rescue upgraded to 2× per second!' },
  { id: 'auto_hands_3', name: 'Triple-Speed Rescue',     emoji: '⚡🙌', cost: 500_000,      multiplier: 1, clickMultiplier: undefined, effect: 'Hold: 3 rescues/sec',  unlockAt: 200_000,     description: 'Auto-rescue upgraded to 3× per second!' },
  { id: 'auto_hands_4', name: 'Quad-Speed Rescue',       emoji: '🔥🙌', cost: 5_000_000,    multiplier: 1, clickMultiplier: undefined, effect: 'Hold: 4 rescues/sec',  unlockAt: 2_000_000,   description: 'Auto-rescue upgraded to 4× per second!' },
  { id: 'auto_hands_5',    name: 'MAX RESCUE SPEED',     emoji: '💥🙌', cost: 50_000_000,   multiplier: 1, clickMultiplier: undefined, effect: 'Hold: 5 rescues/sec',  unlockAt: 20_000_000,  description: 'Maximum auto-rescue: 5× per second. The sloths can barely keep up.' },
  { id: 'auto_passive',    name: 'Rescue-O-Matic 3000',  emoji: '🦾',   cost: 500_000_000,  multiplier: 1, clickMultiplier: undefined, effect: 'Auto-rescues while focused', unlockAt: 200_000_000, description: 'A robot handles rescues automatically while the tab is in focus. Speed matches your hold-click tier.' },
  // Click multipliers
  { id: 'better_net',         name: 'Bigger Rescue Net',       emoji: '🕸️', cost: 500,             multiplier: 1, clickMultiplier: 5,   effect: '5× click',    unlockAt: 200,            description: "5× click power. Scoop up more Zzz's!" },
  { id: 'turbo_van',          name: 'Turbo Rescue Van',        emoji: '🚐', cost: 20_000,          multiplier: 1, clickMultiplier: 10,  effect: '10× click',   unlockAt: 10_000,         description: "Arrives in only 3 business days. 10× click!" },
  { id: 'dimension_portal',   name: 'Rescue Dimension Portal', emoji: '🌀', cost: 5_000_000_000,   multiplier: 1, clickMultiplier: 100, effect: '100× click',  unlockAt: 2_500_000_000,  description: 'Rescue sloths from 100 dimensions simultaneously. 100× click!' },
  { id: 'reality_distortion', name: 'Reality Distortion Field',emoji: '🔮', cost: 1e13,            multiplier: 1, clickMultiplier: 1_000, effect: '1,000× click', unlockAt: 5e12,         description: 'Your clicks warp space. 1,000× click!' },
];

// Prestige upgrades — infinite tiers
const PRESTIGE_NAMES = [
  'The Infinite Snooze', 'Quantum Laziness Protocol', 'Hyper Slumber Mode',
  'Cosmic Dream State', 'Void Nap Activated', 'Absolute Maximum Chill',
  'Transcendent Slumber', 'The Big Sleep 2.0', 'Ultra Premium Hammock',
  'Elite Sloth Overdrive', 'Prestige Nap Stack', 'Legendary Zzz Cascade',
  'Omega Laziness Core', 'The Final Slumber', 'Epoch-Level Snooze',
];
const PRESTIGE_EMOJIS = ['🌟', '💫', '✨', '🌈', '⚡', '🔮', '💎', '🌙', '🎇', '🏆', '🎆', '☄️'];

export function generatePrestigeUpgrade(tier: number): Upgrade {
  const cost = 1e17 * Math.pow(8, tier);
  // Each prestige tier gives a meaningful but not explosive boost.
  // Tier 0: ×80, tier 1: ×200, tier 2: ×500, tier 3: ×1250 ... (×2.5 per tier)
  const multiplier = Math.round(80 * Math.pow(2.5, tier));
  const name = PRESTIGE_NAMES[tier % PRESTIGE_NAMES.length];
  return {
    id: `prestige_${tier}`,
    name: tier < PRESTIGE_NAMES.length ? name : `${name} (T${tier + 1})`,
    emoji: PRESTIGE_EMOJIS[tier % PRESTIGE_EMOJIS.length],
    description: `Tier ${tier + 1} prestige! ${multiplier.toLocaleString()}× all sloths. The sloths are awestruck.`,
    cost,
    effect: `${multiplier.toLocaleString()}× all sloths`,
    multiplier,
    unlockAt: cost * 0.05,
  };
}

export function getCurrentPrestigeTier(state: GameState): number {
  let t = 0;
  while (state.upgrades[`prestige_${t}`]) t++;
  return t;
}

export function getNextPrestigeUpgrade(state: GameState): Upgrade {
  return generatePrestigeUpgrade(getCurrentPrestigeTier(state));
}

// ----- World Strain -----
// Dragon-tier sloths (dragon and above) cause exponentially rising costs.
// This resets on rebirth, making rebirth the primary way to escape the cost wall.
const LATE_TIER_IDS = ['dragon', 'ghost', 'robot', 'ninja', 'alien', 'vampire', 'cowboy', 'cosmic'];

export function getLateTierStrain(state: GameState): number {
  return LATE_TIER_IDS.reduce((sum, id) => sum + (state.slothCounts[id] ?? 0), 0);
}

export function getStrainMultiplier(state: GameState): number {
  const strain = getLateTierStrain(state);
  if (strain === 0) return 1;
  return Math.pow(1 + BALANCE.strainExponent, strain);
}

// ----- Cost -----
export function getSlothCost(state: GameState, slothId: string): number {
  const s = SLOTH_TYPES.find(x => x.id === slothId)!;
  const count = state.slothCounts[slothId] ?? 0;
  const baseCost = currentDifficulty === 'easy' ? (EASY_BASE_COSTS[slothId] ?? s.baseCost) : s.baseCost;
  return Math.floor(baseCost * BALANCE.costScale * Math.pow(s.costScale, count) * getStrainMultiplier(state));
}

// ----- Milestone bonus: COMPOUNDING every milestoneEvery sloths -----
// Each milestone multiplies the previous output: ×2, then ×3 of that, then ×4...
// 25 → ×2,  50 → ×6,  75 → ×24,  100 → ×120,  125 → ×720,  150 → ×5040...
export function getMilestoneMult(count: number): number {
  const n = Math.floor(count / BALANCE.milestoneEvery);
  let mult = 1;
  for (let i = 2; i <= n + 1; i++) mult *= i;
  return mult;
}

// What will the multiplier be at the NEXT milestone?
export function getNextMilestoneMult(count: number): number {
  const n = Math.floor(count / BALANCE.milestoneEvery) + 1;
  let mult = 1;
  for (let i = 2; i <= n + 1; i++) mult *= i;
  return mult;
}

export function getNextMilestone(count: number): number {
  return (Math.floor(count / BALANCE.milestoneEvery) + 1) * BALANCE.milestoneEvery;
}

// ----- Rebirth -----
export function canRebirth(state: GameState): boolean {
  return (state.slothCounts['dragon'] ?? 0) >= 1 && state.totalZzzEarned >= 1_000_000;
}

export function rebirth(state: GameState): GameState {
  if (!canRebirth(state)) return state;
  const souls = state.rebirthSouls + 1;
  return {
    ...createInitialState(),
    rebirthCount: state.rebirthCount + 1,
    rebirthSouls: souls,
    achievements: state.achievements,
    storyIndex: state.storyIndex,
    totalRescues: state.totalRescues, // keep all-time total
    lastSave: Date.now(),
  };
}

export function getRebirthMultiplier(state: GameState): number {
  // +50% per soul, additive: 1 + souls * 0.5
  return 1 + state.rebirthSouls * 0.5;
}

// ----- Production -----
export function getProductionMultiplier(state: GameState): number {
  let mult = getRebirthMultiplier(state);
  for (const u of UPGRADES) {
    if (state.upgrades[u.id] && u.multiplier > 1) mult *= u.multiplier;
  }
  let tier = 0;
  while (state.upgrades[`prestige_${tier}`]) {
    mult *= generatePrestigeUpgrade(tier).multiplier;
    tier++;
  }
  return mult;
}

export function calcZzzPerSec(state: GameState): number {
  let zps = 0;
  for (const sloth of SLOTH_TYPES) {
    const count = state.slothCounts[sloth.id] ?? 0;
    if (count === 0) continue;
    zps += count * sloth.baseZzzPerSec * getMilestoneMult(count);
  }
  return zps * getProductionMultiplier(state) * BALANCE.productionScale;
}

export function getClickValue(state: GameState): number {
  let val = 1;
  for (const u of UPGRADES) {
    if (state.upgrades[u.id] && u.clickMultiplier) val *= u.clickMultiplier;
  }
  return val * getRebirthMultiplier(state) * BALANCE.clickScale;
}

// ----- Actions -----
export function tick(state: GameState, dt: number): GameState {
  const earned = calcZzzPerSec(state) * dt;
  return { ...state, zzz: state.zzz + earned, totalZzzEarned: state.totalZzzEarned + earned };
}

export function rescue(state: GameState): { state: GameState; earned: number } {
  const val = getClickValue(state);
  return {
    earned: val,
    state: {
      ...state,
      zzz: state.zzz + val,
      totalZzzEarned: state.totalZzzEarned + val,
      totalRescues: state.totalRescues + 1,
      totalClickCount: state.totalClickCount + 1,
    },
  };
}

export function earnZzz(state: GameState, amount: number): GameState {
  return { ...state, zzz: state.zzz + amount, totalZzzEarned: state.totalZzzEarned + amount };
}

export function buySloth(state: GameState, slothId: string): GameState {
  const cost = getSlothCost(state, slothId);
  if (state.zzz < cost) return state;
  return {
    ...state,
    zzz: state.zzz - cost,
    slothCounts: { ...state.slothCounts, [slothId]: (state.slothCounts[slothId] ?? 0) + 1 },
  };
}

export function buyUpgrade(state: GameState, upgradeId: string): GameState {
  const upgrade = upgradeId.startsWith('prestige_')
    ? generatePrestigeUpgrade(parseInt(upgradeId.split('_')[1], 10))
    : UPGRADES.find(u => u.id === upgradeId);
  if (!upgrade || state.zzz < upgrade.cost || state.upgrades[upgradeId]) return state;
  return { ...state, zzz: state.zzz - upgrade.cost, upgrades: { ...state.upgrades, [upgradeId]: true } };
}

export const RESCUE_SITUATIONS = [
  'stuck in a revolving door',
  'trying to use a self-checkout machine',
  'lost in a Netflix menu for 3 days',
  'trapped in bubble wrap',
  'tangled in Christmas lights',
  'confused by an escalator',
  'fell asleep in a shopping trolley',
  'got lost in IKEA (again)',
  'sat on the TV remote',
  'fell asleep waiting for Windows to update',
  'stuck in a roundabout since Tuesday',
  'tangled in headphone cables',
  'riding the wrong train to Adelaide',
  'tried to eat the fake fruit display',
  'fell asleep during a Zoom call',
  'stuck to a velcro wall at a kids party',
  'floating down the river on a pool noodle',
  "can't figure out automatic doors",
  'locked in a library after hours (sent a postcard)',
  'tried to high-five a cardboard cutout',
  'napping in the sock display at Target',
  'attached to a helium balloon bouquet',
  'wedged between sofa cushions (very cosy)',
  'tried to take a selfie with a mirror',
  'stuck inside a giant bouncy castle',
  'riding a Roomba around the house',
  'found in the ball pit at a fast food place',
  'accidentally ordered 200 pizzas online',
  'got a paw stuck in a jar of peanut butter',
  'tried to catch a butterfly for 6 hours',
  'convinced a snail was a speed demon',
  'hanging from the ceiling fan (very gently)',
  'stuck between pages of a library book since 1994',
  'fell asleep mid-sentence in a job interview',
];

export function createInitialState(): GameState {
  return {
    zzz: 0,
    totalZzzEarned: 0,
    totalRescues: 0,
    totalClickCount: 0,
    slothCounts: {},
    upgrades: {},
    achievements: {},
    storyIndex: 0,
    rebirthCount: 0,
    rebirthSouls: 0,
    lastSave: Date.now(),
  };
}

export function saveGame(state: GameState): void {
  localStorage.setItem('sloth-rescue-save', JSON.stringify({ ...state, lastSave: Date.now() }));
}

export function loadGame(): GameState {
  try {
    const saved = localStorage.getItem('sloth-rescue-save');
    if (saved) {
      const p = JSON.parse(saved) as Partial<GameState>;
      const s: GameState = {
        zzz: p.zzz ?? 0,
        totalZzzEarned: p.totalZzzEarned ?? 0,
        totalRescues: p.totalRescues ?? 0,
        totalClickCount: p.totalClickCount ?? 0,
        slothCounts: p.slothCounts ?? {},
        upgrades: p.upgrades ?? {},
        achievements: p.achievements ?? {},
        storyIndex: p.storyIndex ?? 0,
        rebirthCount: p.rebirthCount ?? 0,
        rebirthSouls: p.rebirthSouls ?? 0,
        lastSave: p.lastSave ?? Date.now(),
      };
      const elapsed = Math.min((Date.now() - s.lastSave) / 1000, BALANCE.offlineCapSecs);
      const offline = calcZzzPerSec(s) * elapsed;
      return { ...s, zzz: s.zzz + offline, totalZzzEarned: s.totalZzzEarned + offline, lastSave: Date.now() };
    }
  } catch { /* ignore */ }
  return createInitialState();
}
