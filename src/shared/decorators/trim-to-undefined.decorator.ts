import { Transform } from 'class-transformer';

/**
 * Trims string values; a whitespace-only string becomes `undefined` so it is
 * treated as absent by validation (business rule: blank means empty).
 * Non-string values (including explicit `null`) pass through unchanged.
 */
export function TrimToUndefined(): PropertyDecorator {
  return Transform(({ value }): unknown => {
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  });
}
