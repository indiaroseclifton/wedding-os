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
    writing: "close, looking down at the pad on the desk",
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
