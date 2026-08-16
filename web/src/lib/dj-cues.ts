export type CueSuggestion = { title: string; artist: string; note?: string };

export type CueDef = {
  id: string;
  label: string;
  act: "ceremony" | "cocktail" | "reception";
  when: string;
  hint: string;
  suggestions: CueSuggestion[];
};

export const DJ_CUES: CueDef[] = [
  {
    id: "prelude",
    label: "Prelude",
    act: "ceremony",
    when: "Guests arriving · 15–30 min",
    hint: "Soft, instrumental. Loopable. Volume under conversation.",
    suggestions: [
      { title: "Canon in D", artist: "Pachelbel", note: "Safe classic" },
      { title: "River Flows in You", artist: "Yiruma" },
      { title: "Holocene", artist: "Bon Iver", note: "Instrumental edit" },
    ],
  },
  {
    id: "family_seating",
    label: "Grandparents & parents seated",
    act: "ceremony",
    when: "Just before the party walks",
    hint: "Often the same song as prelude, or a short cue. Name who is walking.",
    suggestions: [
      { title: "What a Wonderful World", artist: "Louis Armstrong" },
      { title: "In My Life", artist: "The Beatles" },
    ],
  },
  {
    id: "party_processional",
    label: "Wedding party processional",
    act: "ceremony",
    when: "Bridesmaids, groomsmen, people of honor",
    hint: "Slightly brighter than prelude. Same energy the whole party walks to — don’t change mid-line.",
    suggestions: [
      { title: "Somewhere Over the Rainbow", artist: "Israel Kamakawiwoʻole" },
      { title: "You Are the Best Thing", artist: "Ray LaMontagne" },
      { title: "Lover (first verse instrumental)", artist: "Taylor Swift" },
    ],
  },
  {
    id: "kids_processional",
    label: "Flower girl / ring bearer",
    act: "ceremony",
    when: "After the party, before the couple",
    hint: "Short. Something they can actually walk to. Skip if no kids.",
    suggestions: [
      { title: "You've Got a Friend in Me", artist: "Randy Newman" },
      { title: "What a Wonderful World", artist: "Louis Armstrong" },
    ],
  },
  {
    id: "processional",
    label: "Partner / bride processional",
    act: "ceremony",
    when: "The last walk in",
    hint: "The one guests will remember. Tell the DJ the exact bar to hit when doors open.",
    suggestions: [
      { title: "Canon in D", artist: "Pachelbel" },
      { title: "A Thousand Years", artist: "Christina Perri" },
      { title: "Here Comes the Sun", artist: "The Beatles" },
      { title: "Can't Help Falling in Love", artist: "Elvis Presley", note: "Instrumental often better" },
    ],
  },
  {
    id: "unity",
    label: "Unity / signing / interlude",
    act: "ceremony",
    when: "Middle of the ceremony if you have a ritual",
    hint: "90 seconds to 3 minutes. Instrumental unless someone is singing live.",
    suggestions: [
      { title: "First Day of My Life", artist: "Bright Eyes" },
      { title: "Bloom", artist: "The Paper Kites" },
    ],
  },
  {
    id: "recessional",
    label: "Recessional",
    act: "ceremony",
    when: "You walk out",
    hint: "The first lift. Louder, smiling, guests clap over it.",
    suggestions: [
      { title: "Signed, Sealed, Delivered", artist: "Stevie Wonder" },
      { title: "Best Day of My Life", artist: "American Authors" },
      { title: "You Make My Dreams", artist: "Hall & Oates" },
      { title: "This Will Be (An Everlasting Love)", artist: "Natalie Cole" },
    ],
  },
  {
    id: "cocktail",
    label: "Cocktail hour",
    act: "cocktail",
    when: "Photos + drinks · 45–90 min",
    hint: "Background. Give a vibe (jazz, bossa, indie), not 40 titles. DJ reads the patio.",
    suggestions: [
      { title: "La vie en rose", artist: "Louis Armstrong" },
      { title: "Sunday Morning", artist: "Maroon 5" },
      { title: "Put Your Records On", artist: "Corinne Bailey Rae" },
    ],
  },
  {
    id: "grand_entrance",
    label: "Grand entrance",
    act: "reception",
    when: "You’re announced into dinner",
    hint: "High energy, 20–40 seconds. Write how you want to be announced.",
    suggestions: [
      { title: "Crazy in Love", artist: "Beyoncé" },
      { title: "I Gotta Feeling", artist: "Black Eyed Peas" },
      { title: "The Way You Make Me Feel", artist: "Michael Jackson" },
    ],
  },
  {
    id: "first_dance",
    label: "First dance",
    act: "reception",
    when: "Usually right after entrance or after dinner",
    hint: "Tell the DJ the fade point. Most couples want 90 seconds, not the full 4 minutes.",
    suggestions: [
      { title: "At Last", artist: "Etta James" },
      { title: "Thinking Out Loud", artist: "Ed Sheeran" },
      { title: "All of Me", artist: "John Legend" },
      { title: "Perfect", artist: "Ed Sheeran" },
      { title: "Can't Help Falling in Love", artist: "Elvis Presley" },
    ],
  },
  {
    id: "welcome_toasts",
    label: "Welcome & toasts",
    act: "reception",
    when: "Mic handed to parents / wedding party",
    hint: "Bed music very low or out. DJ needs the order of speakers.",
    suggestions: [{ title: "Soft instrumental bed", artist: "DJ chooses", note: "Or silence" }],
  },
  {
    id: "dinner",
    label: "Dinner",
    act: "reception",
    when: "Plates down",
    hint: "Conversation first. Genre note is enough (soul, jazz, 70s). No bangers.",
    suggestions: [
      { title: "Lovely Day", artist: "Bill Withers" },
      { title: "Harvest Moon", artist: "Neil Young" },
    ],
  },
  {
    id: "father_daughter",
    label: "Father–daughter (or parent A)",
    act: "reception",
    when: "Special dance",
    hint: "Name who is dancing. Personal > popular.",
    suggestions: [
      { title: "My Girl", artist: "The Temptations" },
      { title: "I Loved Her First", artist: "Heartland" },
      { title: "Landslide", artist: "Fleetwood Mac" },
    ],
  },
  {
    id: "mother_son",
    label: "Mother–son (or parent B)",
    act: "reception",
    when: "Special dance",
    hint: "Same as above. Skip the cue if you’re not doing it.",
    suggestions: [
      { title: "What a Wonderful World", artist: "Louis Armstrong" },
      { title: "Simple Man", artist: "Lynyrd Skynyrd" },
      { title: "The Times They Are A-Changin'", artist: "Bob Dylan" },
    ],
  },
  {
    id: "party_dance",
    label: "Wedding party dance",
    act: "reception",
    when: "Optional · after parents",
    hint: "Fun, short, everyone can move. Or skip.",
    suggestions: [
      { title: "September", artist: "Earth, Wind & Fire" },
      { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars" },
    ],
  },
  {
    id: "cake",
    label: "Cake cutting",
    act: "reception",
    when: "Usually mid-reception",
    hint: "20–40 seconds. DJ announces or you just walk over — say which.",
    suggestions: [
      { title: "How Sweet It Is", artist: "James Taylor" },
      { title: "Sugar", artist: "Maroon 5" },
    ],
  },
  {
    id: "open_dancing",
    label: "Open dancing",
    act: "reception",
    when: "The rest of the night",
    hint: "This is must-play + genres, not a 80-song prison. 15–20 musts. Trust the DJ after that.",
    suggestions: [
      { title: "September", artist: "Earth, Wind & Fire" },
      { title: "Don't Stop Believin'", artist: "Journey" },
      { title: "Mr. Brightside", artist: "The Killers" },
    ],
  },
  {
    id: "last_dance",
    label: "Last dance",
    act: "reception",
    when: "Lights up after this",
    hint: "Slow and close, or one last shout. Tell the DJ the hard end time.",
    suggestions: [
      { title: "At Last", artist: "Etta James" },
      { title: "Closing Time", artist: "Semisonic" },
      { title: "Don't Stop Believin'", artist: "Journey" },
      { title: "Sweet Caroline", artist: "Neil Diamond" },
    ],
  },
  {
    id: "sendoff",
    label: "Send-off",
    act: "reception",
    when: "Sparklers / petals / cars",
    hint: "Walk-out energy. Often the same as recessional.",
    suggestions: [
      { title: "Signed, Sealed, Delivered", artist: "Stevie Wonder" },
      { title: "Home", artist: "Edward Sharpe" },
    ],
  },
];

export const DJ_BANNED_STARTERS = [
  "Cha Cha Slide",
  "YMCA",
  "Macarena",
  "Chicken Dance",
  "The Cupid Shuffle",
];

export type MusicCue = {
  id: string;
  song?: string;
  who?: string;
  notes?: string;
  skip?: boolean;
  energy?: number;
};

export function mergeCues(saved: MusicCue[] | { label: string; song?: string }[] | undefined): MusicCue[] {
  const byId = new Map<string, MusicCue>();
  for (const row of saved || []) {
    if ("id" in row && row.id) byId.set(row.id, row as MusicCue);
    else if ("label" in row) {
      const match = DJ_CUES.find((c) => c.label === row.label);
      if (match) byId.set(match.id, { id: match.id, song: row.song });
    }
  }
  return DJ_CUES.map((def) => byId.get(def.id) || { id: def.id });
}

export function cuesAsHandoff(cues: MusicCue[]) {
  return DJ_CUES.map((def) => {
    const row = cues.find((c) => c.id === def.id);
    if (row?.skip) return `${def.label}: — skip`;
    const song = row?.song?.trim();
    if (!song) return `${def.label}: (not set)`;
    const extra = [row?.who, row?.notes].filter(Boolean).join(" · ");
    return extra ? `${def.label}: ${song} (${extra})` : `${def.label}: ${song}`;
  }).join("\n");
}
