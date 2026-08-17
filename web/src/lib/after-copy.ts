export function cardPrompt(
  card: { guestName: string; gift?: string | null },
  names: string
) {
  const first = card.guestName.trim().split(/\s+/)[0] || card.guestName;
  const gift = card.gift?.trim() ? ` for the ${card.gift.trim()}` : " for being there";
  return `Dear ${first},\n\nThank you${gift}. It meant so much to have you with us.\n\nLove,\n${names}`;
}
