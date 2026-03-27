import { ReactNode } from "react";
import BlippAudio from "./blippAudio";
import { z } from "zod";

export const ApiResultSchema = z.object({
  balance: z.union([z.number(), z.literal("unlimited")]).optional(),
  themeOverride: z.string().optional(),
  incitement: z.string().optional(),
  message: z.string().optional(),
  help_text: z.string().optional(),
  signedRfid: z.string().optional(),
});

export type ApiResult = z.infer<typeof ApiResultSchema> & { success: boolean };

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
      help_text?: ReactNode;
      incitement?: ReactNode;
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
  title: string | ReactNode | Function;
  invertGithub?: boolean;
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
  randomRotation: boolean;
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
