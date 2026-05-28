import React, { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// The blipp screens use position:fixed, 100vh and 12vw — all viewport
// relative. Rendering them inside an iframe gives them their own viewport
// so effects (falling images), backgrounds and the title scale to the
// preview area and look exactly like production at any size.

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

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
    <>
      <iframe ref={iframeRef} className={className} title="Blipp preview" />
      {mountNode && createPortal(children, mountNode)}
    </>
  );
}
