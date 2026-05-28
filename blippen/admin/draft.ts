import { ReactNode } from "react";
import BlippAudio from "../utils/blippAudio";
import BlippImage from "../utils/blippImage";
import { BaljanColors, OtherColors } from "../constants";
import {
  generateDate,
  makeErrorScreen,
  makeMainScreen,
  makeSnowfall,
  makeSuccessScreen,
} from "../utils/themeHelpers";
import { Theme } from "../utils/types";

// ---
// Editable theme draft
//
// This mirrors the *data-driven* subset of a theme (everything the
// make*Screen / makeSnowfall helpers accept). Custom JSX themes
// (video backgrounds, framer-motion, Bokeh, conditional title functions)
// can't be represented here and stay hand-coded in themes.tsx.
// ---

export type MultiStrategy = "random" | "alternating";

export interface MainDraft {
  backgroundColor: string;
  backgroundImage: string;
  backgroundBlendMode: string;
  titleFontColor: string;
  infoFontColor: string;
  footerFontColor: string;
  title: string;
  infoText: string;
  invertGithub: boolean;
}

export interface StatusDraft {
  backgroundColor: string;
  backgroundImage: string;
  backgroundBlendMode: string;
  fontColor: string;
  // One entry per line. URLs/paths become BlippImage/BlippAudio,
  // anything else (emoji, text) stays a plain string.
  images: string;
  sounds: string;
  strategy: MultiStrategy;
}

export interface SnowfallDraft {
  enabled: boolean;
  content: string; // one entry per line
  size: number;
  count: number;
  speed: number;
  reverse: boolean;
  randomHue: boolean;
  randomRotation: boolean;
}

export interface DraftTheme {
  name: string;
  dateStart: string; // YYYY-MM-DD, optional
  dateEnd: string; // YYYY-MM-DD, optional
  main: MainDraft;
  success: StatusDraft;
  error: StatusDraft;
  snowfall: SnowfallDraft;
}

// ---
// Defaults (kept in sync with themeHelpers.tsx so an untouched field
// matches the real "default" theme).
// ---

export const MAIN_DEFAULTS: MainDraft = {
  backgroundColor: BaljanColors.BrightBlue,
  backgroundImage: "none",
  backgroundBlendMode: "normal",
  titleFontColor: BaljanColors.Magenta,
  infoFontColor: OtherColors.DarkGray,
  footerFontColor: OtherColors.DarkGray,
  title: "Baljans Balla Blipp",
  infoText: "",
  invertGithub: false,
};

export const SUCCESS_DEFAULTS: StatusDraft = {
  backgroundColor: OtherColors.DarkGreen,
  backgroundImage: "none",
  backgroundBlendMode: "normal",
  fontColor: OtherColors.BrightGreen,
  images: "",
  sounds: "",
  strategy: "random",
};

export const ERROR_DEFAULTS: StatusDraft = {
  backgroundColor: OtherColors.DarkRed,
  backgroundImage: "none",
  backgroundBlendMode: "normal",
  fontColor: OtherColors.BrightRed,
  images: "",
  sounds: "",
  strategy: "random",
};

export const SNOWFALL_DEFAULTS: SnowfallDraft = {
  enabled: false,
  content: "",
  size: 2,
  count: 0,
  speed: 1,
  reverse: false,
  randomHue: false,
  randomRotation: false,
};

export const emptyDraft = (): DraftTheme => ({
  name: "",
  dateStart: "",
  dateEnd: "",
  main: { ...MAIN_DEFAULTS },
  success: { ...SUCCESS_DEFAULTS },
  error: { ...ERROR_DEFAULTS },
  snowfall: { ...SNOWFALL_DEFAULTS },
});

// ---
// Parsing helpers
// ---

export const parseLines = (text: string): string[] =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const IMAGE_EXT = /\.(png|jpe?g|gif|svg|webp|avif|mp4)$/i;

const looksLikeAsset = (line: string): boolean =>
  /^(https?:\/\/|\/)/.test(line) || IMAGE_EXT.test(line);

// Collapse a list into the shape make*Screen expects:
// nothing -> undefined (use default), one -> single value, many -> array.
const collapse = <T>(items: T[]): T | T[] | undefined => {
  if (items.length === 0) return undefined;
  if (items.length === 1) return items[0];
  return items;
};

// ---
// Asset resolution
//
// Uploaded files live only in the browser as object URLs. The draft and the
// generated code always reference the intended *public path*
// (e.g. /images/my-theme/cat.png); for the live preview we swap any path that
// has an uploaded file for its object URL so it actually shows up.
// ---

export type AssetMap = Record<string, string>; // public path -> object URL

const resolvePath = (path: string, assets: AssetMap): string =>
  assets[path] ?? path;

// Replace every known public path occurring inside a CSS value
// (e.g. "url(/images/my-theme/bg.png)") with its object URL.
const resolveCss = (value: string, assets: AssetMap): string =>
  Object.entries(assets).reduce(
    (acc, [path, url]) => acc.split(path).join(url),
    value
  );

// A status/snowfall "image" line: asset paths render as <img> (using the
// uploaded object URL when available), everything else (emoji, "π = 3.14",
// ...) renders as text.
const toImageNode = (line: string, assets: AssetMap): ReactNode | BlippImage =>
  looksLikeAsset(line) ? new BlippImage(resolvePath(line, assets)) : line;

// ---
// Build a live Theme object from the draft using the real helpers.
// shouldApplyToday is irrelevant for the preview (we force-render), so
// it just returns false here.
// ---

type StatusOverrides = NonNullable<Parameters<typeof makeSuccessScreen>[0]>;

const buildStatusOverrides = (
  draft: StatusDraft,
  assets: AssetMap
): StatusOverrides => {
  const overrides: StatusOverrides = {};
  if (draft.backgroundColor) overrides.backgroundColor = draft.backgroundColor;
  if (draft.backgroundImage)
    overrides.backgroundImage = resolveCss(draft.backgroundImage, assets);
  if (draft.backgroundBlendMode)
    overrides.backgroundBlendMode = draft.backgroundBlendMode;
  if (draft.fontColor) overrides.fontColor = draft.fontColor;

  const images = collapse(
    parseLines(draft.images).map((line) => toImageNode(line, assets))
  );
  if (images !== undefined)
    overrides.image = images as StatusOverrides["image"];

  const sounds = collapse(
    parseLines(draft.sounds).map(
      (line) => new BlippAudio(resolvePath(line, assets))
    )
  );
  if (sounds !== undefined)
    overrides.sound = sounds as StatusOverrides["sound"];

  return overrides;
};

export const buildTheme = (draft: DraftTheme, assets: AssetMap = {}): Theme => {
  const theme: Theme = {
    name: draft.name || "preview",
    shouldApplyToday: () => false,
    mainScreen: makeMainScreen({
      backgroundColor: draft.main.backgroundColor,
      backgroundImage: resolveCss(draft.main.backgroundImage, assets),
      backgroundBlendMode: draft.main.backgroundBlendMode,
      titleFontColor: draft.main.titleFontColor,
      infoFontColor: draft.main.infoFontColor,
      footerFontColor: draft.main.footerFontColor,
      title: draft.main.title,
      infoText: draft.main.infoText,
      invertGithub: draft.main.invertGithub,
    }),
    successScreen: makeSuccessScreen(
      buildStatusOverrides(draft.success, assets),
      draft.success.strategy
    ),
    errorScreen: makeErrorScreen(
      buildStatusOverrides(draft.error, assets),
      draft.error.strategy
    ),
  };

  if (draft.snowfall.enabled) {
    const content = parseLines(draft.snowfall.content).map((line) =>
      looksLikeAsset(line) ? new BlippImage(resolvePath(line, assets)) : line
    );
    theme.snowfall = makeSnowfall({
      content: content.length ? content : ["❆"],
      size: draft.snowfall.size,
      count: draft.snowfall.count || undefined,
      speed: draft.snowfall.speed,
      reverse: draft.snowfall.reverse,
      randomHue: draft.snowfall.randomHue,
      randomRotation: draft.snowfall.randomRotation,
    });
  }

  return theme;
};

// ---
// Generate ready-to-paste themes.tsx source.
// Only non-default fields are emitted to keep the snippet clean.
// ---

const q = (value: string) => JSON.stringify(value);

// Render one asset/text line as a code expression.
const assetExpr = (line: string, kind: "image" | "sound"): string => {
  if (kind === "sound") return `new BlippAudio(${q(line)})`;
  return looksLikeAsset(line) ? `new BlippImage(${q(line)})` : q(line);
};

// Render the value for image/sound overrides (single vs array).
const listValue = (lines: string[], kind: "image" | "sound"): string => {
  if (lines.length === 1) return assetExpr(lines[0], kind);
  const inner = lines.map((line) => `        ${assetExpr(line, kind)},`);
  return `[\n${inner.join("\n")}\n      ]`;
};

const mainCode = (draft: DraftTheme): string => {
  const m = draft.main;
  const lines: string[] = [];
  const add = (key: keyof MainDraft, def: MainDraft[keyof MainDraft]) => {
    if (m[key] !== def) lines.push(`      ${key}: ${q(String(m[key]))},`);
  };
  add("backgroundColor", MAIN_DEFAULTS.backgroundColor);
  add("backgroundImage", MAIN_DEFAULTS.backgroundImage);
  add("backgroundBlendMode", MAIN_DEFAULTS.backgroundBlendMode);
  add("titleFontColor", MAIN_DEFAULTS.titleFontColor);
  add("infoFontColor", MAIN_DEFAULTS.infoFontColor);
  add("footerFontColor", MAIN_DEFAULTS.footerFontColor);
  add("title", MAIN_DEFAULTS.title);
  add("infoText", MAIN_DEFAULTS.infoText);
  if (m.invertGithub) lines.push(`      invertGithub: true,`);

  if (lines.length === 0) return `makeMainScreen()`;
  return `makeMainScreen({\n${lines.join("\n")}\n    })`;
};

const statusCode = (
  draft: StatusDraft,
  maker: "makeSuccessScreen" | "makeErrorScreen",
  defaults: StatusDraft
): string => {
  const lines: string[] = [];
  const add = (key: keyof StatusDraft, def: string) => {
    const value = draft[key];
    if (typeof value === "string" && value && value !== def)
      lines.push(`      ${key}: ${q(value)},`);
  };
  add("backgroundColor", defaults.backgroundColor);
  add("backgroundImage", defaults.backgroundImage);
  add("backgroundBlendMode", defaults.backgroundBlendMode);
  add("fontColor", defaults.fontColor);

  const images = parseLines(draft.images);
  if (images.length) lines.push(`      image: ${listValue(images, "image")},`);
  const sounds = parseLines(draft.sounds);
  if (sounds.length) lines.push(`      sound: ${listValue(sounds, "sound")},`);

  const strategyArg = draft.strategy === "alternating" ? `, "alternating"` : "";

  if (lines.length === 0 && !strategyArg) return `${maker}()`;
  if (lines.length === 0) return `${maker}({}${strategyArg})`;
  return `${maker}({\n${lines.join("\n")}\n    }${strategyArg})`;
};

const snowfallCode = (draft: SnowfallDraft): string | null => {
  if (!draft.enabled) return null;
  const content = parseLines(draft.content);
  const contentInner = content
    .map((line) =>
      looksLikeAsset(line) ? `new BlippImage(${q(line)})` : q(line)
    )
    .map((expr) => `        ${expr},`)
    .join("\n");

  const lines: string[] = [];
  lines.push(`      content: [\n${contentInner}\n      ],`);
  if (draft.size !== SNOWFALL_DEFAULTS.size)
    lines.push(`      size: ${draft.size},`);
  if (draft.count) lines.push(`      count: ${draft.count},`);
  if (draft.speed !== SNOWFALL_DEFAULTS.speed)
    lines.push(`      speed: ${draft.speed},`);
  if (draft.reverse) lines.push(`      reverse: true,`);
  if (draft.randomHue) lines.push(`      randomHue: true,`);
  if (draft.randomRotation) lines.push(`      randomRotation: true,`);

  return `makeSnowfall({\n${lines.join("\n")}\n    })`;
};

const shouldApplyTodayCode = (draft: DraftTheme): string => {
  if (draft.dateStart && draft.dateEnd)
    return `generateDate(${q(draft.dateStart)}, ${q(draft.dateEnd)})`;
  if (draft.dateStart) return `generateDate(${q(draft.dateStart)})`;
  return `() => false /* TODO: set when this theme should apply */`;
};

export const generateCode = (draft: DraftTheme): string => {
  const parts: string[] = [];
  parts.push(`  {`);
  parts.push(`    name: ${q(draft.name || "unnamed")},`);
  parts.push(`    shouldApplyToday: ${shouldApplyTodayCode(draft)},`);
  parts.push(`    mainScreen: ${mainCode(draft)},`);
  parts.push(
    `    successScreen: ${statusCode(
      draft.success,
      "makeSuccessScreen",
      SUCCESS_DEFAULTS
    )},`
  );
  parts.push(
    `    errorScreen: ${statusCode(
      draft.error,
      "makeErrorScreen",
      ERROR_DEFAULTS
    )},`
  );
  const snow = snowfallCode(draft.snowfall);
  if (snow) parts.push(`    snowfall: ${snow},`);
  parts.push(`  },`);
  return parts.join("\n");
};
