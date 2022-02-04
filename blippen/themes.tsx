import React from "react";
import { FaTree } from "react-icons/fa";
import BlippAudio from "./utils/blippAudio";
import BlippImage from "./utils/blippImage";
import { BaljanColors } from "./constants";
import {
  alternatingSnowfall,
  randomizedSuccessScreen,
  singleErrorScreen,
  singleMainScreen,
  singleSuccessScreen,
} from "./utils/themeHelpers";
import { Theme } from "./utils/types";
import { getSemlaDay } from "./utils/utils";

// TODO: improve BlippImage preload to only load selected theme

// Add any themes to this list.
const themes: Theme[] = [
  // ---
  // Christmas
  // ---
  {
    name: "christmas",
    shouldApplyToday: () => {
      const date = new Date();
      return date.getMonth() === 11; // 11 means december (January is 0)
    },
    mainScreen: singleMainScreen({
      backgroundColor: "#d42426",
      titleFontColor: BaljanColors.White,
      infoFontColor: "rgba(240,240,240, 0.7)",
    }),
    successScreen: randomizedSuccessScreen({
      image: [<FaTree key="dummy" />],
      backgroundColor: ["#18802b"],
      fontColor: [BaljanColors.White],
      sound: [
        new BlippAudio("/sounds/christmas-success.wav"),
        new BlippAudio("/sounds/merry-christmas.mp3"),
      ],
    }),
    errorScreen: singleErrorScreen({
      fontColor: BaljanColors.White,
    }),

    snowfall: alternatingSnowfall({
      content: ["❆", "❅"],
      size: 1,
    }),
  },

  // ---
  // Valentines day
  // ---
  {
    name: "valentine",
    shouldApplyToday: () => {
      const date = new Date();

      return date.getMonth() === 1 && date.getDate() === 14;
    },

    mainScreen: singleMainScreen({
      backgroundColor: "#ffc0cb",
      backgroundImage: "url(/images/kyss.jpg)",
      backgroundBlendMode: "soft-light",
    }),
    successScreen: randomizedSuccessScreen({
      image: ["💖"],
      sound: [
        new BlippAudio("/sounds/valentine/lasse1.mp3"),
        new BlippAudio("/sounds/valentine/lasse2.mp3"),
        new BlippAudio("/sounds/valentine/lasse3.mp3"),
        new BlippAudio("/sounds/valentine/emma.mp3"),
        new BlippAudio("/sounds/valentine/henke.mp3"),
        new BlippAudio("/sounds/valentine/freddan.mp3"),
        new BlippAudio("/sounds/valentine/nico.mp3"),
      ],
    }),
    errorScreen: singleErrorScreen({ image: "💔" }),
    snowfall: alternatingSnowfall({
      content: ["❤", "💕", "❤", "💘", "😘", "❤", "💘", "❤", "❥", "☕"],
      size: 1,
    }),
  },

  // ---
  // Fettisdagen
  // ---
  {
    name: "semla",
    shouldApplyToday: () => {
      const date = new Date();
      const semlaDay = getSemlaDay(date.getFullYear());

      return (
        date.getMonth() === semlaDay.getMonth() &&
        date.getDate() === semlaDay.getDate()
      );
    },
    successScreen: singleSuccessScreen({
      image: new BlippImage("/images/semla.png"),
    }),

    mainScreen: singleMainScreen({
      infoFontColor: BaljanColors.White,
      footerFontColor: BaljanColors.White,
      backgroundColor: BaljanColors.DarkBlue,
      backgroundImage: "url(/images/semlor.jpg)",
      backgroundBlendMode: "soft-light",
    }),
    errorScreen: singleErrorScreen(),
  },

  // ---
  // Kanelbullens dag
  // ---
  {
    name: "kanelbulle",
    shouldApplyToday: () => {
      const date = new Date();
      return date.getMonth() === 9 && date.getDate() === 4;
    },
    successScreen: singleSuccessScreen({
      image: new BlippImage("/images/kanelbulle.png"),
    }),

    mainScreen: singleMainScreen(),
    errorScreen: singleErrorScreen(),

    snowfall: alternatingSnowfall({
      content: [new BlippImage("/images/kanelbulle.png")],
      size: 0.8,
    }),
  },

  // ---
  // Recruiting theme
  // ---
  {
    name: "recruiting",
    shouldApplyToday: () => {
      const date = new Date();
      return date.getMonth() === 9 && date.getFullYear() === 2021;
    },
    // snowflakes = ["Sök", "Baljanstyret"];
    // snowflakeSize = 0.5;

    mainScreen: singleMainScreen({
      backgroundImage:
        "linear-gradient(180deg,rgba(255, 195, 0, 1) 0%, #e6008b 100%)", //"#f70079";
      titleFontColor: BaljanColors.White,
      infoFontColor: BaljanColors.White,
    }),

    successScreen: randomizedSuccessScreen({
      sound: [new BlippAudio("/sounds/cykelklocka.wav")],
      image: [
        new BlippImage("/images/styret-ht21/Albin.png"),
        new BlippImage("/images/styret-ht21/Alma.png"),
        new BlippImage("/images/styret-ht21/Astapasta.png"),
        new BlippImage("/images/styret-ht21/Emil.png"),
        new BlippImage("/images/styret-ht21/Emma.png"),
        new BlippImage("/images/styret-ht21/Frida.png"),
        new BlippImage("/images/styret-ht21/Janne.png"),
        new BlippImage("/images/styret-ht21/Jesper.png"),
        new BlippImage("/images/styret-ht21/Josephine.png"),
        new BlippImage("/images/styret-ht21/Julia.png"),
        new BlippImage("/images/styret-ht21/Klara.png"),
        new BlippImage("/images/styret-ht21/Lasse.png"),
        new BlippImage("/images/styret-ht21/Lukas.png"),
        new BlippImage("/images/styret-ht21/LUKKEP.png"),
        new BlippImage("/images/styret-ht21/Nico.png"),
        new BlippImage("/images/styret-ht21/Oliver.png"),
        new BlippImage("/images/styret-ht21/Rosanna.png"),
        new BlippImage("/images/styret-ht21/Uno.png"),
        new BlippImage("/images/styret-ht21/Henke.png"),
        new BlippImage("/images/styret-ht21/Filippa.png"),
        new BlippImage("/images/styret-ht21/Axel.png"),
      ],
    }),

    errorScreen: singleErrorScreen(),

    snowfall: alternatingSnowfall({
      content: ["Sök", "Baljanstyret"],
      size: 0.5,
    }),
  },

  // ---
  // Kaffekröken
  // ---
  {
    name: "kaffekrok",
    shouldApplyToday: () => {
      const date = new Date();
      return (
        date.getMonth() === 10 &&
        date.getDate() === 18 &&
        date.getFullYear() === 2021
      );
    },

    mainScreen: singleMainScreen(),
    successScreen: singleSuccessScreen({
      image: new BlippImage("/images/kaffekrok.png"),
    }),
    errorScreen: singleErrorScreen(),
  },

  // ---
  // Default theme
  // ---
  // Should always be last to not override other themes
  // ---
  {
    name: "default",
    shouldApplyToday: () => true,
    mainScreen: singleMainScreen(),
    successScreen: singleSuccessScreen(),
    errorScreen: singleErrorScreen(),
  },
];

export function selectTheme(override?: string): Theme {
  if (override) {
    const theme = themes.find((theme) => override === theme.name);
    if (theme) {
      return theme;
    }
  }

  return (
    themes.find((theme) => theme.shouldApplyToday()) ?? themes[themes.length]
  );
}
