const OPTIONS_RE = /<!--\s*OPTIONS:.*?-->/s;
const SLOT_RE = /【插入(.+?)】/g;

export function stripOptionsMarker(text: string): string {
  return text.replace(OPTIONS_RE, '').trim();
}

export interface ParsedSlot {
  id: string;
  label: string;
  placeholder: string;
}

export function extractImageSlots(text: string): ParsedSlot[] {
  const slots: ParsedSlot[] = [];
  const seen = new Set<string>();
  let match;
  const re = new RegExp(SLOT_RE.source, SLOT_RE.flags);
  while ((match = re.exec(text)) !== null) {
    const label = match[1];
    if (seen.has(label)) continue;
    seen.add(label);
    slots.push({
      id: `slot-${slots.length + 1}`,
      label,
      placeholder: match[0],
    });
  }
  return slots;
}
