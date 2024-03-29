import { ReactNode } from "react";

export default class BlippImage {
  private htmlImg?: HTMLImageElement;
  private url: string;

  constructor(url: string) {
    this.url = url;
    // Prefetch image
    this.htmlImg = typeof window === "undefined" ? undefined : new Image();
    if (this.htmlImg) this.htmlImg.src = url;
  }

  getReactNode(): ReactNode {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={this.url} alt="" />;
  }
}
