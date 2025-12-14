export const TOKEN_KEY_LS = "token";

// Blipp API is different in dev and prod environments.
const BLIPP_API_DOMAIN = process.env.NEXT_PUBLIC_BLIPP_API;
const BLIPP_API_PATH = "/do-blipp";

const CARD_REGISTER_PATH = "/card-id/";

export const BLIPP_API_URL = `${BLIPP_API_DOMAIN}${BLIPP_API_PATH}`;
export const CARD_REGISTER_URL = `${BLIPP_API_DOMAIN}${CARD_REGISTER_PATH}`;

export const ANIMATION_DURATION = 3000;

export enum BaljanColors {
  DarkBlue = "#2f308c",
  BrightBlue = "#00a4e0",
  Magenta = "#e6008b",
  Cerise = "#ec008c",
  Black = "#000000",
  White = "#ffffff",
}

export enum OtherColors {
  BrightGreen = "#00F771",
  DarkGreen = "#00a54c",
  BrightRed = "#ff2b2b",
  DarkRed = "#820c0c",
  DarkGray = "#333333",
}
