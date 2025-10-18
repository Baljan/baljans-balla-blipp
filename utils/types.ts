import { ReactNode } from "react";

export interface BaseTheme {
    backgroundBlendMode?: string;
    backgroundColor?: string;
    backgroundImage?: string;
}

export interface IdleTheme extends BaseTheme {
    infoText?: string;
    title?: string;
}

export type StatusTheme = BaseTheme & {
    sounds?: string[];
};

export interface Asset {
    id: string;
    url: string;
    type: "audio" | "image";
}

export interface ThemeInfo {
    name: string;
    idle: IdleTheme;
    success: StatusTheme;
    error: StatusTheme;
    assets: Asset[];
}

export type BlippStatus =
    | {
          show: false;
          loading: boolean;
      }
    | {
          show: true;
          loading: boolean;
          data: {
              message: string | ReactNode;
              success: boolean;
              // TODO: Implement later
              //help_text?: string | ReactNode
          };
      };

export type ApiResult =
    | {
          success: true;
          paid: number;
          balance: number | "unlimited";
          //   themeOverride: string;
      }
    | {
          success: false;
          message: string;
          //   help_text?: string;
          //   signedRfid?: string;
      };
