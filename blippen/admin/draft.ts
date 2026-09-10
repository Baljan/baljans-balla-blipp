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

// A single image / falling item. Assets come only from uploads, so their
// public path is system-assigned and never typed by the user; text items
// (emoji, "π = 3.14", ...) are free content, not paths.
// `size` (assets only) is a multiplier on the image's natural display size:
// 1 = default, 0.7 = 70 %, 1.5 = 150 %. Absent means 1.
export type ContentItem =
  | { kind: "asset"; path: string; size?: number }
  | { kind: "text"; value: string };

export interface MainDraft {
  backgroundColor: string;
  backgroundImage: string;
  backgroundBlendMode: string;
  backgroundSize: string; // CSS background-size ("cover" = default / fill)
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
  backgroundSize: string; // CSS background-size ("cover" = default / fill)
  fontColor: string;
  images: ContentItem[];
  sounds: string[]; // asset paths only (sounds are always uploaded files)
  strategy: MultiStrategy;
}

export interface SnowfallDraft {
  enabled: boolean;
  content: ContentItem[];
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
  backgroundSize: "cover",
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
  backgroundSize: "cover",
  fontColor: OtherColors.BrightGreen,
  images: [],
  sounds: [],
  strategy: "random",
};

export const ERROR_DEFAULTS: StatusDraft = {
  backgroundColor: OtherColors.DarkRed,
  backgroundImage: "none",
  backgroundBlendMode: "normal",
  backgroundSize: "cover",
  fontColor: OtherColors.BrightRed,
  images: [],
  sounds: [],
  strategy: "random",
};

export const SNOWFALL_DEFAULTS: SnowfallDraft = {
  enabled: false,
  content: [],
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

const parseLines = (text: string): string[] =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const IMAGE_EXT = /\.(png|jpe?g|gif|svg|webp|avif|mp4)$/i;

const looksLikeAsset = (line: string): boolean =>
  /^(https?:\/\/|\/)/.test(line) || IMAGE_EXT.test(line);

const toContentItem = (line: string): ContentItem =>
  looksLikeAsset(line)
    ? { kind: "asset", path: line }
    : { kind: "text", value: line };

// ---
// Normalize a persisted/partial draft into the current shape. Earlier drafts
// stored images/sounds/content as newline-separated strings; coerce those so
// a saved draft from before the list rewrite still loads.
// ---

// Numbers end up unquoted in the generated themes.tsx snippet, so a draft
// (localStorage or an imported tema.json) must never smuggle anything else
// into those slots. Anything that isn't a finite number falls back.
const toNumber = (value: unknown, fallback: number): number => {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
};

// Only the two item shapes we know; drops anything else and coerces size.
const toItem = (value: unknown): ContentItem | null => {
  if (typeof value === "string") return toContentItem(value);
  if (!value || typeof value !== "object") return null;
  const v = value as {
    kind?: unknown;
    path?: unknown;
    value?: unknown;
    size?: unknown;
  };
  if (v.kind === "asset" && typeof v.path === "string") {
    const item: ContentItem = { kind: "asset", path: v.path };
    if (v.size !== undefined) item.size = toNumber(v.size, 1);
    return item;
  }
  if (v.kind === "text" && typeof v.value === "string")
    return { kind: "text", value: v.value };
  return null;
};

const toItems = (value: unknown): ContentItem[] => {
  if (Array.isArray(value))
    return value.map(toItem).filter((i): i is ContentItem => i !== null);
  if (typeof value === "string") return parseLines(value).map(toContentItem);
  return [];
};

const toPaths = (value: unknown): string[] => {
  if (Array.isArray(value))
    return value.filter((p): p is string => typeof p === "string");
  if (typeof value === "string") return parseLines(value);
  return [];
};

const normalizeStatus = (
  raw: Partial<StatusDraft>,
  def: StatusDraft
): StatusDraft => ({
  ...def,
  ...raw,
  images: toItems((raw as { images?: unknown }).images),
  sounds: toPaths((raw as { sounds?: unknown }).sounds),
});

export const normalizeDraft = (raw: Partial<DraftTheme>): DraftTheme => {
  const base = emptyDraft();
  return {
    ...base,
    ...raw,
    main: { ...base.main, ...raw.main },
    success: normalizeStatus(raw.success ?? {}, SUCCESS_DEFAULTS),
    error: normalizeStatus(raw.error ?? {}, ERROR_DEFAULTS),
    snowfall: {
      ...base.snowfall,
      ...raw.snowfall,
      content: toItems(
        (raw.snowfall as { content?: unknown } | undefined)?.content
      ),
      size: toNumber(raw.snowfall?.size, base.snowfall.size),
      count: toNumber(raw.snowfall?.count, base.snowfall.count),
      speed: toNumber(raw.snowfall?.speed, base.snowfall.speed),
    },
  };
};

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

// A status/snowfall content item: assets render as <img> (using the uploaded
// object URL when available), text items (emoji, "π = 3.14", ...) stay text.
const toImageNode = (
  item: ContentItem,
  assets: AssetMap
): ReactNode | BlippImage =>
  item.kind === "asset"
    ? new BlippImage(resolvePath(item.path, assets), item.size)
    : item.value;

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
  if (draft.backgroundSize) overrides.backgroundSize = draft.backgroundSize;
  if (draft.fontColor) overrides.fontColor = draft.fontColor;

  const images = collapse(
    draft.images.map((item) => toImageNode(item, assets))
  );
  if (images !== undefined)
    overrides.image = images as StatusOverrides["image"];

  const sounds = collapse(
    draft.sounds.map((path) => new BlippAudio(resolvePath(path, assets)))
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
      backgroundSize: draft.main.backgroundSize,
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
    const content = draft.snowfall.content.map((item) =>
      item.kind === "asset"
        ? new BlippImage(resolvePath(item.path, assets), item.size)
        : item.value
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

const imageItemExpr = (item: ContentItem): string => {
  if (item.kind === "text") return q(item.value);
  return item.size !== undefined && item.size !== 1
    ? `new BlippImage(${q(item.path)}, ${item.size})`
    : `new BlippImage(${q(item.path)})`;
};

const soundExpr = (path: string): string => `new BlippAudio(${q(path)})`;

// Render the value for image/sound overrides (single vs array).
const listValue = (exprs: string[]): string => {
  if (exprs.length === 1) return exprs[0];
  const inner = exprs.map((expr) => `        ${expr},`);
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
  if (m.backgroundImage !== MAIN_DEFAULTS.backgroundImage)
    add("backgroundSize", MAIN_DEFAULTS.backgroundSize);
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
  if (draft.backgroundImage !== defaults.backgroundImage)
    add("backgroundSize", defaults.backgroundSize);
  add("fontColor", defaults.fontColor);

  if (draft.images.length)
    lines.push(`      image: ${listValue(draft.images.map(imageItemExpr))},`);
  if (draft.sounds.length)
    lines.push(`      sound: ${listValue(draft.sounds.map(soundExpr))},`);

  const strategyArg = draft.strategy === "alternating" ? `, "alternating"` : "";

  if (lines.length === 0 && !strategyArg) return `${maker}()`;
  if (lines.length === 0) return `${maker}({}${strategyArg})`;
  return `${maker}({\n${lines.join("\n")}\n    }${strategyArg})`;
};

const snowfallCode = (draft: SnowfallDraft): string | null => {
  if (!draft.enabled) return null;
  const contentInner = draft.content
    .map(imageItemExpr)
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

// ---
// Every public asset path the draft references — used to decide which uploaded
// files go into the export zip and to show the "what's missing" list.
// ---

// Pull the path out of a CSS background value like url(/images/x/bg.png).
const cssUrlPath = (css: string): string | null => {
  const m = css.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
  return m && m[1].startsWith("/") ? m[1] : null;
};

// Theme name -> URL/dir-safe slug. Uploaded assets live under this slug, so
// renaming the theme must move them with it (see reslugDraft).
export const slugify = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "my-theme";

// Rewrite the /images/<slug>/ and /sounds/<slug>/ segment of one path string
// (works for bare paths and CSS like url(/images/<slug>/bg.png)).
export const remapSlugPath = (
  value: string,
  oldSlug: string,
  newSlug: string
): string =>
  value
    .split(`/images/${oldSlug}/`)
    .join(`/images/${newSlug}/`)
    .split(`/sounds/${oldSlug}/`)
    .join(`/sounds/${newSlug}/`);

// Move every asset path in a draft from oldSlug to newSlug.
export const reslugDraft = (
  draft: DraftTheme,
  oldSlug: string,
  newSlug: string
): DraftTheme => {
  if (oldSlug === newSlug) return draft;
  const swap = (s: string) => remapSlugPath(s, oldSlug, newSlug);
  const item = (i: ContentItem): ContentItem =>
    i.kind === "asset" ? { ...i, path: swap(i.path) } : i;
  const status = (s: StatusDraft): StatusDraft => ({
    ...s,
    backgroundImage: swap(s.backgroundImage),
    images: s.images.map(item),
    sounds: s.sounds.map(swap),
  });
  return {
    ...draft,
    main: { ...draft.main, backgroundImage: swap(draft.main.backgroundImage) },
    success: status(draft.success),
    error: status(draft.error),
    snowfall: { ...draft.snowfall, content: draft.snowfall.content.map(item) },
  };
};

export const referencedAssetPaths = (draft: DraftTheme): string[] => {
  const paths = new Set<string>();
  const addCss = (css: string) => {
    const p = cssUrlPath(css);
    if (p) paths.add(p);
  };
  addCss(draft.main.backgroundImage);
  for (const status of [draft.success, draft.error]) {
    addCss(status.backgroundImage);
    status.images.forEach((i) => i.kind === "asset" && paths.add(i.path));
    status.sounds.forEach((p) => paths.add(p));
  }
  if (draft.snowfall.enabled)
    draft.snowfall.content.forEach(
      (i) => i.kind === "asset" && paths.add(i.path)
    );
  return Array.from(paths);
};

// ---
// A short, human-readable list of what the draft changes from the defaults —
// shown in the UI instead of the raw generated code.
// ---

export const summarizeDraft = (draft: DraftTheme): string[] => {
  const out: string[] = [];

  if (draft.dateStart || draft.dateEnd)
    out.push(`Aktiv: ${draft.dateStart || "?"} – ${draft.dateEnd || "?"}`);

  const m = draft.main;
  const main: string[] = [];
  if (m.title !== MAIN_DEFAULTS.title) main.push(`titel "${m.title}"`);
  if (m.backgroundColor !== MAIN_DEFAULTS.backgroundColor)
    main.push("bakgrundsfärg");
  if (m.backgroundImage !== MAIN_DEFAULTS.backgroundImage)
    main.push("bakgrund");
  if (m.titleFontColor !== MAIN_DEFAULTS.titleFontColor) main.push("titelfärg");
  if (m.infoText !== MAIN_DEFAULTS.infoText) main.push("infotext");
  if (
    m.infoFontColor !== MAIN_DEFAULTS.infoFontColor ||
    m.footerFontColor !== MAIN_DEFAULTS.footerFontColor
  )
    main.push("textfärger");
  if (m.invertGithub) main.push("inverterad GitHub-logga");
  if (main.length) out.push(`Startskärm: ${main.join(", ")}`);

  const status = (label: string, d: StatusDraft, def: StatusDraft) => {
    const parts: string[] = [];
    if (d.backgroundColor !== def.backgroundColor) parts.push("bakgrundsfärg");
    if (d.backgroundImage !== def.backgroundImage) parts.push("bakgrund");
    if (d.fontColor !== def.fontColor) parts.push("textfärg");
    if (d.images.length) parts.push(`${d.images.length} bild/text`);
    if (d.sounds.length) parts.push(`${d.sounds.length} ljud`);
    if (d.strategy !== def.strategy) parts.push(d.strategy);
    if (parts.length) out.push(`${label}: ${parts.join(", ")}`);
  };
  status("Godkänd-skärm", draft.success, SUCCESS_DEFAULTS);
  status("Nekad-skärm", draft.error, ERROR_DEFAULTS);

  if (draft.snowfall.enabled)
    out.push(`Fall-effekt: på (${draft.snowfall.content.length} objekt)`);

  return out;
};
