export const MAX_TEXT_LENGTH = 15_000;


// Patterns that ONLY appear on blocked/error pages — instant reject
export const HARD_BLOCK_PATTERNS: RegExp[] = [
  /checking your browser/i,
  /attention required.{0,10}cloudflare/i,
  /ray id\s*:/i,
  /verify you are (a )?human/i,
  /^unknown\.?$/i, // Jina Reader failure response
];


// Patterns that are suspicious but can appear legitimately in long pages
export const SOFT_BLOCK_PATTERNS: RegExp[] = [
  /captcha/i,
  /hcaptcha/i,
  /recaptcha/i,
  /403\s*forbidden/i,
  /access denied/i,
  /404\s*not found/i,
  /page not found/i,
  /enable javascript/i,
  /javascript is required/i,
  /sign in to (continue|view|access)/i,
  /log in to (continue|view|access)/i,
  /connexion requise/i,
  /veuillez vous connecter/i,
  /accept.{0,5}cookies/i,
  /cookie (policy|consent)/i,
  /we use cookies/i,
];