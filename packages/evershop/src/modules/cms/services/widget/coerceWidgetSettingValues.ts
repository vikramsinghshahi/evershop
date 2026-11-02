/**
 * The legacy widget editor stores a list in a hidden text input, so the save
 * body can carry that list as a JSON string. The widget schema asks for an
 * array. Parse those strings before validation and before the row is written.
 */
export function coerceWidgetSettingValues(
  settings: Record<string, unknown>,
  properties: Record<string, { type?: string }> | undefined
): Record<string, unknown> {
  if (!properties) return settings;
  for (const [key, property] of Object.entries(properties)) {
    const value = settings[key];
    if (typeof value !== 'string') continue;
    const type = property?.type;
    if (type !== 'array' && type !== 'object') continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (type === 'array' && Array.isArray(parsed)) {
        settings[key] = parsed;
      } else if (
        type === 'object' &&
        parsed !== null &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed)
      ) {
        settings[key] = parsed;
      }
    } catch {
      // Leave the string. Schema validation reports the type error.
    }
  }
  return settings;
}
