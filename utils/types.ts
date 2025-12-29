import { ReactNode } from "react";

export namespace API {
    export type Theme = {
        name: string;
        title: string;
        data: {
            idle: IdleTheme;
            snowfall?: Snowfall;
            error: StatusTheme;
            success: StatusTheme;
        };
        assets: Array<AssetID>;
    };

    export type Asset = {
        id: AssetID;
        url: string;
        type: "audio" | "image";
    };
}

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
    title: string;
    idle: IdleTheme;
    snowfall?: Snowfall;
    error: StatusTheme;
    success: StatusTheme;
    // assets: Record<AssetID, Asset>;
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
          signedRfid?: string;
          data: {
              message: string | ReactNode;
              success: boolean;
              help_text?: string | ReactNode;
          };
      };

export type ApiResult =
    | {
          success: true;
          paid: number;
          balance: number | "unlimited";
      }
    | {
          success: false;
          message: string;
          signedRfid?: string;
          help_text?: string;
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
