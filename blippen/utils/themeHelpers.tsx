import { ReactNode } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import BlippAudio from "./blippAudio";
import { BaljanColors, OtherColors } from "../constants";
import {
  MainScreenSelector,
  MainScreenTheme,
  StatusScreenSelector,
  StatusScreenTheme,
} from "./types";
import { getRandomElement } from "./utils";

// ---
// Types
// Only touch if you know what you are doing.
// ---

type MultiProperty<T> = {
  // Convert all object properties to arrays of the same type.
  [Property in keyof T]: T[Property] | T[Property][];
};

type MultiChooserContext = Readonly<{
  blippCounter: number;
}>;

type StatusScreenThemeOverrides = Partial<MultiProperty<StatusScreenTheme>>;

type GetOne = <K extends keyof StatusScreenTheme, O>(key: K) => O;

type MultiStrategy = "random" | "alternating";
type MultiChooserFunction = <T>(list: T[], context: MultiChooserContext) => T;
type MultiChooserFunctions = Readonly<{
  [K in MultiStrategy]: MultiChooserFunction;
}>;

// ---
// Configure strategies of how to choose between multiple items
// ---

const alternatingChooser: MultiChooserFunction = (list, context) =>
  list[context.blippCounter % list.length];

const multiChooserFunctions: MultiChooserFunctions = {
  random: getRandomElement,
  alternating: alternatingChooser,
};

// ---
// Default values
// ---

const defaultMainScreen: Readonly<MainScreenTheme> = {
  backgroundColor: BaljanColors.BrightBlue,
  backgroundImage: "none",
  backgroundBlendMode: "normal",
  titleFontColor: BaljanColors.Magenta,
  infoFontColor: OtherColors.DarkGray,
  footerFontColor: OtherColors.DarkGray,
  infoText: "",
  title: "Baljans Balla Blipp",
};

const defaultSuccessScreen: Readonly<StatusScreenTheme> = {
  sound: new BlippAudio("/sounds/success.wav"),
  backgroundColor: OtherColors.DarkGreen,
  backgroundImage: "none",
  backgroundBlendMode: "normal",
  fontColor: OtherColors.BrightGreen,
  image: <FaCheck />,
};

const defaultErrorScreen: Readonly<StatusScreenTheme> = {
  sound: new BlippAudio("/sounds/error.wav"),
  backgroundColor: OtherColors.DarkRed,
  backgroundImage: "none",
  backgroundBlendMode: "normal",
  fontColor: OtherColors.BrightRed,
  image: <FaTimes />,
};

// ---
// Status screen factory
// ---

// Internal function to create a status screen
// Called later to create separate default values for success and error.
const makeStatusScreen = (defaults: StatusScreenTheme) => {
  // Return a function to make a status screen factory
  return function (
    overrides: StatusScreenThemeOverrides = {},
    multiStrategy: MultiStrategy = "random"
  ): StatusScreenSelector {
    let blippCounter = 1;

    // Gets one of the configured overrides according to the strategy
    const getOne: GetOne = (key) => {
      const override = overrides[key];
      const multiChooser = multiChooserFunctions[multiStrategy];
      if (override instanceof Array && override.length)
        return multiChooser(override, { blippCounter });
      if (!(override instanceof Array) && override !== undefined) {
        return override;
      }
      return defaults[key];
    };

    // Return a function which should be called each time a status screen should be shown
    return () => {
      blippCounter++;
      return {
        backgroundBlendMode: getOne("backgroundBlendMode"),
        backgroundColor: getOne("backgroundColor"),
        backgroundImage: getOne("backgroundImage"),
        fontColor: getOne("fontColor"),
        image: getOne("image"),
        sound: getOne("sound"),
      };
    };
  };
};

// ---
// Exports
// ---

export const makeSuccessScreen = makeStatusScreen(defaultSuccessScreen);

export const makeErrorScreen = makeStatusScreen(defaultErrorScreen);

export function makeMainScreen(
  overrides: Partial<MainScreenTheme> = {}
): MainScreenSelector {
  return () => ({ ...defaultMainScreen, ...overrides });
}

// TODO: improve snowfall customization
export const makeSnowfall =
  (options: {
    size?: number;
    reverse?: boolean;
    content: ReactNode[];
    randomHue?: boolean;
    count?: number;
    speed?: number;
  }) =>
  () => ({
    count: options.count ?? 10,
    reverse: options.reverse ?? false,
    randomHue: options.randomHue ?? false,
    getFlake: (i: number) => ({
      size: options.size ?? 2,
      speed: options.speed ?? 1,
      content: options.content[i % options.content.length],
    }),
  });
