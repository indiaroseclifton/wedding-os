export const BLANCHE = {
  name: "Blanche",
  placeholder: true,
  age: 60,
  years: 40,
  place: "Atlanta",
  look: {
    ageReads: "Sixty. Fine lines. Not forty. Not eighty.",
    hair: "Silver-blonde bob, jaw length, side part",
    clothes:
      "Ivory silk blouse with a soft bow or a clean collar. Tailored moss-green jacket. Matching trousers when she stands. Small gold hoops. Thin gold chain. No costume pearls. No hat. No gloves.",
    prop: "Letter-size pad, 8.5 by 11, cream, faint ruling. Fountain pen. She writes while they talk. Not a pocket notebook.",
    style: "Illustrated gouache on cream paper. Editorial, not photoreal, not a cartoon Southern belle.",
  },
  portraits: {
    hero: "waist-up, pad in the left hand, pen in the right, looking past the couple",
    standing: "studio, mid-thigh up, pad against the forearm",
    writing: "close, looking down at the pad",
  },
  job: "She has married the couple, then their children, then a grandchild. She has seen church halls, tents, and hotel ballrooms. She does not gasp. She writes it down.",
  voice: [
    "We will start with what is already true. Not with Pinterest.",
    "Pretty is cheap. Timing is not.",
    "If you cannot say the number out loud, the number will run you.",
    "Do not book the band before the room.",
    "I have seen this fight. You will get through the list.",
  ],
  not: [
    "Not a cartoon Southern belle.",
    "Not a pep talk.",
    "Not a marketplace.",
    "Does not sell vendors.",
  ],
} as const;

export function blancheSays(line: string) {
  return { who: BLANCHE.name, line };
}

export function blancheLine(step: number, kind?: string | null) {
  if (step === 0) {
    if (kind === "mitzvah") return "I have done three generations in one family. Tell me whose day this is.";
    if (kind === "gala") return "A gala is a room and a reason. We will get both on paper.";
    return "Tell me what we are planning. Then we write down what is already true.";
  }
  const lines = [
    "",
    "Names first. The rest waits.",
    "A date is useful. It is not required to start.",
    "City is enough. The venue can come later.",
    "We do not restart work you already finished.",
    "The shape of the day hides the work you will not need.",
    "How people enter the room changes the hour. Skip if you do not know.",
    "Most people mix hire and make. Say the leaning.",
    "A guess is better than a fantasy list.",
    "If you cannot say the number out loud, the number will run you.",
    "A few pictures. Not the whole camera roll.",
    "A public board only. Secret will not show.",
    "Paste a share link. Viewer. Contracts stay out.",
    "One sentence. What is loud.",
  ];
  return lines[step] || BLANCHE.voice[0];
}
