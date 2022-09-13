import { ReactNode } from "react";
import BlippAudio from "./blippAudio";

export type ApiResult =
  | {
      success: true;
      paid: number;
      balance: number | "unlimited";
      themeOverride: string;
    }
  | {
      success: false;
      message: string;
      signedRfid?: string;
    };

export type BlippStatus =
  | {
      show: false;
      loading: boolean;
    }
  | {
      show: true;
      loading: false;
      success: boolean;
      theme: StatusScreenTheme;
      message: ReactNode;
      duration: number;
      signedRfid?: string;
    };

export type RegisterCardState = {
  show(signedRfid: string): void;
  status: "hidden" | "shown" | "dismissed";
  remainingTime: number;
  extendTime(seconds: number): void;
  close(): void;
  reset(): void;
  value: string;
};

export interface StatusScreenTheme {
  backgroundColor: string;
  backgroundImage: string;
  backgroundBlendMode: string;
  fontColor: string;
  sound: BlippAudio | null;
  image: React.ReactNode;
}

export interface MainScreenTheme {
  backgroundColor: string;
  backgroundImage: string;
  backgroundBlendMode: string;
  titleFontColor: string;
  infoFontColor: string;
  footerFontColor: string;
  infoText: string;
  title: string;
}

export interface Snowflake {
  content: ReactNode;
  size: number;
  speed: number;
}

export interface Snowfall {
  getFlake: (i: number) => Snowflake;
  count: number;
  reverse: boolean;
  randomHue: boolean;
}

export type MainScreenSelector = () => MainScreenTheme;
export type StatusScreenSelector = () => StatusScreenTheme;
export type SnowfallSelector = () => Snowfall;

export interface Theme {
  name: string;
  shouldApplyToday(): boolean;
  mainScreen: MainScreenSelector;
  successScreen: StatusScreenSelector;
  errorScreen: StatusScreenSelector;
  snowfall?: SnowfallSelector;
}
