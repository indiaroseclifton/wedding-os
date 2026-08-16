export const HANDOFF_SECTION_LABELS: Record<string, string> = {
  date_locations: "Wedding date & locations",
  timeline_notes: "Timeline notes",
  key_contacts: "Key contacts",
  special_notes: "Special notes",
  vendor_list: "Vendor list",
  seating_rosters: "Seating rosters",
  dietary_by_table: "Dietary by table",
  must_play: "Must-play list",
  do_not_play: "Do-not-play list",
  spotify_playlist: "Spotify playlist",
  music_moments: "Music moments",
  tone_notes: "Tone / energy notes",
  day_of_contact: "Day-of contact",
  must_have_moments: "Must-have moments",
  group_notes: "Family / group notes",
  style_notes: "Style notes",
  constraints: "Constraints / priorities",
};

export const HANDOFF_TEMPLATES = {
  DAY_OF: {
    id: "DAY_OF" as const,
    title: "Day-of Coordinator Package",
    sections: [
      "date_locations",
      "timeline_notes",
      "key_contacts",
      "special_notes",
      "vendor_list",
      "seating_rosters",
      "dietary_by_table",
    ],
  },
  DJ: {
    id: "DJ" as const,
    title: "DJ / Band Package",
    sections: [
      "must_play",
      "do_not_play",
      "spotify_playlist",
      "music_moments",
      "tone_notes",
      "day_of_contact",
    ],
  },
  PHOTOGRAPHER: {
    id: "PHOTOGRAPHER" as const,
    title: "Photographer Package",
    sections: [
      "must_have_moments",
      "group_notes",
      "timeline_notes",
      "style_notes",
      "constraints",
    ],
  },
};
