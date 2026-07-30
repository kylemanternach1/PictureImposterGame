function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function pickMany<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const SETTINGS = [
  "a flooded antique mall",
  "a zero-gravity cathedral",
  "a neon-lit swamp inside a snow globe",
  "a subway station on the moon",
  "a medieval castle built inside a whale",
  "a laundromat in the middle of a jungle",
  "a courtroom made entirely of cake",
  "a desert oasis that is also a bowling alley",
  "a skyscraper rooftop during a jellyfish storm",
  "a grocery store aisle floating in outer space",
  "a pirate ship docked in a school cafeteria",
  "a volcano crater turned into a mini golf course",
  "a library where the shelves are waterfalls",
  "a carnival inside an aquarium",
  "a highway running through someone's living room",
];

const SUBJECTS = [
  "a mariachi band of raccoons",
  "three confused wizards on roller skates",
  "a business-casual octopus",
  "a knight in shining armor made of tin foil",
  "a grandma driving a monster truck",
  "a T-rex wearing reading glasses",
  "a squad of pigeons in hazmat suits",
  "a breakdancing scarecrow",
  "a detective duck with a magnifying glass",
  "a robot chef juggling flaming spatulas",
  "a capybara in a crown",
  "a mime trapped in an invisible box",
  "a sasquatch doing taxes",
  "a flamingo on stilts",
  "a sentient vending machine",
];

const ACTIONS = [
  "hosting a chaotic cooking competition",
  "trying to lasso a runaway hot air balloon",
  "conducting an orchestra of squeaky toys",
  "building a staircase out of watermelons",
  "arguing with a talking lamppost",
  "filming a nature documentary about office chairs",
  "attempting to parallel park a submarine",
  "selling tickets to a tornado",
  "teaching yoga to startled chickens",
  "painting portraits of startled tourists",
  "launching fireworks made of spaghetti",
  "racing shopping carts down a waterfall",
  "negotiating peace with a gang of geese",
  "installing a chandelier in a tree",
  "filming a commercial for invisible soup",
];

const CHAOS_OBJECTS = [
  "giant rubber ducks",
  "a waterfall of cereal",
  "floating grand pianos",
  "a carousel made of bicycles",
  "dozens of mismatched umbrellas",
  "a tornado of neckties",
  "oversized chess pieces",
  "a fountain spewing soda",
  "a train made of bread loaves",
  "hundreds of glowing jellybeans",
  "a chandelier made of fish",
  "towering stacks of pancakes",
  "a UFO towing a school bus",
  "an inflatable T-rex",
  "a parade of garden gnomes",
  "a whale-shaped blimp",
  "cascading mannequin limbs",
  "a Ferris wheel made of donuts",
];

const BACKGROUND_EVENTS = [
  "while meteors made of cupcakes streak across the sky",
  "as a marching band of crabs storms through the scene",
  "while a second sun made of cheese rises in the background",
  "as a dragon sneezes confetti onto everyone",
  "while a submarine surfaces through the floor",
  "as a flock of lawn flamingos takes flight",
  "while a giant hand reaches down holding a teacup",
  "as lightning bolts shaped like question marks strike nearby",
  "while a parade float shaped like a shoe rolls by",
  "as fish rain from the ceiling in slow motion",
  "while a tornado of playing cards swirls in the distance",
  "as a hot air balloon shaped like a toaster lifts off",
];

const FOREGROUND_DETAILS = [
  "In the foreground, a startled tourist takes a selfie.",
  "A cat in a tuxedo judges the chaos from a velvet throne.",
  "Someone is slip-n-sliding on a trail of marinara sauce.",
  "A clown on a unicycle juggles alarm clocks.",
  "A sign reads 'ABSOLUTELY NOTHING WEIRD HAPPENING HERE.'",
  "A banana peel the size of a car blocks the path.",
  "A group of squirrels holds a protest with tiny signs.",
  "A mailbox is sprouting flowers and tiny wings.",
  "A mannequin wears a scuba suit and holds a briefcase.",
  "A piñata shaped like a planet leaks glitter everywhere.",
];

const STYLE_MODIFIERS = [
  "Maximalist composition packed with unrelated objects and characters.",
  "Crowded surreal scene with many tiny details to discover.",
  "Chaotic storybook illustration energy, absurd and playful.",
  "Dense visual clutter, every corner has something bizarre happening.",
  "Like a fever dream directed by a children's book illustrator.",
];

export interface ScenePrompt {
  /** Shown to players after the round — the story seed. */
  sceneDescription: string;
  /** Full prompt sent to the image model. */
  imagePrompt: string;
  negativePrompt: string;
  /** 3–4 words/phrases from the scene for imposter hints. */
  imposterHints: string[];
}

export function buildChaoticScenePrompt(): ScenePrompt {
  const setting = pick(SETTINGS);
  const subject = pick(SUBJECTS);
  const action = pick(ACTIONS);
  const objects = pickMany(CHAOS_OBJECTS, 3);
  const backgroundEvent = pick(BACKGROUND_EVENTS);
  const foregroundDetail = pick(FOREGROUND_DETAILS);
  const style = pick(STYLE_MODIFIERS);

  const sceneDescription = [
    `In ${setting}, ${subject} is ${action},`,
    `surrounded by ${objects[0]}, ${objects[1]}, and ${objects[2]},`,
    backgroundEvent + ".",
    foregroundDetail,
  ].join(" ");

  const imagePrompt = [
    sceneDescription,
    style,
    "Ultra-detailed, vibrant saturated colors, wide cinematic shot,",
    "dozens of distinct visual elements, impossible physics, humorous absurdity,",
    "busy foreground and background, nothing calm or minimal,",
    "surreal art, story-rich scene with many things happening at once.",
  ].join(" ");

  const negativePrompt = [
    "boring, plain, minimal, empty, simple, serene, calm, generic, stock photo,",
    "bland, single subject, muted colors, monochrome, peaceful, tidy, symmetrical,",
    "corporate, sterile, realistic portrait, empty background, low detail,",
    "blurry, watermark, text, logo, frame, border.",
  ].join(" ");

  const imposterHints = buildImposterHints(setting, subject, action, objects, backgroundEvent);

  return { sceneDescription, imagePrompt, negativePrompt, imposterHints };
}

function buildImposterHints(
  setting: string,
  subject: string,
  action: string,
  objects: string[],
  backgroundEvent: string,
): string[] {
  const candidates = [
    phraseToHint(setting),
    phraseToHint(subject),
    phraseToHint(action),
    ...objects.map(phraseToHint),
    phraseToHint(backgroundEvent),
  ].filter((hint) => hint.length >= 3);

  const unique = [...new Set(candidates)];
  const hintCount = Math.min(unique.length, 3 + Math.floor(Math.random() * 2));
  return shuffle(unique).slice(0, hintCount);
}

function phraseToHint(phrase: string): string {
  let cleaned = phrase
    .replace(/^in /i, "")
    .replace(/^while /i, "")
    .replace(/^as /i, "")
    .replace(/^a |^an |^the /i, "")
    .replace(/\.$/, "")
    .trim();

  const ofMatch = cleaned.match(/\bof (.+)$/i);
  if (ofMatch?.[1]) {
    cleaned = ofMatch[1];
  }

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length > 4) {
    cleaned = words.slice(-4).join(" ");
  }

  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function buildPlaceholderSeed(sceneDescription: string): string {
  return encodeURIComponent(sceneDescription.slice(0, 60));
}
