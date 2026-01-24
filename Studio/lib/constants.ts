export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://api.yaralex.com";
export const YARALEX_PLAY_URL =
  process.env.NEXT_PUBLIC_YARALEX_PLAY_URL ?? "https://play.yaralex.com";

export const USER_ROLE = "creator";

export const COOKIE_TOKEN_KEY = "token";
export const COOKIE_REFRESH_TOKEN_KEY = "refresh-token";
export const COOKIE_TOKEN_EXPIRATION_DATE_KEY = "token-expiration-date";
export const COOKIE_REMEMBER_ME_KEY = "remember-me";
export const COOKIE_USER_KEY = "user";
export const GOOGLE_AUTH_BUTTON_ID = "google-one-tap-button";

export const QUERY_GET_FILE_SPACE_INFO_KEY = ["getFileSpaceInfoQuery"] as const;
