import React, { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// The blipp screens use position:fixed, 100vh and 12vw — all viewport
// relative. Rendering them inside an iframe gives them their own viewport
// so effects (falling images), backgrounds and the title scale to the
// preview area and look exactly like production at any size.

// The kiosk iPad's screen: it runs full-screen (PWA/standalone, no Safari
// toolbar), so the full 1024x768 is used. We render the iframe at exactly
// this logical size and transform:scale() it to fit the pane, so both vw/vh
// AND absolute px (spinner, max-widths) resolve exactly as on the iPad — a
// pixel-faithful, uniformly scaled mirror rather than a stretched one.
// (The 1024x748 cap in BallaBlippen.module.css only applies to testing mode,
// and FRAME_CSS overrides it here anyway.)
const VIEWPORT_W = 1024;
const VIEWPORT_H = 768;

// Injected into the frame so the blipp fills it (testing mode otherwise
// caps the app to a centred 1024x748 box).
const FRAME_CSS = `
  html, body { margin: 0; height: 100%; }
  [data-testing="true"] {
    max-width: none !important;
    max-height: none !important;
    aspect-ratio: auto !important;
    width: 100vw !important;
    height: 100vh !important;
    margin: 0 !important;
  }
`;

const copyStyles = (src: Document, dest: Document) =>
  src
    .querySelectorAll('style, link[rel="stylesheet"]')
    .forEach((node) => dest.head.appendChild(node.cloneNode(true)));

type Props = {
  className?: string;
  // Receives the frame's own window so the parent can dispatch card-reader
  // key events into it (the reader listens on the frame's window).
  onWindow?: (win: Window | null) => void;
  children: ReactNode;
};

export default function PreviewFrame({ className, onWindow, children }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [scale, setScale] = useState(1);

  // Fit the fixed 1024x748 frame into whatever space the pane gives us,
  // capped at 1:1 so it never blows up past actual iPad size.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const update = () => {
      const { width, height } = wrapper.getBoundingClientRect();
      setScale(Math.min(width / VIEWPORT_W, height / VIEWPORT_H, 1));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const win = iframe?.contentWindow;
    if (!doc || !win) return;

    copyStyles(document, doc);
    const style = doc.createElement("style");
    style.textContent = FRAME_CSS;
    doc.head.appendChild(style);

    // BallaBlippen runs in the parent realm, so its card-reader listens on the
    // parent window — not this frame's. Forward key events the frame receives
    // (e.g. a card scanned while the preview is focused) to the parent.
    const forward = (e: KeyboardEvent) =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: e.key }));
    win.addEventListener("keydown", forward);

    setMountNode(doc.body);
    onWindow?.(win);
    return () => {
      win.removeEventListener("keydown", forward);
      onWindow?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <iframe
        ref={iframeRef}
        title="Blipp preview"
        style={{
          flex: "0 0 auto",
          width: VIEWPORT_W,
          height: VIEWPORT_H,
          border: 0,
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      />
      {mountNode && createPortal(children, mountNode)}
    </div>
  );
}
