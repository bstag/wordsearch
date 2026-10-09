import { generatePuzzle, seededRandom, GeneratedPuzzle, GeneratorConfig } from './generator';
import type { Level } from './levels';

// Pre-made themed puzzles. Each one gets its own static, indexable page at
// /puzzles/<slug>. The seed fixes the grid so the build-time HTML matches what
// the browser hydrates; "New Grid" in the UI reshuffles with Math.random.

export interface ThemedPuzzle {
  slug: string;
  title: string;
  category: string;
  // Shown on the page and used as the meta description. Keep each one unique.
  description: string;
  words: string[];
  // Grid for Easy and Medium; Hard adds HARD_EXTRA_SIZE.
  width: number;
  height: number;
  seed: number;
  // Level shown first. Defaults to Medium; early-reader themes start on Easy.
  defaultLevel?: Level;
}

export const THEMED_PUZZLES: ThemedPuzzle[] = [
  // Animals & Nature
  {
    slug: 'animals',
    title: 'Animals',
    category: 'Animals & Nature',
    description: 'A friendly word search packed with animals from the savanna, the farm, and the backyard. A great warm-up puzzle for kids and early readers.',
    words: ['LION', 'TIGER', 'ELEPHANT', 'GIRAFFE', 'ZEBRA', 'MONKEY', 'PANDA', 'KANGAROO', 'RABBIT', 'TURTLE', 'WOLF', 'FOX', 'DEER', 'HORSE', 'OWL'],
    width: 14, height: 14, seed: 1001,
  },
  {
    slug: 'ocean-animals',
    title: 'Ocean Animals',
    category: 'Animals & Nature',
    description: 'Dive under the waves and hunt for sea creatures, from tiny seahorses to giant whales. Perfect for a marine biology lesson or a beach-day activity.',
    words: ['WHALE', 'DOLPHIN', 'SHARK', 'OCTOPUS', 'SQUID', 'JELLYFISH', 'SEAHORSE', 'STARFISH', 'CRAB', 'LOBSTER', 'TURTLE', 'SEAL', 'CORAL', 'EEL', 'CLAM'],
    width: 14, height: 14, seed: 1002,
  },
  {
    slug: 'birds',
    title: 'Birds',
    category: 'Animals & Nature',
    description: 'Search for songbirds, birds of prey, and waterfowl hidden in the grid. A fun companion to a backyard bird-watching walk.',
    words: ['EAGLE', 'HAWK', 'OWL', 'ROBIN', 'SPARROW', 'CARDINAL', 'BLUEJAY', 'PARROT', 'PENGUIN', 'FLAMINGO', 'PELICAN', 'HERON', 'FALCON', 'SWAN', 'WREN'],
    width: 14, height: 14, seed: 1003,
  },
  {
    slug: 'insects-and-bugs',
    title: 'Insects and Bugs',
    category: 'Animals & Nature',
    description: 'Creepy, crawly, and buzzing: find the beetles, butterflies, and bugs tucked into this grid. Great for a science unit on insects.',
    words: ['ANT', 'BEE', 'BEETLE', 'BUTTERFLY', 'MOTH', 'LADYBUG', 'CRICKET', 'GRASSHOPPER', 'DRAGONFLY', 'FIREFLY', 'MOSQUITO', 'WASP', 'TERMITE', 'SPIDER', 'CATERPILLAR'],
    width: 15, height: 15, seed: 1004,
  },
  {
    slug: 'weather',
    title: 'Weather',
    category: 'Animals & Nature',
    description: 'Sunshine, storms, and everything in between. Find the weather words in this puzzle, ideal for an elementary earth science lesson.',
    words: ['SUNNY', 'CLOUDY', 'RAIN', 'SNOW', 'WIND', 'STORM', 'THUNDER', 'LIGHTNING', 'TORNADO', 'HURRICANE', 'FOG', 'HAIL', 'SLEET', 'RAINBOW', 'FORECAST'],
    width: 14, height: 14, seed: 1005,
  },

  // Science & School
  {
    slug: 'solar-system',
    title: 'Solar System',
    category: 'Science & School',
    description: 'Blast off and find the planets, moons, and space words hidden in this astronomy word search. A handy review for a solar system unit.',
    words: ['SUN', 'MERCURY', 'VENUS', 'EARTH', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE', 'MOON', 'COMET', 'ASTEROID', 'GALAXY', 'ORBIT', 'GRAVITY'],
    width: 14, height: 14, seed: 2001,
  },
  {
    slug: 'human-body',
    title: 'Human Body',
    category: 'Science & School',
    description: 'Find the organs, bones, and body systems in this anatomy word search. Useful for health class or a biology vocabulary review.',
    words: ['HEART', 'LUNGS', 'BRAIN', 'LIVER', 'KIDNEY', 'STOMACH', 'SKELETON', 'MUSCLE', 'SKIN', 'BLOOD', 'NERVE', 'SPINE', 'RIBS', 'SKULL', 'TENDON'],
    width: 14, height: 14, seed: 2002,
  },
  {
    slug: 'chemistry',
    title: 'Chemistry',
    category: 'Science & School',
    description: 'Atoms, elements, and reactions: a chemistry vocabulary word search for middle and high school science classes.',
    words: ['ATOM', 'MOLECULE', 'ELEMENT', 'COMPOUND', 'PROTON', 'NEUTRON', 'ELECTRON', 'ACID', 'BASE', 'REACTION', 'CATALYST', 'ISOTOPE', 'OXYGEN', 'CARBON', 'HYDROGEN'],
    width: 15, height: 15, seed: 2003,
  },
  {
    slug: 'math-vocabulary',
    title: 'Math Vocabulary',
    category: 'Science & School',
    description: 'Practice key math terms by finding them in the grid, from addition to geometry. A low-pressure way to reinforce vocabulary.',
    words: ['ADDITION', 'SUBTRACT', 'MULTIPLY', 'DIVIDE', 'FRACTION', 'DECIMAL', 'PERCENT', 'ANGLE', 'TRIANGLE', 'CIRCLE', 'EQUATION', 'GRAPH', 'AREA', 'VOLUME', 'INTEGER'],
    width: 14, height: 14, seed: 2004,
  },
  {
    slug: 'back-to-school',
    title: 'Back to School',
    category: 'Science & School',
    description: 'Get ready for the first day with this school supplies and classroom word search. An easy ice-breaker for the start of the year.',
    words: ['PENCIL', 'ERASER', 'RULER', 'NOTEBOOK', 'BACKPACK', 'CRAYON', 'GLUE', 'SCISSORS', 'TEACHER', 'STUDENT', 'DESK', 'LIBRARY', 'RECESS', 'LUNCH', 'HOMEWORK'],
    width: 14, height: 14, seed: 2005,
  },
  {
    slug: 'us-states',
    title: 'U.S. States',
    category: 'Geography & History',
    description: 'Search for fifteen U.S. states in this geography word search. A fun way to practice state names and spelling.',
    words: ['TEXAS', 'ALASKA', 'FLORIDA', 'OHIO', 'MAINE', 'IOWA', 'UTAH', 'NEVADA', 'GEORGIA', 'OREGON', 'MONTANA', 'KANSAS', 'VERMONT', 'IDAHO', 'ARIZONA'],
    width: 14, height: 14, seed: 2006,
  },

  // Food
  {
    slug: 'fruits',
    title: 'Fruits',
    category: 'Food',
    description: 'A colorful fruit word search with apples, berries, and tropical favorites. Pairs nicely with a healthy-eating lesson.',
    words: ['APPLE', 'BANANA', 'ORANGE', 'GRAPE', 'LEMON', 'PEACH', 'PEAR', 'CHERRY', 'STRAWBERRY', 'BLUEBERRY', 'MANGO', 'PINEAPPLE', 'KIWI', 'WATERMELON', 'PLUM'],
    width: 14, height: 14, seed: 3001,
  },
  {
    slug: 'vegetables',
    title: 'Vegetables',
    category: 'Food',
    description: 'Find carrots, broccoli, and the rest of the veggie patch in this garden-themed word search.',
    words: ['CARROT', 'POTATO', 'TOMATO', 'ONION', 'PEPPER', 'CORN', 'PEAS', 'BROCCOLI', 'SPINACH', 'LETTUCE', 'CUCUMBER', 'PUMPKIN', 'CELERY', 'GARLIC', 'BEET'],
    width: 14, height: 14, seed: 3002,
  },
  {
    slug: 'desserts',
    title: 'Desserts',
    category: 'Food',
    description: 'A sweet puzzle full of cakes, cookies, and treats. Find every dessert hiding in the grid.',
    words: ['CAKE', 'COOKIE', 'BROWNIE', 'CUPCAKE', 'PIE', 'DONUT', 'PUDDING', 'FUDGE', 'CANDY', 'SUNDAE', 'CHEESECAKE', 'MUFFIN', 'TART', 'COBBLER', 'SORBET'],
    width: 14, height: 14, seed: 3003,
  },
  {
    slug: 'bbq',
    title: 'BBQ',
    category: 'Food',
    description: 'Fire up the smoker. This barbecue word search covers the meats, woods, and sides that make a great cookout.',
    words: ['BRISKET', 'RIBS', 'SAUSAGE', 'GRILL', 'CHARCOAL', 'HICKORY', 'MESQUITE', 'SAUCE', 'COLESLAW', 'CORNBREAD', 'PITMASTER', 'MARINADE', 'SMOKER', 'STEAK', 'WINGS'],
    width: 14, height: 14, seed: 3004,
  },

  // Holidays & Seasons
  {
    slug: 'christmas',
    title: 'Christmas',
    category: 'Holidays & Seasons',
    description: 'Deck the halls with this festive Christmas word search full of ornaments, reindeer, and holiday cheer. Great for classroom parties.',
    words: ['SANTA', 'REINDEER', 'SLEIGH', 'ELF', 'ORNAMENT', 'STOCKING', 'WREATH', 'CANDYCANE', 'GIFT', 'SNOWMAN', 'TINSEL', 'CAROL', 'MISTLETOE', 'CHIMNEY', 'STAR'],
    width: 14, height: 14, seed: 4001,
  },
  {
    slug: 'halloween',
    title: 'Halloween',
    category: 'Holidays & Seasons',
    description: 'Spooky words lurk in this Halloween word search: ghosts, pumpkins, and plenty of candy. A not-too-scary activity for all ages.',
    words: ['PUMPKIN', 'GHOST', 'WITCH', 'BROOM', 'CANDY', 'COSTUME', 'SKELETON', 'BAT', 'SPIDER', 'CAULDRON', 'MUMMY', 'ZOMBIE', 'MOONLIGHT', 'HAUNTED', 'LANTERN'],
    width: 14, height: 14, seed: 4002,
  },
  {
    slug: 'thanksgiving',
    title: 'Thanksgiving',
    category: 'Holidays & Seasons',
    description: 'Gather around the table with this Thanksgiving word search featuring turkey, pie, and words of gratitude.',
    words: ['TURKEY', 'STUFFING', 'GRAVY', 'PIE', 'CRANBERRY', 'HARVEST', 'FAMILY', 'GRATITUDE', 'FEAST', 'PILGRIM', 'CORNUCOPIA', 'AUTUMN', 'YAMS', 'PARADE', 'THANKFUL'],
    width: 15, height: 15, seed: 4003,
  },
  {
    slug: 'easter',
    title: 'Easter',
    category: 'Holidays & Seasons',
    description: 'Hop into spring with an Easter word search full of eggs, bunnies, and baskets.',
    words: ['BUNNY', 'EGG', 'BASKET', 'CHICK', 'LILY', 'SPRING', 'HUNT', 'CANDY', 'JELLYBEAN', 'BONNET', 'TULIP', 'PASTEL', 'SUNRISE', 'LAMB', 'BLOOM'],
    width: 14, height: 14, seed: 4004,
  },
  {
    slug: 'summer',
    title: 'Summer',
    category: 'Holidays & Seasons',
    description: 'Beach days, popsicles, and campfires. Find the summertime words in this sunny word search.',
    words: ['BEACH', 'SUNSHINE', 'VACATION', 'SWIMMING', 'POPSICLE', 'SANDCASTLE', 'SUNSCREEN', 'CAMPING', 'PICNIC', 'FIREWORKS', 'SURFING', 'LEMONADE', 'HAMMOCK', 'WAVES', 'SANDALS'],
    width: 15, height: 15, seed: 4005,
  },
  {
    slug: 'winter',
    title: 'Winter',
    category: 'Holidays & Seasons',
    description: 'Bundle up and find the snowy words in this winter word search, from mittens to snowflakes.',
    words: ['SNOWFLAKE', 'MITTENS', 'SCARF', 'SLED', 'ICICLE', 'BLIZZARD', 'FIREPLACE', 'COCOA', 'IGLOO', 'SKATING', 'SKIING', 'FROST', 'SNOWBALL', 'BOOTS', 'BLANKET'],
    width: 14, height: 14, seed: 4006,
  },

  // Sports & Hobbies
  {
    slug: 'sports',
    title: 'Sports',
    category: 'Sports & Hobbies',
    description: 'From soccer to swimming, find the sports hidden in this athletic word search.',
    words: ['SOCCER', 'BASKETBALL', 'BASEBALL', 'FOOTBALL', 'TENNIS', 'GOLF', 'HOCKEY', 'VOLLEYBALL', 'RUGBY', 'SWIMMING', 'BOXING', 'ARCHERY', 'BOWLING', 'CYCLING', 'KARATE'],
    width: 15, height: 15, seed: 5001,
  },
  {
    slug: 'music',
    title: 'Music',
    category: 'Sports & Hobbies',
    description: 'Tune in to this music word search with instruments, notes, and musical terms. A good fit for music class.',
    words: ['PIANO', 'GUITAR', 'VIOLIN', 'DRUMS', 'TRUMPET', 'FLUTE', 'CELLO', 'TUBA', 'MELODY', 'RHYTHM', 'TEMPO', 'CHORD', 'HARMONY', 'ORCHESTRA', 'CONDUCTOR'],
    width: 14, height: 14, seed: 5002,
  },
  {
    slug: 'camping',
    title: 'Camping',
    category: 'Sports & Hobbies',
    description: 'Pitch a tent and find the outdoor gear and campfire words in this camping word search.',
    words: ['TENT', 'CAMPFIRE', 'LANTERN', 'COMPASS', 'BACKPACK', 'HIKING', 'TRAIL', 'MARSHMALLOW', 'CANOE', 'FLASHLIGHT', 'FOREST', 'CABIN', 'MAP', 'SLEEPINGBAG', 'KINDLING'],
    width: 15, height: 15, seed: 5003,
  },

  // Faith
  {
    slug: 'bible',
    title: 'Bible Words',
    category: 'Faith',
    description: 'A Bible word search for Sunday school, youth group, or family devotions, featuring key words of faith.',
    words: ['JESUS', 'BIBLE', 'FAITH', 'HOPE', 'LOVE', 'PRAYER', 'GRACE', 'MERCY', 'GOSPEL', 'DISCIPLE', 'PSALM', 'PROPHET', 'WORSHIP', 'BLESSING', 'SALVATION'],
    width: 14, height: 14, seed: 6001,
  },
  {
    slug: 'old-testament-books',
    title: 'Books of the Old Testament',
    category: 'Faith',
    description: 'Find fifteen books of the Old Testament, from Genesis to Jonah. A helpful way to learn the books of the Bible in Sunday school.',
    words: ['GENESIS', 'EXODUS', 'LEVITICUS', 'NUMBERS', 'DEUTERONOMY', 'JOSHUA', 'JUDGES', 'RUTH', 'PSALMS', 'PROVERBS', 'ISAIAH', 'JEREMIAH', 'DANIEL', 'JONAH', 'ESTHER'],
    width: 14, height: 14, seed: 6002,
  },
  {
    slug: 'new-testament-books',
    title: 'Books of the New Testament',
    category: 'Faith',
    description: 'Search for fifteen New Testament books, from the Gospels through Revelation. Pairs well with a Bible memory drill.',
    words: ['MATTHEW', 'MARK', 'LUKE', 'JOHN', 'ACTS', 'ROMANS', 'GALATIANS', 'EPHESIANS', 'PHILIPPIANS', 'COLOSSIANS', 'HEBREWS', 'JAMES', 'PETER', 'JUDE', 'REVELATION'],
    width: 14, height: 14, seed: 6003,
  },

  // Reading & Spelling (Dolch sight word lists)
  {
    slug: 'kindergarten-sight-words',
    title: 'Kindergarten Sight Words',
    category: 'Reading & Spelling',
    description: 'Practice high-frequency kindergarten sight words from the Dolch primer list. Start on Easy, where every word reads left to right or top to bottom.',
    words: ['BLACK', 'BROWN', 'CAME', 'FOUR', 'GOOD', 'HAVE', 'LIKE', 'PLEASE', 'PRETTY', 'RIDE', 'SAID', 'SOON', 'THERE', 'WANT', 'WHITE'],
    width: 12, height: 12, seed: 7001, defaultLevel: 'easy',
  },
  {
    slug: 'first-grade-sight-words',
    title: 'First Grade Sight Words',
    category: 'Reading & Spelling',
    description: 'A sight word search built from the Dolch first grade list. Spotting each word in the grid builds the quick recognition new readers need.',
    words: ['AFTER', 'AGAIN', 'COULD', 'EVERY', 'FROM', 'GIVE', 'GOING', 'KNOW', 'ONCE', 'OPEN', 'OVER', 'ROUND', 'THANK', 'THINK', 'WALK'],
    width: 12, height: 12, seed: 7002, defaultLevel: 'easy',
  },
  {
    slug: 'second-grade-sight-words',
    title: 'Second Grade Sight Words',
    category: 'Reading & Spelling',
    description: 'Second grade Dolch sight words in a word search. These tricky, often-misspelled words show up in nearly every sentence kids read.',
    words: ['ALWAYS', 'AROUND', 'BECAUSE', 'BEFORE', 'FIRST', 'FOUND', 'PULL', 'RIGHT', 'SLEEP', 'THESE', 'THOSE', 'WHICH', 'WOULD', 'WRITE', 'YOUR'],
    width: 12, height: 12, seed: 7003, defaultLevel: 'easy',
  },

  // Geography & History
  {
    slug: 'countries',
    title: 'Countries of the World',
    category: 'Geography & History',
    description: 'Travel the globe in this geography word search with countries from every inhabited continent. Try finding each one on a map afterward.',
    words: ['CANADA', 'MEXICO', 'BRAZIL', 'PERU', 'FRANCE', 'GERMANY', 'ITALY', 'SPAIN', 'NORWAY', 'EGYPT', 'KENYA', 'INDIA', 'CHINA', 'JAPAN', 'AUSTRALIA'],
    width: 14, height: 14, seed: 8001,
  },
  {
    slug: 'continents-and-oceans',
    title: 'Continents and Oceans',
    category: 'Geography & History',
    description: 'All seven continents and five oceans in one geography word search, a quick review for early world geography lessons.',
    words: ['AFRICA', 'ASIA', 'EUROPE', 'ANTARCTICA', 'AUSTRALIA', 'NORTHAMERICA', 'SOUTHAMERICA', 'PACIFIC', 'ATLANTIC', 'INDIAN', 'ARCTIC', 'SOUTHERN', 'EQUATOR', 'GLOBE', 'HEMISPHERE'],
    width: 14, height: 14, seed: 8002,
  },
  {
    slug: 'us-presidents',
    title: 'U.S. Presidents',
    category: 'Geography & History',
    description: 'Find the last names of fifteen U.S. presidents, from Washington to Reagan. A good companion to a Presidents Day or civics lesson.',
    words: ['WASHINGTON', 'ADAMS', 'JEFFERSON', 'MADISON', 'MONROE', 'JACKSON', 'LINCOLN', 'GRANT', 'ROOSEVELT', 'WILSON', 'HOOVER', 'TRUMAN', 'EISENHOWER', 'KENNEDY', 'REAGAN'],
    width: 15, height: 15, seed: 8003,
  },

  // More Science & School
  {
    slug: 'periodic-table-elements',
    title: 'Periodic Table Elements',
    category: 'Science & School',
    description: 'Search for fifteen of the first twenty elements on the periodic table, from hydrogen to calcium. Handy for memorizing element names.',
    words: ['HYDROGEN', 'HELIUM', 'LITHIUM', 'BORON', 'CARBON', 'NITROGEN', 'OXYGEN', 'NEON', 'SODIUM', 'MAGNESIUM', 'SILICON', 'SULFUR', 'CHLORINE', 'ARGON', 'CALCIUM'],
    width: 14, height: 14, seed: 2007,
  },
  {
    slug: 'community-helpers',
    title: 'Community Helpers',
    category: 'Science & School',
    description: 'Doctors, firefighters, librarians, and more: a community helpers word search for preschool and early elementary social studies.',
    words: ['DOCTOR', 'NURSE', 'FIREFIGHTER', 'POLICE', 'TEACHER', 'FARMER', 'MAILCARRIER', 'DENTIST', 'LIBRARIAN', 'BAKER', 'PILOT', 'CHEF', 'VETERINARIAN', 'MECHANIC', 'PLUMBER'],
    width: 14, height: 14, seed: 2008,
  },

  // More Animals & Nature
  {
    slug: 'dinosaurs',
    title: 'Dinosaurs',
    category: 'Animals & Nature',
    description: 'Dig up famous dinosaurs and fossil words in this prehistoric word search. Long names like Tyrannosaurus make it a real challenge on Hard.',
    words: ['TYRANNOSAURUS', 'TRICERATOPS', 'STEGOSAURUS', 'VELOCIRAPTOR', 'BRACHIOSAURUS', 'ANKYLOSAURUS', 'DIPLODOCUS', 'SPINOSAURUS', 'ALLOSAURUS', 'PTERODACTYL', 'FOSSIL', 'JURASSIC', 'CRETACEOUS', 'EXTINCT', 'PALEONTOLOGIST'],
    width: 15, height: 15, seed: 1006,
  },

  // More Holidays & Seasons
  {
    slug: 'valentines-day',
    title: "Valentine's Day",
    category: 'Holidays & Seasons',
    description: "Hearts, roses, and chocolate fill this Valentine's Day word search. A sweet classroom party activity or card-making break.",
    words: ['HEART', 'CUPID', 'ROSES', 'CHOCOLATE', 'CARD', 'HUGS', 'KISSES', 'VALENTINE', 'ARROW', 'SWEETHEART', 'FRIENDSHIP', 'CANDY', 'RIBBON', 'LACE', 'ADMIRER'],
    width: 14, height: 14, seed: 4007,
  },
  {
    slug: 'st-patricks-day',
    title: "St. Patrick's Day",
    category: 'Holidays & Seasons',
    description: "Look for shamrocks, rainbows, and pots of gold in this St. Patrick's Day word search. No luck required.",
    words: ['SHAMROCK', 'CLOVER', 'LEPRECHAUN', 'RAINBOW', 'GOLD', 'IRELAND', 'PARADE', 'GREEN', 'LUCKY', 'HARP', 'CELTIC', 'COINS', 'MARCH', 'BLARNEY', 'IRISH'],
    width: 14, height: 14, seed: 4008,
  },
  {
    slug: 'fourth-of-july',
    title: 'Fourth of July',
    category: 'Holidays & Seasons',
    description: 'Celebrate Independence Day with fireworks, flags, and freedom in this patriotic Fourth of July word search.',
    words: ['FIREWORKS', 'FLAG', 'LIBERTY', 'FREEDOM', 'PARADE', 'PICNIC', 'SPARKLER', 'INDEPENDENCE', 'PATRIOT', 'EAGLE', 'AMERICA', 'BARBECUE', 'STARS', 'STRIPES', 'ANTHEM'],
    width: 14, height: 14, seed: 4009,
  },
];

export function getThemedPuzzle(slug: string): ThemedPuzzle | undefined {
  return THEMED_PUZZLES.find(p => p.slug === slug);
}

export function getCategories(): { name: string; puzzles: ThemedPuzzle[] }[] {
  const byCategory = new Map<string, ThemedPuzzle[]>();
  for (const puzzle of THEMED_PUZZLES) {
    const list = byCategory.get(puzzle.category) ?? [];
    list.push(puzzle);
    byCategory.set(puzzle.category, list);
  }
  return [...byCategory].map(([name, puzzles]) => ({ name, puzzles }));
}

const HARD_EXTRA_SIZE = 3;

export function levelConfig(theme: ThemedPuzzle, level: Level): GeneratorConfig {
  const base = { words: theme.words, width: theme.width, height: theme.height };
  switch (level) {
    case 'easy':
      return { ...base, allowDiagonals: false, allowBackwards: false, difficulty: 0 };
    case 'medium':
      return { ...base, allowDiagonals: true, allowBackwards: false, difficulty: 3 };
    case 'hard':
      return {
        ...base,
        width: theme.width + HARD_EXTRA_SIZE,
        height: theme.height + HARD_EXTRA_SIZE,
        allowDiagonals: true,
        allowBackwards: true,
        difficulty: 7,
      };
  }
}

const LEVEL_SEED_OFFSET: Record<Level, number> = { easy: 0, medium: 100_000, hard: 200_000 };
const MAX_SEED_TRIES = 50;

// The grid a theme's page renders at build time. Walks successive seeds until
// every word fits, so a crowded Easy grid never silently drops a word, and
// fails the build if none do.
export function buildThemedPuzzle(theme: ThemedPuzzle, level: Level): GeneratedPuzzle {
  const config = levelConfig(theme, level);
  for (let i = 0; i < MAX_SEED_TRIES; i++) {
    const puzzle = generatePuzzle(config, seededRandom(theme.seed + LEVEL_SEED_OFFSET[level] + i * 7919));
    if (puzzle.placedWords.length === theme.words.length) return puzzle;
  }
  throw new Error(`Theme "${theme.slug}" (${level}) could not place every word; enlarge its grid.`);
}

export function buildAllLevels(theme: ThemedPuzzle): Record<Level, GeneratedPuzzle> {
  return {
    easy: buildThemedPuzzle(theme, 'easy'),
    medium: buildThemedPuzzle(theme, 'medium'),
    hard: buildThemedPuzzle(theme, 'hard'),
  };
}

// Seasonal pick for the homepage. Chosen at build time, so it rolls over on
// the next deploy after the month changes.
const FEATURED_BY_MONTH = [
  'winter', 'valentines-day', 'st-patricks-day', 'easter', 'insects-and-bugs', 'summer',
  'fourth-of-july', 'summer', 'back-to-school', 'halloween', 'thanksgiving', 'christmas',
];

export function getFeaturedPuzzle(date = new Date()): ThemedPuzzle {
  return getThemedPuzzle(FEATURED_BY_MONTH[date.getMonth()]) ?? THEMED_PUZZLES[0];
}

// Everything the client player needs for one theme, built at build time.
export function themedPlayerProps(theme: ThemedPuzzle) {
  return {
    title: `${theme.title} Word Search`,
    configs: {
      easy: levelConfig(theme, 'easy'),
      medium: levelConfig(theme, 'medium'),
      hard: levelConfig(theme, 'hard'),
    },
    initialPuzzles: buildAllLevels(theme),
    defaultLevel: theme.defaultLevel ?? ('medium' as Level),
  };
}
