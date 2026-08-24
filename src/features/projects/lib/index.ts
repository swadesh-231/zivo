const ADJECTIVES = [
  "amber", "bold", "brave", "calm", "clever", "cosmic", "crisp", "dawn",
  "eager", "electric", "fluent", "gentle", "golden", "hidden", "ivory",
  "jolly", "keen", "lucid", "mellow", "nimble", "noble", "polar", "quiet",
  "rapid", "rustic", "silent", "solar", "spry", "sunny", "swift", "teal",
  "tidy", "vivid", "warm", "wild", "witty", "zesty",
];

const NOUNS = [
  "atlas", "beacon", "brook", "canyon", "cedar", "comet", "delta", "ember",
  "falcon", "forge", "grove", "harbor", "island", "lagoon", "lantern",
  "meadow", "mesa", "orbit", "otter", "prism", "quartz", "ridge", "river",
  "signal", "summit", "thicket", "tundra", "vertex", "willow", "zenith",
];

const MAX_NAME_LENGTH = 60;

function pick(list: readonly string[]) {
  return list[Math.floor(Math.random() * list.length)];
}

export function generateProjectName() {
  return `${pick(ADJECTIVES)}-${pick(NOUNS)}`;
}

export function normalizeProjectName(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(0, MAX_NAME_LENGTH);
}
