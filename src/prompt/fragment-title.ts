
export const FRAGMENT_TITLE_PROMPT = `
Generate a short, descriptive title for a code fragment from its <task_summary>.

The title must be:
- specific to what was built or changed
- at most 3 words
- title case, e.g. "Project Tracker", "Chat Widget", "Pricing Page"
- free of punctuation, quotes, and prefixes

Return the raw title and nothing else.
`;
