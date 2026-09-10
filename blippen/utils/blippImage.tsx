import { CSSProperties, ReactNode } from "react";

export default class BlippImage {
  private htmlImg?: HTMLImageElement;
  private url: string;
  private size: number;

  // size is a multiplier on the image's natural display size (1 = default,
  // 0.7 = 70 %, 1.5 = 150 %). It scales around the bottom centre so a bigger
  // image grows upward instead of overlapping the message below.
  constructor(url: string, size = 1) {
    this.url = url;
    this.size = size;
    // Prefetch image
    this.htmlImg = typeof window === "undefined" ? undefined : new Image();
    if (this.htmlImg) this.htmlImg.src = url;
  }

  getReactNode(): ReactNode {
    const style: CSSProperties =
      this.size !== 1
        ? { transform: `scale(${this.size})`, transformOrigin: "center bottom" }
        : {};
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={this.url} alt="" style={style} />;
  }
}
