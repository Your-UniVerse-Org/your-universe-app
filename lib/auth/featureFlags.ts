/** OAuth (Google Sign-In) is built but intentionally disabled: email/password is the only
 * supported login method for now. Flip this back on when OAuth is scheduled — see
 * docs/session.md — no other code changes should be needed since the login screens already
 * gate their Google button behind this flag. */
export const OAUTH_LOGIN_ENABLED = false;
