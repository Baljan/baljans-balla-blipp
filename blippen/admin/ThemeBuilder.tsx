import React, { useEffect, useMemo, useRef, useState } from "react";
import BallaBlippen from "../components/BallaBlippen";
import PreviewFrame from "./PreviewFrame";
import {
  idbClearAssets,
  idbDeleteAsset,
  idbLoadAssets,
  idbPutAsset,
} from "./assetDb";
import {
  AssetMap,
  ContentItem,
  DraftTheme,
  MainDraft,
  MultiStrategy,
  StatusDraft,
  buildTheme,
  emptyDraft,
  generateCode,
  normalizeDraft,
  referencedAssetPaths,
  remapSlugPath,
  reslugDraft,
  slugify,
  summarizeDraft,
} from "./draft";
import { ZipEntry, createZip } from "./zip";
import styles from "./ThemeBuilder.module.css";

const LS_KEY = "theme-builder-draft";

// An uploaded file kept around so the live preview can show it (url) and the
// export zip can bundle the real bytes (file). Mirrored to IndexedDB so it
// survives a reload — always in the user's own browser, never on a server.
type Asset = { url: string; file: Blob };
type AssetStore = Record<string, Asset>; // public path -> asset

// Register an uploaded file under a system-assigned public path and hand back
// that path. The user never types or edits the path.
type RegisterAsset = (file: File, kind: "image" | "sound") => string;

// ---
// Small reusable field components
// ---

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

const isHex = (v: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <div className={styles.colorRow}>
        <input
          type="color"
          value={isHex(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}

function CheckField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={styles.checkField}>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function NumberField({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input
        type="number"
        value={value}
        step={step ?? 1}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function UploadButton({
  label,
  accept,
  onFiles,
}: {
  label: string;
  accept: string;
  onFiles: (files: File[]) => void;
}) {
  return (
    <label className={styles.upload}>
      <input
        type="file"
        accept={accept}
        multiple
        onChange={(e) => {
          onFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      <span>{label}</span>
    </label>
  );
}

// Show only the filename in the UI — the full public path is an internal
// detail that just confuses non-technical users (it still lives in the draft
// and the exported zip).
const fileName = (path: string): string => path.split("/").pop() ?? path;

// A small thumbnail: the uploaded image when we have it, otherwise a stand-in.
function Thumb({ asset, fallback }: { asset?: Asset; fallback: string }) {
  if (asset)
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={styles.thumb} src={asset.url} alt="" />;
  return (
    <span className={styles.thumb} aria-hidden>
      {fallback}
    </span>
  );
}

// ---
// Managed content list (status images / falling items).
//
// Assets come only from uploads — they show as a non-editable chip (thumbnail
// + system path + remove). Text/emoji items stay free content in a small
// editable input. There is no way to type a filesystem path.
// ---

function ItemList({
  items,
  onChange,
  assets,
  registerAsset,
}: {
  items: ContentItem[];
  onChange: (next: ContentItem[]) => void;
  assets: AssetStore;
  registerAsset: RegisterAsset;
}) {
  const removeAt = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const setText = (i: number, value: string) =>
    onChange(
      items.map((it, idx) => (idx === i ? { kind: "text", value } : it))
    );
  const setSize = (i: number, size: number) =>
    onChange(
      items.map((it, idx) =>
        idx === i && it.kind === "asset" ? { ...it, size } : it
      )
    );
  const addAssets = (files: File[]) =>
    onChange([
      ...items,
      ...files.map(
        (f): ContentItem => ({ kind: "asset", path: registerAsset(f, "image") })
      ),
    ]);
  const addText = () => onChange([...items, { kind: "text", value: "" }]);

  return (
    <div className={styles.itemBlock}>
      {items.length > 0 && (
        <ul className={styles.itemList}>
          {items.map((it, i) => (
            <li key={i} className={styles.item}>
              {it.kind === "asset" ? (
                <>
                  <Thumb asset={assets[it.path]} fallback="🖼️" />
                  <span className={styles.itemPath}>{fileName(it.path)}</span>
                  <label
                    className={styles.itemSize}
                    title="Storlek (1 = standard)"
                  >
                    storlek
                    <input
                      type="number"
                      step={0.1}
                      min={0.1}
                      value={it.size ?? 1}
                      onChange={(e) => setSize(i, Number(e.target.value))}
                    />
                  </label>
                </>
              ) : (
                <input
                  className={styles.itemText}
                  type="text"
                  value={it.value}
                  placeholder="emoji eller text"
                  onChange={(e) => setText(i, e.target.value)}
                />
              )}
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => removeAt(i)}
                aria-label="Ta bort"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.itemActions}>
        <UploadButton
          label="Ladda upp bild(er)"
          accept="image/*"
          onFiles={addAssets}
        />
        <button type="button" className={styles.addTextBtn} onClick={addText}>
          + text / emoji
        </button>
      </div>
    </div>
  );
}

// Sounds are always uploaded files — a simple removable list of paths.
function SoundList({
  paths,
  onChange,
  registerAsset,
}: {
  paths: string[];
  onChange: (next: string[]) => void;
  registerAsset: RegisterAsset;
}) {
  return (
    <div className={styles.itemBlock}>
      {paths.length > 0 && (
        <ul className={styles.itemList}>
          {paths.map((p, i) => (
            <li key={i} className={styles.item}>
              <span className={styles.thumb} aria-hidden>
                🔊
              </span>
              <span className={styles.itemPath}>{fileName(p)}</span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => onChange(paths.filter((_, idx) => idx !== i))}
                aria-label="Ta bort"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <UploadButton
        label="Ladda upp ljud"
        accept="audio/*"
        onFiles={(files) =>
          onChange([...paths, ...files.map((f) => registerAsset(f, "sound"))])
        }
      />
    </div>
  );
}

const urlPath = (css: string): string | null => {
  const m = css.match(/^url\(\s*['"]?([^'")]+)['"]?\s*\)$/);
  return m ? m[1] : null;
};

// background-size as a simple multiplier: "cover" (default / fill) = 1,
// otherwise a percentage like "70%" = 0.7. Anything we can't parse reads as 1.
const sizeToNumber = (css: string): number => {
  const m = css.match(/^([\d.]+)%$/);
  return m ? Number(m[1]) / 100 : 1;
};

const numberToSize = (n: number): string =>
  n === 1 ? "cover" : `${+(n * 100).toFixed(2)}%`;

// CSS background-blend-mode: how the image/gradient mixes with the
// background color underneath (soft-light is what valentine/semla use).
const BLEND_MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "soft-light",
  "hard-light",
  "color-dodge",
  "color-burn",
  "difference",
  "luminosity",
];

// Background: either an uploaded image (shown as a removable chip, path set by
// the system) or a CSS gradient / "none" typed as free text. No path typing.
function BackgroundField({
  label,
  value,
  onChange,
  size,
  onSizeChange,
  blend,
  onBlendChange,
  assets,
  registerAsset,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  size: string;
  onSizeChange: (v: string) => void;
  blend: string;
  onBlendChange: (v: string) => void;
  assets: AssetStore;
  registerAsset: RegisterAsset;
}) {
  const path = urlPath(value);
  const hasBackground = value.trim() !== "" && value.trim() !== "none";
  return (
    <div className={styles.field}>
      <span>{label}</span>
      {path ? (
        <div className={styles.item}>
          <Thumb asset={assets[path]} fallback="🖼️" />
          <span className={styles.itemPath}>{fileName(path)}</span>
          <label
            className={styles.itemSize}
            title="Storlek (1 = täcker skärmen)"
          >
            storlek
            <input
              type="number"
              step={0.1}
              min={0.1}
              value={sizeToNumber(size)}
              onChange={(e) =>
                onSizeChange(numberToSize(Number(e.target.value)))
              }
            />
          </label>
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => onChange("none")}
            aria-label="Ta bort"
          >
            ×
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={value === "none" ? "" : value}
          placeholder="ingen — eller CSS-gradient (avancerat)"
          onChange={(e) =>
            onChange(e.target.value.trim() === "" ? "none" : e.target.value)
          }
        />
      )}
      <UploadButton
        label="Ladda upp bakgrundsbild"
        accept="image/*"
        onFiles={(files) =>
          files[0] && onChange(`url(${registerAsset(files[0], "image")})`)
        }
      />
      {hasBackground && (
        <label
          className={styles.blendRow}
          title="CSS background-blend-mode — hur bilden/gradienten blandas med bakgrundsfärgen"
        >
          <span>Blandningsläge</span>
          <select value={blend} onChange={(e) => onBlendChange(e.target.value)}>
            {BLEND_MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

// ---
// Status screen (success / error) editor
// ---

function StatusEditor({
  title,
  draft,
  onChange,
  assets,
  registerAsset,
}: {
  title: string;
  draft: StatusDraft;
  onChange: (next: StatusDraft) => void;
  assets: AssetStore;
  registerAsset: RegisterAsset;
}) {
  const set = <K extends keyof StatusDraft>(key: K, value: StatusDraft[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <fieldset className={styles.section}>
      <legend>{title}</legend>
      <ColorField
        label="Bakgrundsfärg"
        value={draft.backgroundColor}
        onChange={(v) => set("backgroundColor", v)}
      />
      <BackgroundField
        label="Bakgrund"
        value={draft.backgroundImage}
        onChange={(v) => set("backgroundImage", v)}
        size={draft.backgroundSize}
        onSizeChange={(v) => set("backgroundSize", v)}
        blend={draft.backgroundBlendMode}
        onBlendChange={(v) => set("backgroundBlendMode", v)}
        assets={assets}
        registerAsset={registerAsset}
      />
      <ColorField
        label="Textfärg"
        value={draft.fontColor}
        onChange={(v) => set("fontColor", v)}
      />
      <div className={styles.field}>
        <span>Bild(er) — uppladdad bild eller text/emoji</span>
        <ItemList
          items={draft.images}
          onChange={(v) => set("images", v)}
          assets={assets}
          registerAsset={registerAsset}
        />
      </div>
      <div className={styles.field}>
        <span>Ljud</span>
        <SoundList
          paths={draft.sounds}
          onChange={(v) => set("sounds", v)}
          registerAsset={registerAsset}
        />
      </div>
      <label className={styles.field}>
        <span>Vid flera bilder/ljud</span>
        <select
          value={draft.strategy}
          onChange={(e) => set("strategy", e.target.value as MultiStrategy)}
        >
          <option value="random">slumpmässig</option>
          <option value="alternating">växlande</option>
        </select>
      </label>
    </fieldset>
  );
}

// ---
// The real, complete blipp — exactly the production component, in testing
// mode so it uses the mock API instead of the live one. Rendered inside an
// iframe so viewport-relative effects/backgrounds scale to the preview.
// ---

function Preview({
  theme,
  className,
  holdStatus,
  onWindow,
}: {
  theme: ReturnType<typeof buildTheme>;
  className?: string;
  holdStatus: "success" | "error" | null;
  onWindow?: (win: Window | null) => void;
}) {
  return (
    <PreviewFrame className={className} onWindow={onWindow}>
      <BallaBlippen
        theme={theme}
        testing
        holdStatus={holdStatus}
        setThemeOverride={() => undefined}
      />
    </PreviewFrame>
  );
}

// Drive the real card reader: BallaBlippen runs in the parent realm and
// listens for key events on the (parent) window, treating Enter as "card
// swiped". A non-empty id => success, empty => error.
const simulateBlipp = (success: boolean) => {
  if (success) {
    for (const ch of "0001112223") {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: ch }));
    }
  }
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
};

// Instruction file shipped inside the zip alongside the assets.
const buildReadme = (
  draft: DraftTheme,
  code: string,
  slug: string,
  missing: string[]
): string => {
  const lines = [
    `Tema: ${draft.name || "unnamed"}`,
    "",
    "1. Packa upp denna zip i projektets rot. Assets hamnar då i",
    `   public/images/${slug}/ och public/sounds/${slug}/.`,
    "2. Klistra in objektet nedan i themes-arrayen i blippen/themes.tsx.",
    "3. Ta bort den här filen.",
    "",
    "--- klistra in i themes.tsx ---",
    "",
    code,
    "",
  ];
  if (missing.length) {
    lines.push(
      "OBS: följande filer refereras men laddades inte upp i den här sessionen",
      "(t.ex. efter en omladdning) och saknas i zip:en — ladda upp dem igen:",
      ...missing.map((p) => `  - public${p}`),
      ""
    );
  }
  return lines.join("\n");
};

// ---
// Main builder
// ---

// Read the persisted draft once, when the (client-only) builder first mounts.
// Seeding state directly avoids a load-effect that would race the save-effect:
// previously the save-effect ran on mount with the still-empty default and
// clobbered the stored draft before the load took effect (doubly so under
// React StrictMode), so edits vanished on reload.
const loadDraft = (): DraftTheme => {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return normalizeDraft(JSON.parse(saved));
  } catch {
    /* ignore */
  }
  return emptyDraft();
};

export default function ThemeBuilder() {
  const [draft, setDraft] = useState<DraftTheme>(loadDraft);
  const [assets, setAssets] = useState<AssetStore>({});
  const [fullscreen, setFullscreen] = useState(false);
  // Pin a status screen so its edits show live without re-clicking "Blippa".
  const [hold, setHold] = useState<"success" | "error" | null>(null);

  // Persist the draft so work survives a refresh.
  // (Uploaded files can't be persisted — their object URLs die on reload.)
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [draft]);

  // Rehydrate uploaded files from IndexedDB so they survive a reload.
  useEffect(() => {
    let cancelled = false;
    idbLoadAssets().then((stored) => {
      if (cancelled) return;
      setAssets((prev) => {
        const next = { ...prev };
        for (const [path, blob] of Object.entries(stored))
          if (!next[path])
            next[path] = { url: URL.createObjectURL(blob), file: blob };
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Free object URLs when leaving the page (only on unmount — revoking on
  // every store change would kill URLs that are still in use).
  const assetsRef = useRef(assets);
  assetsRef.current = assets;
  useEffect(
    () => () =>
      Object.values(assetsRef.current).forEach((a) =>
        URL.revokeObjectURL(a.url)
      ),
    []
  );

  // path -> url, the shape buildTheme expects for the live preview.
  const assetMap = useMemo<AssetMap>(() => {
    const map: AssetMap = {};
    for (const [path, asset] of Object.entries(assets)) map[path] = asset.url;
    return map;
  }, [assets]);

  const theme = useMemo(() => buildTheme(draft, assetMap), [draft, assetMap]);
  const summary = useMemo(() => summarizeDraft(draft), [draft]);

  const slug = slugify(draft.name);

  // Renaming the theme changes the slug, so move every already-uploaded asset
  // (in both the draft and the registry) to the new /images|sounds/<slug>/ dir.
  const renameTheme = (name: string) => {
    const oldSlug = slugify(draft.name);
    const newSlug = slugify(name);
    if (oldSlug === newSlug) {
      setDraft((d) => ({ ...d, name }));
      return;
    }
    setDraft((d) => reslugDraft({ ...d, name }, oldSlug, newSlug));
    setAssets((store) => {
      const next: AssetStore = {};
      for (const [path, asset] of Object.entries(store))
        next[remapSlugPath(path, oldSlug, newSlug)] = asset;
      return next;
    });
    // Mirror the move in IndexedDB (outside the updater — StrictMode runs
    // updaters twice, and side effects in them would double up).
    for (const [path, asset] of Object.entries(assets)) {
      const newPath = remapSlugPath(path, oldSlug, newSlug);
      if (newPath !== path) {
        void idbPutAsset(newPath, asset.file);
        void idbDeleteAsset(path);
      }
    }
  };

  const registerAsset: RegisterAsset = (file, kind) => {
    const dir = kind === "image" ? `/images/${slug}/` : `/sounds/${slug}/`;
    const path = dir + file.name;
    const url = URL.createObjectURL(file);
    setAssets((a) => ({ ...a, [path]: { url, file } }));
    void idbPutAsset(path, file);
    return path;
  };

  const setMain = <K extends keyof MainDraft>(key: K, value: MainDraft[K]) =>
    setDraft((d) => ({ ...d, main: { ...d.main, [key]: value } }));

  const referenced = useMemo(() => referencedAssetPaths(draft), [draft]);
  const missing = referenced.filter((p) => !assets[p]);

  const downloadZip = async () => {
    const entries: ZipEntry[] = [];
    for (const path of referenced) {
      const asset = assets[path];
      if (!asset) continue; // missing files are flagged in the README instead
      const bytes = new Uint8Array(await asset.file.arrayBuffer());
      entries.push({ path: `public${path}`, data: bytes });
    }
    const readme = buildReadme(draft, generateCode(draft), slug, missing);
    entries.push({
      path: `KLISTRA-IN-${slug}.txt`,
      data: new TextEncoder().encode(readme),
    });

    const blob = createZip(entries);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-theme.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewControls = (
    <div className={styles.previewControls}>
      <button type="button" onClick={() => simulateBlipp(true)}>
        Blippa (godkänd)
      </button>
      <button type="button" onClick={() => simulateBlipp(false)}>
        Blippa (nekad)
      </button>
      <button
        type="button"
        data-active={hold === "success"}
        onClick={() => setHold((h) => (h === "success" ? null : "success"))}
      >
        📌 Håll godkänd
      </button>
      <button
        type="button"
        data-active={hold === "error"}
        onClick={() => setHold((h) => (h === "error" ? null : "error"))}
      >
        📌 Håll nekad
      </button>
      <button type="button" onClick={() => setFullscreen((f) => !f)}>
        {fullscreen ? "Stäng helskärm" : "Helskärm"}
      </button>
    </div>
  );

  return (
    <div className={styles.layout}>
      {/* ---------- Form ----------
          Stop key events from reaching window so typing here never
          triggers the preview's card reader. */}
      <div
        className={styles.formPane}
        onKeyDownCapture={(e) => e.stopPropagation()}
      >
        <header className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.brandLogo}
            src="/images/pwa-icon-512.png"
            alt="Sektionscafé Baljan"
          />
          <div>
            <h1 className={styles.heading}>Temabyggaren</h1>
            <p className={styles.tagline}>Mer kaffe åt folket!</p>
          </div>
        </header>
        <div className={styles.garland} aria-hidden />
        <p className={styles.note}>
          Bygg ett tema och se det direkt i förhandsvisningen — precis som det
          kommer se ut på blippen. Allt du gör sparas lokalt i din webbläsare,
          inget laddas upp någonstans. När du är nöjd: klicka{" "}
          <strong>Ladda ner tema (.zip)</strong> och skicka filen till Baljan.
        </p>

        <fieldset className={styles.section}>
          <legend>Tema</legend>
          <TextField
            label="Namn"
            value={draft.name}
            placeholder="mitt-tema-2026"
            onChange={renameTheme}
          />
          <div className={styles.row}>
            <TextField
              label="Aktivt från (ÅÅÅÅ-MM-DD)"
              value={draft.dateStart}
              placeholder="2026-04-13"
              onChange={(v) => setDraft((d) => ({ ...d, dateStart: v }))}
            />
            <TextField
              label="Aktivt till (valfritt)"
              value={draft.dateEnd}
              placeholder="2026-04-19"
              onChange={(v) => setDraft((d) => ({ ...d, dateEnd: v }))}
            />
          </div>
        </fieldset>

        <fieldset className={styles.section}>
          <legend>Huvudskärm</legend>
          <ColorField
            label="Bakgrundsfärg"
            value={draft.main.backgroundColor}
            onChange={(v) => setMain("backgroundColor", v)}
          />
          <BackgroundField
            label="Bakgrund"
            value={draft.main.backgroundImage}
            onChange={(v) => setMain("backgroundImage", v)}
            size={draft.main.backgroundSize}
            onSizeChange={(v) => setMain("backgroundSize", v)}
            blend={draft.main.backgroundBlendMode}
            onBlendChange={(v) => setMain("backgroundBlendMode", v)}
            assets={assets}
            registerAsset={registerAsset}
          />
          <TextField
            label="Titel"
            value={draft.main.title}
            onChange={(v) => setMain("title", v)}
          />
          <ColorField
            label="Titelfärg"
            value={draft.main.titleFontColor}
            onChange={(v) => setMain("titleFontColor", v)}
          />
          <TextField
            label="Infotext"
            value={draft.main.infoText}
            onChange={(v) => setMain("infoText", v)}
          />
          <div className={styles.row}>
            <ColorField
              label="Infotextfärg"
              value={draft.main.infoFontColor}
              onChange={(v) => setMain("infoFontColor", v)}
            />
            <ColorField
              label="Sidfotsfärg"
              value={draft.main.footerFontColor}
              onChange={(v) => setMain("footerFontColor", v)}
            />
          </div>
          <CheckField
            label="Invertera GitHub-loggan (vit)"
            value={draft.main.invertGithub}
            onChange={(v) => setMain("invertGithub", v)}
          />
        </fieldset>

        <StatusEditor
          title="Godkänd-skärm"
          draft={draft.success}
          onChange={(next) => setDraft((d) => ({ ...d, success: next }))}
          assets={assets}
          registerAsset={registerAsset}
        />
        <StatusEditor
          title="Nekad-skärm"
          draft={draft.error}
          onChange={(next) => setDraft((d) => ({ ...d, error: next }))}
          assets={assets}
          registerAsset={registerAsset}
        />

        <fieldset className={styles.section}>
          <legend>Fallande effekt</legend>
          <p className={styles.note}>
            Låter bilder (eller emoji/text) falla ner över blippen — som snö-,
            konfetti- eller kaffebönseffekterna. Ladda upp det som ska falla och
            justera mängd och rörelse nedan.
          </p>
          <CheckField
            label="Aktivera fallande effekt"
            value={draft.snowfall.enabled}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                snowfall: { ...d.snowfall, enabled: v },
              }))
            }
          />
          {draft.snowfall.enabled && (
            <>
              <div className={styles.field}>
                <span>
                  Fallande objekt — uppladdade bilder eller text/emoji
                </span>
                <ItemList
                  items={draft.snowfall.content}
                  onChange={(content) =>
                    setDraft((d) => ({
                      ...d,
                      snowfall: { ...d.snowfall, content },
                    }))
                  }
                  assets={assets}
                  registerAsset={registerAsset}
                />
              </div>
              <div className={styles.row}>
                <NumberField
                  label="Antal (0 = auto)"
                  value={draft.snowfall.count}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      snowfall: { ...d.snowfall, count: v },
                    }))
                  }
                />
                <NumberField
                  label="Storlek"
                  step={0.1}
                  value={draft.snowfall.size}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      snowfall: { ...d.snowfall, size: v },
                    }))
                  }
                />
                <NumberField
                  label="Hastighet"
                  step={0.1}
                  value={draft.snowfall.speed}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      snowfall: { ...d.snowfall, speed: v },
                    }))
                  }
                />
              </div>
              <div className={styles.row}>
                <CheckField
                  label="Omvänd riktning"
                  value={draft.snowfall.reverse}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      snowfall: { ...d.snowfall, reverse: v },
                    }))
                  }
                />
                <CheckField
                  label="Slumpad färgton"
                  value={draft.snowfall.randomHue}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      snowfall: { ...d.snowfall, randomHue: v },
                    }))
                  }
                />
                <CheckField
                  label="Slumpad rotation"
                  value={draft.snowfall.randomRotation}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      snowfall: { ...d.snowfall, randomRotation: v },
                    }))
                  }
                />
              </div>
            </>
          )}
        </fieldset>

        <fieldset className={styles.section}>
          <legend>Exportera</legend>
          {summary.length > 0 ? (
            <>
              <p className={styles.note}>Ändringar mot standardtemat:</p>
              <ul className={styles.summaryList}>
                {summary.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className={styles.note}>
              Inget ändrat ännu — temat motsvarar standard.
            </p>
          )}
          {missing.length > 0 && (
            <p className={styles.warn}>
              {missing.length === 1
                ? "1 uppladdad fil saknas"
                : `${missing.length} uppladdade filer saknas`}{" "}
              (troligen för att webbläsarens sparade data rensats) och kommer
              inte med i zip-filen — ladda upp{" "}
              {missing.length === 1 ? "den" : "dem"} igen.
            </p>
          )}
          <button
            type="button"
            className={styles.copyBtn}
            onClick={downloadZip}
          >
            Ladda ner tema (.zip)
          </button>
          <p className={styles.note}>
            Zip-filen innehåller hela temat — bilder, ljud och inställningar.
            Skicka den till Baljan så läggs temat in i blippen.
          </p>
        </fieldset>

        <button
          type="button"
          className={styles.resetBtn}
          onClick={() => {
            if (confirm("Rensa hela utkastet?")) {
              Object.values(assets).forEach((a) => URL.revokeObjectURL(a.url));
              setDraft(emptyDraft());
              setAssets({});
              void idbClearAssets();
            }
          }}
        >
          Rensa utkast
        </button>
      </div>

      {/* ---------- Preview ---------- */}
      <div className={styles.previewPane}>
        {previewControls}
        <p className={styles.note}>
          Detta är den riktiga blippen i testläge. Använd knapparna (eller
          blippa/skriv ett kortnummer när förhandsvisningen är i fokus) för att
          testa.
        </p>
        {!fullscreen && (
          <div className={styles.previewBox}>
            <Preview theme={theme} className={styles.frame} holdStatus={hold} />
          </div>
        )}
      </div>

      {/* ---------- Fullscreen preview (exact production size) ---------- */}
      {fullscreen && (
        <div className={styles.fullscreen}>
          <Preview
            theme={theme}
            className={styles.frameFull}
            holdStatus={hold}
          />
          <div className={styles.fullscreenControls}>{previewControls}</div>
        </div>
      )}
    </div>
  );
}
