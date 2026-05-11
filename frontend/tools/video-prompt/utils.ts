const OPTIONS_RE = /<!--\s*OPTIONS:.*?-->/s;

export function stripOptionsMarker(text: string): string {
  return text.replace(OPTIONS_RE, '').trim();
}
