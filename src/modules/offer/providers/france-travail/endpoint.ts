export const FRANCE_TRAVAIL_ENDPOINTS = {
  token:
    'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=/partenaire',
  offer: {
    search:
      'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search',
    details: 'https://candidat.francetravail.fr/offres/recherche/detail',
  },
} as const;
