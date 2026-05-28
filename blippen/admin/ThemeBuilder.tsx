import React, { useEffect, useMemo, useState } from "react";
import BallaBlippen from "../components/BallaBlippen";
import PreviewFrame from "./PreviewFrame";
import {
  AssetMap,
  DraftTheme,
  MainDraft,
  MultiStrategy,
  StatusDraft,
  buildTheme,
  emptyDraft,
  generateCode,
} from "./draft";
import styles from "./ThemeBuilder.module.css";

const LS_KEY = "theme-builder-draft";

// Register an uploaded file under a public path and hand back that path.
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

function TextAreaField({
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
      <textarea
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
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

// Append newline-separated lines to an existing multiline value.
const appendLines = (current: string, lines: string[]): string => {
  const base = current.trimEnd();
  const joined = lines.join("\n");
  return base ? `${base}\n${joined}` : joined;
};

// ---
// Status screen (success / error) editor
// ---

function StatusEditor({
  title,
  draft,
  onChange,
  registerAsset,
}: {
  title: string;
  draft: StatusDraft;
  onChange: (next: StatusDraft) => void;
  registerAsset: RegisterAsset;
}) {
  const set = <K extends keyof StatusDraft>(key: K, value: StatusDraft[K]) =>
    onChange({ ...draft, [key]: value });

  return (
    <fieldset className={styles.section}>
      <legend>{title}</legend>
      <ColorField
        label="Background color"
        value={draft.backgroundColor}
        onChange={(v) => set("backgroundColor", v)}
      />
      <TextField
        label="Background image / gradient"
        value={draft.backgroundImage}
        placeholder="url(/images/...) or linear-gradient(...) or none"
        onChange={(v) => set("backgroundImage", v)}
      />
      <UploadButton
        label="Upload background image"
        accept="image/*"
        onFiles={(files) => {
          if (files[0])
            set("backgroundImage", `url(${registerAsset(files[0], "image")})`);
        }}
      />
      <ColorField
        label="Font color"
        value={draft.fontColor}
        onChange={(v) => set("fontColor", v)}
      />
      <TextAreaField
        label="Image(s) — one per line (path/url = image, else text/emoji)"
        value={draft.images}
        placeholder={"/images/theme/pic.png\n☕"}
        onChange={(v) => set("images", v)}
      />
      <UploadButton
        label="Upload image(s)"
        accept="image/*"
        onFiles={(files) =>
          set(
            "images",
            appendLines(
              draft.images,
              files.map((f) => registerAsset(f, "image"))
            )
          )
        }
      />
      <TextAreaField
        label="Sound(s) — one path/url per line"
        value={draft.sounds}
        placeholder={"/sounds/theme/yay.mp3"}
        onChange={(v) => set("sounds", v)}
      />
      <UploadButton
        label="Upload sound(s)"
        accept="audio/*"
        onFiles={(files) =>
          set(
            "sounds",
            appendLines(
              draft.sounds,
              files.map((f) => registerAsset(f, "sound"))
            )
          )
        }
      />
      <label className={styles.field}>
        <span>Multiple-item strategy</span>
        <select
          value={draft.strategy}
          onChange={(e) => set("strategy", e.target.value as MultiStrategy)}
        >
          <option value="random">random</option>
          <option value="alternating">alternating</option>
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
  onWindow,
}: {
  theme: ReturnType<typeof buildTheme>;
  className?: string;
  onWindow?: (win: Window | null) => void;
}) {
  return (
    <PreviewFrame className={className} onWindow={onWindow}>
      <BallaBlippen theme={theme} testing setThemeOverride={() => undefined} />
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

// ---
// Main builder
// ---

export default function ThemeBuilder() {
  const [draft, setDraft] = useState<DraftTheme>(emptyDraft);
  const [assets, setAssets] = useState<AssetMap>({});
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load / persist the draft so work survives a refresh.
  // (Uploaded files can't be persisted — their object URLs die on reload.)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setDraft({ ...emptyDraft(), ...JSON.parse(saved) });
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(draft));
    } catch {
      /* ignore */
    }
  }, [draft]);

  // Free object URLs when leaving the page.
  useEffect(
    () => () =>
      Object.values(assets).forEach((url) => URL.revokeObjectURL(url)),
    [assets]
  );

  const theme = useMemo(() => buildTheme(draft, assets), [draft, assets]);
  const code = useMemo(() => generateCode(draft), [draft]);

  const slug =
    (draft.name || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "my-theme";

  const registerAsset: RegisterAsset = (file, kind) => {
    const dir = kind === "image" ? `/images/${slug}/` : `/sounds/${slug}/`;
    const path = dir + file.name;
    const url = URL.createObjectURL(file);
    setAssets((a) => ({ ...a, [path]: url }));
    return path;
  };

  const setMain = <K extends keyof MainDraft>(key: K, value: MainDraft[K]) =>
    setDraft((d) => ({ ...d, main: { ...d.main, [key]: value } }));

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const previewControls = (
    <div className={styles.previewControls}>
      <button type="button" onClick={() => simulateBlipp(true)}>
        Blippa (godkänd)
      </button>
      <button type="button" onClick={() => simulateBlipp(false)}>
        Blippa (nekad)
      </button>
      <button type="button" onClick={() => setFullscreen((f) => !f)}>
        {fullscreen ? "Exit fullscreen" : "Fullscreen"}
      </button>
    </div>
  );

  const uploadedPaths = Object.keys(assets);

  return (
    <div className={styles.layout}>
      {/* ---------- Form ----------
          Stop key events from reaching window so typing here never
          triggers the preview's card reader. */}
      <div
        className={styles.formPane}
        onKeyDownCapture={(e) => e.stopPropagation()}
      >
        <h1 className={styles.heading}>Theme builder</h1>
        <p className={styles.note}>
          Configure the data-driven parts of a theme and preview it in the real
          blipp. When you&apos;re happy, copy the generated code into{" "}
          <code>blippen/themes.tsx</code>. Custom JSX themes (video, animations)
          stay hand-coded.
        </p>

        <fieldset className={styles.section}>
          <legend>Theme</legend>
          <TextField
            label="Name"
            value={draft.name}
            placeholder="my-theme-2026"
            onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
          />
          <div className={styles.row}>
            <TextField
              label="Active from (YYYY-MM-DD)"
              value={draft.dateStart}
              placeholder="2026-04-13"
              onChange={(v) => setDraft((d) => ({ ...d, dateStart: v }))}
            />
            <TextField
              label="Active to (optional)"
              value={draft.dateEnd}
              placeholder="2026-04-19"
              onChange={(v) => setDraft((d) => ({ ...d, dateEnd: v }))}
            />
          </div>
        </fieldset>

        <fieldset className={styles.section}>
          <legend>Main (idle) screen</legend>
          <ColorField
            label="Background color"
            value={draft.main.backgroundColor}
            onChange={(v) => setMain("backgroundColor", v)}
          />
          <TextField
            label="Background image / gradient"
            value={draft.main.backgroundImage}
            placeholder="url(/images/...) or linear-gradient(...) or none"
            onChange={(v) => setMain("backgroundImage", v)}
          />
          <UploadButton
            label="Upload background image"
            accept="image/*"
            onFiles={(files) => {
              if (files[0])
                setMain(
                  "backgroundImage",
                  `url(${registerAsset(files[0], "image")})`
                );
            }}
          />
          <TextField
            label="Title"
            value={draft.main.title}
            onChange={(v) => setMain("title", v)}
          />
          <ColorField
            label="Title font color"
            value={draft.main.titleFontColor}
            onChange={(v) => setMain("titleFontColor", v)}
          />
          <TextField
            label="Info text"
            value={draft.main.infoText}
            onChange={(v) => setMain("infoText", v)}
          />
          <div className={styles.row}>
            <ColorField
              label="Info font color"
              value={draft.main.infoFontColor}
              onChange={(v) => setMain("infoFontColor", v)}
            />
            <ColorField
              label="Footer font color"
              value={draft.main.footerFontColor}
              onChange={(v) => setMain("footerFontColor", v)}
            />
          </div>
          <CheckField
            label="Invert GitHub footer (white)"
            value={draft.main.invertGithub}
            onChange={(v) => setMain("invertGithub", v)}
          />
        </fieldset>

        <StatusEditor
          title="Success screen"
          draft={draft.success}
          onChange={(next) => setDraft((d) => ({ ...d, success: next }))}
          registerAsset={registerAsset}
        />
        <StatusEditor
          title="Error screen"
          draft={draft.error}
          onChange={(next) => setDraft((d) => ({ ...d, error: next }))}
          registerAsset={registerAsset}
        />

        <fieldset className={styles.section}>
          <legend>Falling effect</legend>
          <p className={styles.note}>
            Drops images (or emoji/text) down over the blipp — like the snow,
            confetti or coffee-bean effects. Upload what should fall and tune
            the amount and motion below.
          </p>
          <CheckField
            label="Enable falling effect"
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
              <UploadButton
                label="Upload falling image(s)"
                accept="image/*"
                onFiles={(files) =>
                  setDraft((d) => ({
                    ...d,
                    snowfall: {
                      ...d.snowfall,
                      content: appendLines(
                        d.snowfall.content,
                        files.map((f) => registerAsset(f, "image"))
                      ),
                    },
                  }))
                }
              />
              <TextAreaField
                label="Falling items — one per line (path/url = image, else text/emoji)"
                value={draft.snowfall.content}
                placeholder={"❆\n/images/theme/flake.png"}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    snowfall: { ...d.snowfall, content: v },
                  }))
                }
              />
              <div className={styles.row}>
                <NumberField
                  label="Amount (0 = auto)"
                  value={draft.snowfall.count}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      snowfall: { ...d.snowfall, count: v },
                    }))
                  }
                />
                <NumberField
                  label="Size"
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
                  label="Speed"
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
                  label="Reverse"
                  value={draft.snowfall.reverse}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      snowfall: { ...d.snowfall, reverse: v },
                    }))
                  }
                />
                <CheckField
                  label="Random hue"
                  value={draft.snowfall.randomHue}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      snowfall: { ...d.snowfall, randomHue: v },
                    }))
                  }
                />
                <CheckField
                  label="Random rotation"
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

        {uploadedPaths.length > 0 && (
          <fieldset className={styles.section}>
            <legend>Uploaded files (preview only)</legend>
            <p className={styles.note}>
              These are shown from your browser only. To make the theme work for
              real, drop the files into <code>public</code> at these paths and
              commit them:
            </p>
            <ul className={styles.assetList}>
              {uploadedPaths.map((p) => (
                <li key={p}>
                  {p.startsWith("/images/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={styles.thumb} src={assets[p]} alt="" />
                  ) : (
                    <span className={styles.thumb} aria-hidden>
                      🔊
                    </span>
                  )}
                  <code>public{p}</code>
                </li>
              ))}
            </ul>
          </fieldset>
        )}

        <fieldset className={styles.section}>
          <legend>Generated code (paste into themes.tsx)</legend>
          <button type="button" className={styles.copyBtn} onClick={copyCode}>
            {copied ? "Copied!" : "Copy code"}
          </button>
          <pre className={styles.code}>{code}</pre>
        </fieldset>

        <button
          type="button"
          className={styles.resetBtn}
          onClick={() => {
            if (confirm("Reset the whole draft?")) {
              setDraft(emptyDraft());
              setAssets({});
            }
          }}
        >
          Reset draft
        </button>
      </div>

      {/* ---------- Preview ---------- */}
      <div className={styles.previewPane}>
        {previewControls}
        <p className={styles.note}>
          This is the real blipp running in testing mode. Use the buttons (or
          scan/type a card while the preview is focused) to trigger a blipp.
        </p>
        {!fullscreen && (
          <div className={styles.previewBox}>
            <Preview theme={theme} className={styles.frame} />
          </div>
        )}
      </div>

      {/* ---------- Fullscreen preview (exact production size) ---------- */}
      {fullscreen && (
        <div className={styles.fullscreen}>
          <Preview theme={theme} className={styles.frameFull} />
          <div className={styles.fullscreenControls}>{previewControls}</div>
        </div>
      )}
    </div>
  );
}
