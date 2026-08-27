
export const FRAGMENT_TITLE_PROMPT = `
You are naming a mobile app design from its <task_summary>.

Return the app's own name if the summary states one — that is almost always the
right answer, and it is what the user typed to start this.

Otherwise write a title that is:
- specific to the product that was designed
- at most 3 words
- title case, e.g. "Lumen", "Field Notes", "Split Ledger"
- free of punctuation, quotes, and prefixes

Never return "Mobile App", "App Design", "UI Kit", or anything that would fit
any app. Return the raw title and nothing else.
`;
