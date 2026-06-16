// Throttle for the sensitive admin token endpoints (register / invitation
// validate / OAuth init): limited attempts per window.
export const ADMIN_THROTTLE = {
  default: { limit: 5, ttl: 60_000 }, // ttl: 1 minute
};
