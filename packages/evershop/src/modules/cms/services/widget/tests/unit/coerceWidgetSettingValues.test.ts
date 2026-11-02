import { describe, expect, it } from '@jest/globals';
import { coerceWidgetSettingValues } from '../../coerceWidgetSettingValues.js';

const properties = {
  announcements: { type: 'array' as const },
  motion: { type: 'string' as const },
  delay: { type: 'integer' as const }
};

describe('coerceWidgetSettingValues', () => {
  it('turns a JSON string of announcements into an array', () => {
    const settings = {
      announcements: '[{"id":"a","content":"Hello","link":null}]',
      motion: 'fixed'
    };
    coerceWidgetSettingValues(settings, properties);
    expect(settings.announcements).toEqual([
      { id: 'a', content: 'Hello', link: null }
    ]);
    expect(settings.motion).toBe('fixed');
  });

  it('leaves a real array and a non-JSON string alone', () => {
    const list = [{ id: 'a', content: 'Hello', link: null }];
    const settings = { announcements: list, motion: 'not-json' };
    coerceWidgetSettingValues(settings, properties);
    expect(settings.announcements).toBe(list);
    expect(settings.motion).toBe('not-json');
  });
});
