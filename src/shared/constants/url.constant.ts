export const MAX_URL_LENGTH = 2_048;

// Jobboards & career platform domains allowed for fetching
export const ALLOWED_DOMAINS: ReadonlySet<string> = new Set([
  // LinkedIn
  'linkedin.com',
  // Indeed
  'indeed.com',
  'indeed.fr',
  // Welcome to the Jungle
  'welcometothejungle.com',
  // France Travail
  'francetravail.fr',
  // Glassdoor
  'glassdoor.com',
  'glassdoor.fr',
  // APEC
  'apec.fr',
  // HelloWork
  'hellowork.com',
  // Meteojob
  'meteojob.com',
  // ATS / career platforms
  'lever.co',
  'greenhouse.io',
  'smartrecruiters.com',
  'workday.com',
  'myworkdayjobs.com',
  'jobvite.com',
  'applytojob.com',
  'recruitee.com',
  'breezy.hr',
  'ashbyhq.com',
  'dover.com',
  'talent.io',
  // Others
  'lesjeudis.com',
  'chooseyourboss.com',
  'remoteok.com',
  'weworkremotely.com',
]);

// Private/reserved IP ranges to block (anti-SSRF)
export const BLOCKED_IP_PATTERNS: RegExp[] = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
];



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
