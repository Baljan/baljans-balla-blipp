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

// Convert all object properties to arrays of the same type.
type MultiProperty<T> = {
  [Property in keyof T]: T[Property][];
};

const defaultMainScreen: MainScreenTheme = {
  backgroundColor: BaljanColors.BrightBlue,
  backgroundImage: "none",
  backgroundBlendMode: "normal",
  titleFontColor: BaljanColors.Magenta,
  infoFontColor: OtherColors.DarkGray,
  footerFontColor: OtherColors.DarkGray,
};

const defaultSuccessScreen: StatusScreenTheme = {
  sound: new BlippAudio("/sounds/success.wav"),
  backgroundColor: OtherColors.DarkGreen,
  backgroundImage: "none",
  backgroundBlendMode: "normal",
  fontColor: OtherColors.BrightGreen,
  image: <FaCheck />,
};

const defaultErrorScreen: StatusScreenTheme = {
  sound: new BlippAudio("/sounds/error.wav"),
  backgroundColor: OtherColors.DarkRed,
  backgroundImage: "none",
  backgroundBlendMode: "normal",
  fontColor: OtherColors.BrightRed,
  image: <FaTimes />,
};

export function singleMainScreen(
  options: Partial<MainScreenTheme> = {}
): MainScreenSelector {
  return () => Object.assign({}, defaultMainScreen, options);
}
export function singleSuccessScreen(
  options: Partial<StatusScreenTheme> = {}
): StatusScreenSelector {
  return () => Object.assign({}, defaultSuccessScreen, options);
}
export function singleErrorScreen(
  options: Partial<StatusScreenTheme> = {}
): StatusScreenSelector {
  return () => Object.assign({}, defaultErrorScreen, options);
}

const randomizedStatusScreen = (defaults: StatusScreenTheme) =>
  function (
    options: Partial<MultiProperty<StatusScreenTheme>> = {}
  ): StatusScreenSelector {
    return () => {
      const selectedOptions: Partial<StatusScreenTheme> = {};

      if (options.backgroundColor?.length)
        selectedOptions.backgroundColor = getRandomElement(
          options.backgroundColor
        );

      if (options.backgroundImage?.length)
        selectedOptions.backgroundImage = getRandomElement(
          options.backgroundImage
        );

      if (options.backgroundBlendMode?.length)
        selectedOptions.backgroundBlendMode = getRandomElement(
          options.backgroundBlendMode
        );

      if (options.fontColor?.length)
        selectedOptions.fontColor = getRandomElement(options.fontColor);

      if (options.image?.length)
        selectedOptions.image = getRandomElement(options.image);

      if (options.sound?.length)
        selectedOptions.sound = getRandomElement(options.sound);

      return Object.assign({}, defaults, selectedOptions);
    };
  };

export const randomizedSuccessScreen =
  randomizedStatusScreen(defaultSuccessScreen);

export const randomizedErrorScreen = randomizedStatusScreen(defaultErrorScreen);

// TODO: improve snowfall customization
export const alternatingSnowfall =
  (options: { size: number; content: ReactNode[] }) => () => ({
    count: 10,
    getFlake: (i: number) => ({
      size: options.size,
      speed: 1,
      content: options.content[i % options.content.length],
    }),
  });
