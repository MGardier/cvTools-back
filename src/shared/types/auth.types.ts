import type { TOAuthErrorQuery, TOAuthSuccessQuery } from '@cvtools/contracts';

export type TOAuthRedirectType = 'success' | 'error';

// Query string of the OAuth return URL, defined by @cvtools/contracts.
export type TOAuthRedirectParams<T extends TOAuthRedirectType> =
  T extends 'success' ? TOAuthSuccessQuery : TOAuthErrorQuery;
