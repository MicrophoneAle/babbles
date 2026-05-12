export const PROMPTS = [
  "What made you smile today?",
  "What is one thing you are grateful for right now?",
  "What moment felt unexpectedly meaningful today?",
  "What challenged you the most, and what did you learn?",
  "What did your body need today, and did you listen?",
  "What would you like tomorrow-you to remember?",
  "What felt calm and grounding today?",
  "What are you currently overthinking?",
  "What is one tiny win you can celebrate?",
  "Who or what gave you energy today?",
  "What drained your energy today?",
  "What is something kind you did for yourself?",
  "What is something kind you did for someone else?",
  "What did you avoid, and why?",
  "What felt playful today?",
  "What is one thought you want to reframe?",
  "What does progress look like this week?",
  "What emotion showed up the strongest today?",
  "What are you proud of from today?",
  "What are you afraid to admit to yourself?",
  "What boundaries did you hold well today?",
  "What would make tonight feel restful?",
  "What are you looking forward to this month?",
  "What has been on your mind repeatedly?",
  "What inspired you today?",
  "What did you learn about yourself today?",
  "What routine is helping you lately?",
  "What routine is no longer serving you?",
  "What does your ideal morning look like?",
  "What do you need more of this week?"
];

export function getRandomPrompts(count = 3) {
  const shuffled = [...PROMPTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
