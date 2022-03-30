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

type ChooserContext = Readonly<{
  blippCounter: number;
}>;

type ChooserFunction = <T>(list: T[], context: ChooserContext) => T;

const defaultMainScreen: Readonly<MainScreenTheme> = {
  backgroundColor: BaljanColors.BrightBlue,
  backgroundImage: "none",
  backgroundBlendMode: "normal",
  titleFontColor: BaljanColors.Magenta,
  infoFontColor: OtherColors.DarkGray,
  footerFontColor: OtherColors.DarkGray,
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

const multiStatusScreen = (
  defaults: StatusScreenTheme,
  chooser: ChooserFunction
) => {
  let blippCounter = 1;

  return function (
    options: Partial<MultiProperty<StatusScreenTheme>> = {}
  ): StatusScreenSelector {
    return () => {
      const selectedOptions: Partial<StatusScreenTheme> = {};

      const chooserContext: ChooserContext = { blippCounter };

      if (options.backgroundColor?.length)
        selectedOptions.backgroundColor = chooser(
          options.backgroundColor,
          chooserContext
        );

      if (options.backgroundImage?.length)
        selectedOptions.backgroundImage = chooser(
          options.backgroundImage,
          chooserContext
        );

      if (options.backgroundBlendMode?.length)
        selectedOptions.backgroundBlendMode = chooser(
          options.backgroundBlendMode,
          chooserContext
        );

      if (options.fontColor?.length)
        selectedOptions.fontColor = chooser(options.fontColor, chooserContext);

      if (options.image?.length)
        selectedOptions.image = chooser(options.image, chooserContext);

      if (options.sound?.length)
        selectedOptions.sound = chooser(options.sound, chooserContext);

      blippCounter++;

      return Object.assign({}, defaults, selectedOptions);
    };
  };
};

const alternatingChooser: ChooserFunction = (list, context) => list[context.blippCounter % list.length] 

export const alternatingSuccessScreen = multiStatusScreen(
  defaultSuccessScreen,
  alternatingChooser
)

export const alternatingErrorScreen = multiStatusScreen(
  defaultErrorScreen,
  alternatingChooser
)

export const randomizedSuccessScreen = multiStatusScreen(
  defaultSuccessScreen,
  getRandomElement
);

export const randomizedErrorScreen = multiStatusScreen(
  defaultErrorScreen,
  getRandomElement
);


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
