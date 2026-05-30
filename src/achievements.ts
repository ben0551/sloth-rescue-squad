import type { GameState } from './game';
import { calcZzzPerSec, SLOTH_TYPES } from './game';

export interface Achievement {
  id: string;
  name: string;
  emoji: string;
  description: string;
  condition: (state: GameState) => boolean;
}

function totalSloths(s: GameState): number {
  return Object.values(s.slothCounts).reduce((a, b) => a + b, 0);
}

export const ACHIEVEMENTS: Achievement[] = [
  // Rescues
  { id: 'r1',    name: 'First Contact!',        emoji: '🤝', description: 'Rescued your first sloth. It stared at you for 8 minutes then went back to sleep.', condition: s => s.totalRescues >= 1 },
  { id: 'r10',   name: 'Getting Warmed Up',      emoji: '🔥', description: '10 rescues! You\'re on a roll. (A very, very slow roll.)', condition: s => s.totalRescues >= 10 },
  { id: 'r100',  name: 'Century Club',           emoji: '💯', description: '100 sloths rescued! You are a local legend. A sloth legend.', condition: s => s.totalRescues >= 100 },
  { id: 'r500',  name: 'Rescue Legend',          emoji: '⭐', description: '500 rescues! Other animal charities are intimidated.', condition: s => s.totalRescues >= 500 },
  { id: 'r1k',   name: 'Rescue Overlord',        emoji: '👑', description: '1,000 rescues! You are slightly famous. Mainly among sloths.', condition: s => s.totalRescues >= 1_000 },
  { id: 'r10k',  name: 'Sloth Messiah',          emoji: '✨', description: '10,000 rescues! Other rescue services have given up entirely.', condition: s => s.totalRescues >= 10_000 },
  { id: 'r100k', name: 'Beyond Comprehension',   emoji: '🌌', description: '100,000 sloths rescued. The concept of "sloth in need" no longer exists.', condition: s => s.totalRescues >= 100_000 },

  // Clicking
  { id: 'c50',   name: 'Button Appreciator',     emoji: '👆', description: '50 clicks. The button is starting to feel like a friend.', condition: s => s.totalClickCount >= 50 },
  { id: 'c500',  name: 'Click Machine',           emoji: '🤖', description: '500 clicks. Your finger deserves a medal. The sloths do not care.', condition: s => s.totalClickCount >= 500 },
  { id: 'c5k',   name: 'Click Deity',             emoji: '⚡', description: '5,000 clicks. You ARE the button.', condition: s => s.totalClickCount >= 5_000 },
  { id: 'c50k',  name: 'Infinite Clicker',        emoji: '♾️', description: '50,000 clicks. Scientists are studying you.', condition: s => s.totalClickCount >= 50_000 },

  // Ownership
  { id: 'o10',   name: 'Tiny Herd',               emoji: '🐾', description: '10 sloths in the sanctuary! It\'s getting cosy.', condition: s => totalSloths(s) >= 10 },
  { id: 'o50',   name: 'Small Army',              emoji: '🦥', description: '50 sloths! Slowest army in recorded history.', condition: s => totalSloths(s) >= 50 },
  { id: 'o100',  name: 'Sloth City',              emoji: '🏙️', description: '100 sloths! You\'ve accidentally built a city. Zoning is a nightmare.', condition: s => totalSloths(s) >= 100 },
  { id: 'o250',  name: 'Sloth Nation',            emoji: '🌍', description: '250 sloths! The UN wants to know about your new country.', condition: s => totalSloths(s) >= 250 },
  { id: 'o1000', name: 'Sloth Empire',            emoji: '🏰', description: '1,000 sloths! Historians will write about this. Very slowly.', condition: s => totalSloths(s) >= 1_000 },
  { id: 'o5000', name: 'Sloth Singularity',       emoji: '🕳️', description: '5,000 sloths. The weight of sloth fur is affecting local gravity.', condition: s => totalSloths(s) >= 5_000 },

  // Zzz earned
  { id: 'z10k',  name: 'Petty Cash',              emoji: '💰', description: 'Earned 10,000 Zzz total. A good start.', condition: s => s.totalZzzEarned >= 10_000 },
  { id: 'z1m',   name: "Zzz Millionaire",         emoji: '🤑', description: 'Earned 1,000,000 Zzz! You could buy a very large hammock.', condition: s => s.totalZzzEarned >= 1_000_000 },
  { id: 'z1b',   name: "Zzz Billionaire",         emoji: '🏦', description: 'Earned 1,000,000,000 Zzz! The sloth economy is BOOMING.', condition: s => s.totalZzzEarned >= 1_000_000_000 },
  { id: 'z1t',   name: "Zzz Trillionaire",        emoji: '🚀', description: 'Earned 1,000,000,000,000 Zzz! The global economy is now sloth-based.', condition: s => s.totalZzzEarned >= 1_000_000_000_000 },
  { id: 'z1q',   name: "Zzz Quadrillionaire",     emoji: '🌟', description: 'Zzz beyond comprehension. The sun generates less energy than this sanctuary.', condition: s => s.totalZzzEarned >= 1e15 },

  // Zzz/sec rates
  { id: 's100',  name: 'Getting Speedy',          emoji: '💨', description: '100 Zzz/sec! By sloth standards, this is supersonic.', condition: s => calcZzzPerSec(s) >= 100 },
  { id: 's10k',  name: 'Sloth Turbo',             emoji: '🏎️', description: '10,000 Zzz/sec! Sloths are defying physics.', condition: s => calcZzzPerSec(s) >= 10_000 },
  { id: 's1m',   name: 'Lightspeed Nap',          emoji: '☀️', description: '1,000,000 Zzz/sec! The concept of "slow" no longer applies to you.', condition: s => calcZzzPerSec(s) >= 1_000_000 },
  { id: 's1b',   name: 'Nap Singularity',         emoji: '🌌', description: '1,000,000,000 Zzz/sec! You\'ve broken the laws of laziness.', condition: s => calcZzzPerSec(s) >= 1_000_000_000 },

  // Upgrades
  { id: 'u1',    name: 'First Upgrade!',          emoji: '⬆️', description: 'Bought your first upgrade! The sloths noticed. (Eventually.)', condition: s => Object.values(s.upgrades).filter(Boolean).length >= 1 },
  { id: 'u5',    name: 'Upgrade Addict',          emoji: '🔧', description: '5 upgrades purchased. This is getting out of hand.', condition: s => Object.values(s.upgrades).filter(Boolean).length >= 5 },
  { id: 'u14',   name: 'Max Standard',            emoji: '💎', description: 'All standard upgrades purchased! The sloths are mildly impressed.', condition: s => ACHIEVEMENTS.find(a => a.id === 'u14')! && Object.keys(s.upgrades).filter(k => !k.startsWith('prestige_') && s.upgrades[k]).length >= 14 },
  { id: 'pres1', name: 'Prestige Achieved',       emoji: '🏆', description: 'Bought your first prestige upgrade! Welcome to the deep end.', condition: s => !!s.upgrades['prestige_0'] },
  { id: 'pres5', name: 'Prestige Master',         emoji: '🌟', description: '5 prestige upgrades! You are incomprehensibly powerful. Somehow involving sloths.', condition: s => !!s.upgrades['prestige_4'] },

  // Specific sloths
  { id: 'disco1', name: 'Disco Fever',            emoji: '🕺', description: 'Adopted a Disco Sloth. It has been dancing since 1978.', condition: s => (s.slothCounts['disco'] ?? 0) >= 1 },
  { id: 'space1', name: 'Houston, We Have a Sloth', emoji: '🌙', description: 'A Space Sloth joined the sanctuary. Drifting at 0.003 mph since 1987.', condition: s => (s.slothCounts['space'] ?? 0) >= 1 },
  { id: 'drag1',  name: 'Here Be Sloths',         emoji: '🐉', description: "A Dragon Sloth! It breathes fire only to warm its hammock.", condition: s => (s.slothCounts['dragon'] ?? 0) >= 1 },
  { id: 'csmk1',  name: 'Born In A Supernova',    emoji: '⭐', description: 'You own a Cosmic Sloth. Its naps last longer than galaxies.', condition: s => (s.slothCounts['cosmic'] ?? 0) >= 1 },
  { id: 'alltyp', name: "Collector's Edition",    emoji: '🎖️', description: 'Owned every type of sloth! The impossible has been done.', condition: s => SLOTH_TYPES.every(t => (s.slothCounts[t.id] ?? 0) >= 1) },

  // Milestones
  { id: 'mil1',   name: 'Milestone Reached!',     emoji: '🏅', description: 'Reached 25 of a single sloth type — their output doubled!', condition: s => SLOTH_TYPES.some(t => (s.slothCounts[t.id] ?? 0) >= 25) },
  { id: 'mil4',   name: 'Milestone ×16',          emoji: '🌠', description: '100 of a single sloth type — 16× their individual output!', condition: s => SLOTH_TYPES.some(t => (s.slothCounts[t.id] ?? 0) >= 100) },

  // Minigame
  { id: 'mini1',  name: 'Play Time!',             emoji: '🎮', description: 'Played the Rescue Rush minigame for the first time!', condition: s => (s.totalRescues >= 1) && false }, // set manually
];

// This one is set manually by the minigame, not by condition scanning
export const MINIGAME_ACHIEVEMENT_ID = 'mini1';

export function checkAchievements(state: GameState): { state: GameState; newAchievements: Achievement[] } {
  const unlocked: Achievement[] = [];
  let s = state;
  for (const ach of ACHIEVEMENTS) {
    if (ach.id === MINIGAME_ACHIEVEMENT_ID) continue; // handled separately
    if (!s.achievements[ach.id] && ach.condition(s)) {
      s = { ...s, achievements: { ...s.achievements, [ach.id]: true } };
      unlocked.push(ach);
    }
  }
  return { state: s, newAchievements: unlocked };
}

export function unlockAchievement(state: GameState, id: string): { state: GameState; achievement: Achievement | null } {
  if (state.achievements[id]) return { state, achievement: null };
  const ach = ACHIEVEMENTS.find(a => a.id === id) ?? null;
  if (!ach) return { state, achievement: null };
  return { state: { ...state, achievements: { ...state.achievements, [id]: true } }, achievement: ach };
}
