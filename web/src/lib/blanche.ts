export const BLANCHE = {
  name: "Blanche",
  placeholder: true,
  age: 60,
  years: 40,
  place: "Atlanta",
  look: {
    hair: "Silver-blonde bob, just to the jaw, side part",
    clothes: "Ivory silk blouse, tailored moss jacket, small gold hoops, thin chain. No costume pearls.",
    prop: "Letter-size pad, 8.5 by 11, unlined or faint legal ruling. Fountain pen or sharp pencil. She writes while they talk.",
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
