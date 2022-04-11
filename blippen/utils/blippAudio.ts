export default class BlippAudio {
  private static lastPlayedAudio: HTMLAudioElement | null = null;
  private static uninitializedAudio: HTMLAudioElement[] = [];

  // This needs to be called in connection to user interaction on iOS
  // to allow for free playback later
  static initAll() {
    if (BlippAudio.uninitializedAudio.length) {
      BlippAudio.uninitializedAudio.forEach((audio) => {
        audio.play();
        audio.pause();
        audio.currentTime = 0;
      });

      BlippAudio.uninitializedAudio = [];
    }
  }

  private htmlAudio?: HTMLAudioElement;

  constructor(url: string) {
    // Audio only works in browser context
    this.htmlAudio = typeof window === "undefined" ? undefined : new Audio(url);

    if (this.htmlAudio) {
      BlippAudio.uninitializedAudio.push(this.htmlAudio);
    }
  }

  play() {
    if (this.htmlAudio) {
      if (BlippAudio.lastPlayedAudio && !BlippAudio.lastPlayedAudio.paused) {
        BlippAudio.lastPlayedAudio.pause();
        BlippAudio.lastPlayedAudio.currentTime = 0;
      }
      BlippAudio.lastPlayedAudio = this.htmlAudio;
      this.htmlAudio.currentTime = 0.01;
      this.htmlAudio.play();
    }
  }
}
