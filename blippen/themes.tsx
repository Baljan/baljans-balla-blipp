import React from "react";
import { FaTree } from "react-icons/fa";
import BlippAudio from "./utils/blippAudio";
import BlippImage from "./utils/blippImage";
import { BaljanColors, OtherColors } from "./constants";
import {
  alternatingSnowfall,
  alternatingSuccessScreen,
  randomizedSuccessScreen,
  singleErrorScreen,
  singleMainScreen,
  singleSuccessScreen,
} from "./utils/themeHelpers";
import { Theme } from "./utils/types";
import { getSemlaDay, getEaster } from "./utils/utils";

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
      return (
        date.getMonth() === 2 &&
        date.getDate() > 13 &&
        date.getDate() < 26 &&
        date.getFullYear() === 2022
      );
    },

    mainScreen: singleMainScreen({
      backgroundImage: `linear-gradient(0deg, #ffb380 0%, ${BaljanColors.BrightBlue} 150%)`,
      infoFontColor: BaljanColors.White,
    }),

    successScreen: randomizedSuccessScreen({
      backgroundImage: [
        `linear-gradient(0deg, ${OtherColors.DarkGreen} 0%, ${BaljanColors.BrightBlue} 150%)`,
      ],
      sound: [
        new BlippAudio("/sounds/cykelklocka.wav"),
        new BlippAudio("/sounds/recruiting/alice.m4a"),
        new BlippAudio("/sounds/recruiting/alla.mp3"),
        new BlippAudio("/sounds/recruiting/dante.m4a"),
      ],

      image: [
        new BlippImage("/images/styret-vt22/Astrid.png"),
        new BlippImage("/images/styret-vt22/Emma.png"),
        new BlippImage("/images/styret-vt22/Frida.png"),
        new BlippImage("/images/styret-vt22/Hanna.png"),
        new BlippImage("/images/styret-vt22/Jesper.png"),
        new BlippImage("/images/styret-vt22/Julia.png"),
        new BlippImage("/images/styret-vt22/LukkeP.png"),
        new BlippImage("/images/styret-vt22/Nico.png"),
        new BlippImage("/images/styret-vt22/Risanna.png"),
        new BlippImage("/images/styret-vt22/Emil.png"),
        new BlippImage("/images/styret-vt22/Filippa.png"),
        new BlippImage("/images/styret-vt22/Gartz.png"),
        new BlippImage("/images/styret-vt22/Henke.png"),
        new BlippImage("/images/styret-vt22/Jossan.png"),
        new BlippImage("/images/styret-vt22/KlaraK.png"),
        new BlippImage("/images/styret-vt22/LasseKlara.png"),
        new BlippImage("/images/styret-vt22/LukasB.png"),
        new BlippImage("/images/styret-vt22/Matilda.png"),
        new BlippImage("/images/styret-vt22/Oliver.png"),
        new BlippImage("/images/styret-vt22/Unn.png"),
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
  {
    name: "easter",
    shouldApplyToday: () => {
      const date = new Date();
      const easterDay = getEaster(date.getFullYear());
      const weekBfEaster = getEaster(date.getFullYear());
      weekBfEaster.setDate(weekBfEaster.getDate() - 8);

      return date < easterDay && date > weekBfEaster;
    },

    mainScreen: singleMainScreen({
      backgroundColor: "#ffc0cb",
      backgroundImage:
        "url(/images/easter/eggs.svg), linear-gradient(-45deg, rgba(249,206,238,1) 0%, rgba(224,205,255,1) 25%, rgba(193,240,251,1) 50%, rgba(220,249,168,1) 75%, rgba(255,235,175,1) 100%)",
    }),
    successScreen: alternatingSuccessScreen({
      image: [
        new BlippImage("/images/easter/jesus.png"),
        new BlippImage("/images/easter/jesustwo.png"),
        new BlippImage("/images/easter/nico-tema.png"),
        new BlippImage("/images/easter/Fridis-2.png"),
        new BlippImage("/images/easter/bunny.png"),
      ],
      sound: [
        new BlippAudio("/sounds/easter/jesusdog.m4a"),
        new BlippAudio("/sounds/easter/tredjedagen.m4a"),
        new BlippAudio("/sounds/easter/nicokyckling.m4a"),
        new BlippAudio("/sounds/easter/holyMusic.mp3"),
        new BlippAudio("/sounds/easter/holyMusic.mp3"),
      ],
      backgroundImage: [
        "url(/images/easter/sunshine.png), linear-gradient(-45deg, rgba(249,206,238,1) 0%, rgba(224,205,255,1) 25%, rgba(193,240,251,1) 50%, rgba(220,249,168,1) 75%, rgba(255,235,175,1) 100%)",
      ],
      fontColor: [BaljanColors.Magenta],
    }),
    errorScreen: singleErrorScreen({ image: "🍗" }),
    snowfall: alternatingSnowfall({
      content: ["🙏", "☕", "🐔", "🐤", "🐣", "🍗"],
      size: 1,
    }),
  },

  // ---
  // Dumb turtle theme
  // ---
  {
    name: "turtle",
    shouldApplyToday: () => {
      const date = new Date();
      return (
        date.getMonth() === 1 &&
        date.getDate() === 4 &&
        date.getFullYear() === 2022
      );
    },

    mainScreen: singleMainScreen(),
    successScreen: singleSuccessScreen({
      image: "🐢",
      sound: new BlippAudio("/sounds/funnyturtle.mp3"),
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
