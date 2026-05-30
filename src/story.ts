import type { GameState } from './game';

export interface StoryEvent {
  id: string;
  trigger: (state: GameState) => boolean;
  message: string;
  emoji: string;
}

export const STORY_EVENTS: StoryEvent[] = [
  {
    id: 'start',     emoji: '📞',
    trigger: s => s.totalRescues >= 1,
    message: 'Day 1: You received a distress call. A sloth was stuck in a revolving door. You rescued it. It stared at you for 8 minutes, then went back to sleep.',
  },
  {
    id: 's5',        emoji: '📰',
    trigger: s => s.totalRescues >= 5,
    message: 'Word is spreading in the local sloth community. They\'re calling you "The One Who Moves Slightly Faster Than Us."',
  },
  {
    id: 's10',       emoji: '🏠',
    trigger: s => s.totalRescues >= 10,
    message: 'Your sanctuary is getting crowded. The sloths have formed a committee. They\'ve been in their first meeting for 3 weeks.',
  },
  {
    id: 's25',       emoji: '🎥',
    trigger: s => s.totalRescues >= 25,
    message: 'A documentary crew has arrived. They\'ve been waiting 4 hours for a sloth to do something. Still waiting. The cameraman is asleep.',
  },
  {
    id: 's50',       emoji: '📖',
    trigger: s => s.totalRescues >= 50,
    message: '"Sloth Weekly" magazine headline: "Local Hero: Somehow Even Slower Than Expected." You\'re on the cover, blurry, because the photographer blinked.',
  },
  {
    id: 's100',      emoji: '🏛️',
    trigger: s => s.totalRescues >= 100,
    message: 'The International Sloth Rescue Council has contacted you. They need 3-5 business months to process your membership application.',
  },
  {
    id: 's250',      emoji: '📱',
    trigger: s => s.totalRescues >= 250,
    message: 'You\'ve gone viral on SlothTok. Most popular video: 47 minutes of a sloth trying to reach a leaf. 98 million views. 94 million shares.',
  },
  {
    id: 's500',      emoji: '🌍',
    trigger: s => s.totalRescues >= 500,
    message: 'World leaders are requesting your expertise. You explained to the G20 why sloths move slowly. The summit ran 3 hours over. Nobody minded.',
  },
  {
    id: 's1000',     emoji: '🏆',
    trigger: s => s.totalRescues >= 1_000,
    message: 'You\'ve been awarded the Nobel Prize for Sloth Excellence. The ceremony is 6 months behind schedule. The sloths organised the catering.',
  },
  {
    id: 's2500',     emoji: '🚀',
    trigger: s => s.totalRescues >= 2_500,
    message: 'NASA detected sloths in space. Apparently they\'ve been there since 1987. Nobody noticed because they were just hanging there, very quietly.',
  },
  {
    id: 's5000',     emoji: '🧘',
    trigger: s => s.totalRescues >= 5_000,
    message: 'One sloth has achieved enlightenment. It shared its wisdom: "...". That\'s it. Just the ellipsis. Other sloths are writing a 400-page thesis about it.',
  },
  {
    id: 's10k',      emoji: '🌌',
    trigger: s => s.totalRescues >= 10_000,
    message: 'All Earth sloths rescued! You\'ve started a sloth colony on Mars. The commute takes 8 months. They arrived 3 months late. Still on time by sloth standards.',
  },
  {
    id: 'z1b',       emoji: '💰',
    trigger: s => s.totalZzzEarned >= 1_000_000_000,
    message: 'Your Zzz-based economy has overtaken the GDP of several small nations. The IMF wants a meeting. They\'ve been on hold for 6 weeks.',
  },
  {
    id: 'z1t',       emoji: '🌠',
    trigger: s => s.totalZzzEarned >= 1_000_000_000_000,
    message: 'BREAKING: Scientists confirm the universe is, in fact, a giant sloth napping. You were right all along. A Nobel Prize is on its way. Slowly.',
  },
  {
    id: 'rebirth1',  emoji: '🔄',
    trigger: s => (s as any).rebirthCount >= 1,
    message: 'You\'ve reborn! The sloths don\'t remember, but they feel oddly warm inside. Sloth Souls infuse every fibre of the sanctuary with ancient lazy power.',
  },
  {
    id: 'rebirth5',  emoji: '⚗️',
    trigger: s => (s as any).rebirthCount >= 5,
    message: 'Fifth rebirth! You\'ve lived more sloth lives than any human should. The fabric of reality smells faintly of leaves and hammock rope.',
  },
  {
    id: 'rebirth10', emoji: '🌀',
    trigger: s => (s as any).rebirthCount >= 10,
    message: 'Ten rebirths. Are you even human anymore? The sloths revere you as "The Eternal One Who Occasionally Clicks". A temple has been constructed. (Very slowly.)',
  },
];

export function checkStory(state: GameState): { state: GameState; newEvent: StoryEvent | null } {
  if (state.storyIndex >= STORY_EVENTS.length) return { state, newEvent: null };
  const event = STORY_EVENTS[state.storyIndex];
  if (event.trigger(state)) {
    return { state: { ...state, storyIndex: state.storyIndex + 1 }, newEvent: event };
  }
  return { state, newEvent: null };
}
