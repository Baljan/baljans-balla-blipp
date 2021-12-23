let lastPlayedAudio: HTMLAudioElement | null = null;

export default class BlippAudio {
  private htmlAudio?: HTMLAudioElement;

  constructor(url: string) {
    // Audio only works in browser context
    this.htmlAudio = typeof window === "undefined" ? undefined : new Audio(url);
  }

  play() {
    if (this.htmlAudio) {
      if (lastPlayedAudio && !lastPlayedAudio.paused) {
        lastPlayedAudio.pause();
        lastPlayedAudio.currentTime = 0;
      }
      lastPlayedAudio = this.htmlAudio;
      this.htmlAudio.play();
    }
  }
}
