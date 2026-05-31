import 'express-session';

// Module augmentation: adds our custom field to express-session's SessionData
// interface so `req.session.adminInvitationToken` is typed everywhere (no cast).
declare module 'express-session' {
  interface SessionData {
    adminInvitationToken?: string;
  }
}
