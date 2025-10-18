import { ReactNode } from "react";

export interface BaseTheme {
    background: {
        content: string;
        blendMode: "normal";
    };
}

export type AssetID = string;
export interface Asset {
    id: AssetID;
    url: string;
    type: "audio" | "image";
}

export interface IdleTheme extends BaseTheme {
    title?: { content: string; fontColor: string };
    subtitle?: {
        content: string;
        fontColor: string;
    };
}

export type StatusTheme = BaseTheme & {
    image: AssetID;
    sounds?: AssetID[];
    fontColor: string;
};

export interface ThemeInfo {
    name: string;
    idle: IdleTheme;
    snowfall?: Snowfall;
    error: StatusTheme;
    success: StatusTheme;
    assets: Record<AssetID, Asset>;
}

export interface Snowfall {
    content: AssetID[];
    count: number;
    randomRotation: boolean;
    size: number;
    speed: number;
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
              help_text?: string | ReactNode;
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
