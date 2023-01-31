import React from "react";
import { FaTree } from "react-icons/fa";
import BlippAudio from "./utils/blippAudio";
import BlippImage from "./utils/blippImage";
import { BaljanColors, OtherColors } from "./constants";
import {
  makeSnowfall,
  makeErrorScreen,
  makeSuccessScreen,
  makeMainScreen,
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
    mainScreen: makeMainScreen({
      backgroundColor: "#d42426",
      titleFontColor: BaljanColors.White,
      infoFontColor: "rgba(240,240,240, 0.7)",
    }),
    successScreen: makeSuccessScreen({
      image: <FaTree key="dummy" />,
      backgroundColor: "#18802b",
      fontColor: BaljanColors.White,
      sound: [
        new BlippAudio("/sounds/christmas-success.wav"),
        new BlippAudio("/sounds/merry-christmas.mp3"),
      ],
    }),
    errorScreen: makeErrorScreen({
      fontColor: BaljanColors.White,
    }),

    snowfall: makeSnowfall({
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

    mainScreen: makeMainScreen({
      backgroundColor: "#ffc0cb",
      backgroundImage: "url(/images/kyss.jpg)",
      backgroundBlendMode: "soft-light",
    }),
    successScreen: makeSuccessScreen({
      image: "💖",
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
    errorScreen: makeErrorScreen({ image: "💔" }),
    snowfall: makeSnowfall({
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
    successScreen: makeSuccessScreen({
      image: new BlippImage("/images/semla.png"),
    }),

    mainScreen: makeMainScreen({
      infoFontColor: BaljanColors.White,
      footerFontColor: BaljanColors.White,
      backgroundColor: BaljanColors.DarkBlue,
      backgroundImage: "url(/images/semlor.jpg)",
      backgroundBlendMode: "soft-light",
    }),
    errorScreen: makeErrorScreen(),
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
    successScreen: makeSuccessScreen({
      image: new BlippImage("/images/kanelbulle.png"),
      sound: [new BlippAudio("/sounds/Kanelbulle/swedishfika.mp3")],
    }),

    mainScreen: makeMainScreen({
      title: "Baljans balla bullar",
    }),
    errorScreen: makeErrorScreen(),

    snowfall: makeSnowfall({
      content: [new BlippImage("/images/kanelbulle.png")],
      size: 2,
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
        date.getMonth() === 9 &&
        date.getDate() > 18 &&
        date.getDate() < 29 &&
        date.getFullYear() === 2022
      );
    },

    mainScreen: makeMainScreen({
      backgroundImage: `linear-gradient(0deg, ${BaljanColors.BrightBlue} 0%, ${BaljanColors.DarkBlue} 100%)`,
      infoFontColor: BaljanColors.White,
    }),

    successScreen: makeSuccessScreen({
      backgroundImage: `linear-gradient(0deg, ${OtherColors.DarkGreen} 0%, ${BaljanColors.BrightBlue} 150%)`,
      sound: [
        new BlippAudio("/sounds/funny-sounds/cykelklocka.wav"),
        new BlippAudio("/sounds/recruiting/alice.m4a"),
        new BlippAudio("/sounds/recruiting/alla.mp3"),
        new BlippAudio("/sounds/recruiting/dante.m4a"),
        new BlippAudio("/sounds/recruiting/filip.mp3"),
        new BlippAudio("/sounds/funny-sounds/wow.mp3"),
        new BlippAudio("/sounds/funny-sounds/hurra.mp3"),
        new BlippAudio("/sounds/funny-sounds/giggle.mp3"),
        new BlippAudio("/sounds/funny-sounds/clownhorn.wav"),
        new BlippAudio("/sounds/funny-sounds/clownsqueky.wav"),
        new BlippAudio("/sounds/funny-sounds/kid.wav"),
        new BlippAudio("/sounds/funny-sounds/kiss.wav"),
        new BlippAudio("/sounds/funny-sounds/wopi.mp3"),
      ],

      image: [
        new BlippImage("/images/styret-ht22/astrid.png"),
        new BlippImage("/images/styret-ht22/emil.png"),
        new BlippImage("/images/styret-ht22/emma.png"),
        new BlippImage("/images/styret-ht22/gartz.png"),
        new BlippImage("/images/styret-ht22/hanna.png"),
        new BlippImage("/images/styret-ht22/inge.png"),
        new BlippImage("/images/styret-ht22/jesper.png"),
        new BlippImage("/images/styret-ht22/julia.png"),
        new BlippImage("/images/styret-ht22/klara.png"),
        new BlippImage("/images/styret-ht22/klittan.png"),
        new BlippImage("/images/styret-ht22/lukas.png"),
        new BlippImage("/images/styret-ht22/lukasb.png"),
        new BlippImage("/images/styret-ht22/matilda.png"),
        new BlippImage("/images/styret-ht22/molly.png"),
        new BlippImage("/images/styret-ht22/nico.png"),
        new BlippImage("/images/styret-ht22/oliver.png"),
        new BlippImage("/images/styret-ht22/otto.png"),
        new BlippImage("/images/styret-ht22/rosanna.png"),
        new BlippImage("/images/styret-ht22/unn.png"),
        new BlippImage("/images/styret-ht22/vincent.png"),
      ],
    }),

    errorScreen: makeErrorScreen(),

    snowfall: makeSnowfall({
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

    mainScreen: makeMainScreen(),
    successScreen: makeSuccessScreen({
      image: new BlippImage("/images/kaffekrok.png"),
    }),
    errorScreen: makeErrorScreen(),
  },

  // ---
  // Easter
  // ---
  {
    name: "easter",
    shouldApplyToday: () => {
      const date = new Date();
      const easterDay = getEaster(date.getFullYear());
      const weekBfEaster = getEaster(date.getFullYear());
      weekBfEaster.setDate(weekBfEaster.getDate() - 8);

      return date < easterDay && date > weekBfEaster;
    },

    mainScreen: makeMainScreen({
      backgroundColor: "#ffc0cb",
      backgroundImage:
        "url(/images/easter/eggs.svg), linear-gradient(-45deg, rgba(249,206,238,1) 0%, rgba(224,205,255,1) 25%, rgba(193,240,251,1) 50%, rgba(220,249,168,1) 75%, rgba(255,235,175,1) 100%)",
    }),
    successScreen: makeSuccessScreen(
      {
        image: [
          new BlippImage("/images/easter/jesus.png"),
          new BlippImage("/images/easter/jesustwo.png"),
          new BlippImage("/images/easter/nico-tema.png"),
          new BlippImage("/images/easter/Fridis-2.png"),
          new BlippImage("/images/easter/bunny.png"),
          new BlippImage("/images/easter/oliverJesus.png"),
          new BlippImage("/images/easter/chicken.png"),
        ],
        sound: [
          new BlippAudio("/sounds/easter/lukas.m4a"),
          new BlippAudio("/sounds/easter/tredjedagen.m4a"),
          new BlippAudio("/sounds/easter/nicokyckling.m4a"),
          new BlippAudio("/sounds/easter/holyMusic.mp3"),
          new BlippAudio("/sounds/easter/Mouth.mp3"),
          new BlippAudio("/sounds/easter/jesusdog.m4a"),
          new BlippAudio("/sounds/easter/noLimit.mp3"),
        ],
        backgroundImage:
          "url(/images/easter/sunshine.png), linear-gradient(-45deg, rgba(249,206,238,1) 0%, rgba(224,205,255,1) 25%, rgba(193,240,251,1) 50%, rgba(220,249,168,1) 75%, rgba(255,235,175,1) 100%)",
        fontColor: BaljanColors.Magenta,
      },
      "alternating"
    ),
    errorScreen: makeErrorScreen({ image: "🍗" }),
    snowfall: makeSnowfall({
      content: [
        "🙏",
        "☕",
        "🐔",
        "🐤",
        "🐣",
        "🍗",
        new BlippImage("/images/easter/must.png"),
      ],
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

    mainScreen: makeMainScreen(),
    successScreen: makeSuccessScreen({
      image: "🐢",
      sound: new BlippAudio("/sounds/funnyturtle.mp3"),
    }),
    errorScreen: makeErrorScreen(),
  },
  //---
  // VSR 2023
  //---

  {
    name: "VSR2023",
    shouldApplyToday: () => {
      const date = new Date();
      return (
        date.getMonth() === 1 &&
        date.getDate() === 2 &&
        date.getFullYear() === 2023
      );
    },
    mainScreen: makeMainScreen({
      title: "",
      titleFontColor: BaljanColors.White,
      backgroundImage:
        "url(/images/VSR/heroes/Logga.png), linear-gradient(0deg,rgba(29,61,144,255) 0%, rgba(160,198,221,255) 150%)",
    }),
    successScreen: makeSuccessScreen(
      {
        backgroundImage: `linear-gradient(0deg, ${OtherColors.DarkGreen} 0%, ${BaljanColors.BrightBlue} 150%)`,
        image: [
          new BlippImage("/images/VSR/heroes/hero1.png"),
          new BlippImage("/images/VSR/heroes/hero2.png"),
          new BlippImage("/images/VSR/heroes/hero3.png"),
          new BlippImage("/images/VSR/heroes/hero4.png"),
          new BlippImage("/images/VSR/heroes/hero5.png"),
          new BlippImage("/images/VSR/heroes/hero6.png"),
          new BlippImage("/images/VSR/heroes/hero7.png"),
          new BlippImage("/images/VSR/heroes/hero8.png"),
          new BlippImage("/images/VSR/heroes/hero9.png"),
          new BlippImage("/images/VSR/heroes/hero10.png"),
          new BlippImage("/images/VSR/heroes/hero11.png"),
          new BlippImage("/images/VSR/heroes/hero12.png"),
        ],
        sound: [
          new BlippAudio("/sounds/VSR/pow.mp3"),
          new BlippAudio("/sounds/VSR/trans.mp3"),
          new BlippAudio("/sounds/VSR/slap.mp3"),
          new BlippAudio("/sounds/VSR/bonk.mp3"),
        ],
      },
      "alternating"
    ),
    errorScreen: makeErrorScreen({
      //image: new BlippImage("/images/VSR/evil1"),
      sound: [
        new BlippAudio("/sounds/VSR/evil1.mp3"),
        new BlippAudio("/sounds/VSR/evil2.mp3"),
      ],
    }),
    snowfall: makeSnowfall({
      content: [
        new BlippImage("/images/VSR/pow/boom.png"),
        new BlippImage("/images/VSR/pow/boom1.png"),
        new BlippImage("/images/VSR/pow/kapow.png"),
        new BlippImage("/images/VSR/pow/poof.png"),
        new BlippImage("/images/VSR/pow/pow1.png"),
        new BlippImage("/images/VSR/pow/pow2.png"),
        new BlippImage("/images/VSR/pow/wow.png"),
        new BlippImage("/images/VSR/pow/zap.png"),
      ],
      size: 2,
      randomHue: true,
    }),
  },

  // ---
  // Baljan 35
  // ---
  {
    name: "baljan35",
    shouldApplyToday: () => {
      const date = new Date();
      return (
        date.getMonth() === 8 &&
        date.getFullYear() === 2022 &&
        date.getDate() > 17 &&
        date.getDate() < 22
      );
    },

    mainScreen: makeMainScreen({
      titleFontColor: BaljanColors.Magenta,
      //backgroundColor: "rgb(255, 182, 0)",
      // infoText: "X dagar kvar"

      title: "",
      backgroundImage:
        "url(/images/baljan35/logga.png), linear-gradient(-45deg, rgba(255, 182, 193) 40%, rgba(134,207,240) 60%",
    }),
    successScreen: makeSuccessScreen(
      {
        image: ["🥂", "🎉", "🥳", "🥳", "😁"],
        sound: [
          new BlippAudio("/sounds/baljan35/cheers.mp3"),
          new BlippAudio("/sounds/baljan35/fireworks.mp3"),
          new BlippAudio("/sounds/baljan35/shorthorn.mp3"),
          new BlippAudio("/sounds/baljan35/longhorn.mp3"),
          new BlippAudio("/sounds/baljan35/woohoo.mp3"),
        ],
      },
      "alternating"
    ),
    errorScreen: makeErrorScreen({}),
    snowfall: makeSnowfall({
      content: ["🎈"],
      reverse: true,
      size: 1,
      randomHue: true,
    }),
  },

  // ---
  // Lättöl theme
  // ---
  {
    name: "lattol",
    shouldApplyToday: () => false,

    mainScreen: makeMainScreen({
      title: "Blippa Lättöl 1kr!",
    }),
    successScreen: makeSuccessScreen({
      image: new BlippImage("/images/lattol.png"),
      sound: [new BlippAudio("/sounds/lattol/oppna.m4a")],
      // sound: new BlippAudio("/sounds/funnyturtle.m"),
    }),
    errorScreen: makeErrorScreen(),
  },

  // Queen theme
  // ---
  {
    name: "queen",
    shouldApplyToday: () => {
      const date = new Date();
      return (
        date.getMonth() === 8 &&
        date.getDate() === 9 &&
        date.getFullYear() === 2022
      );
    },

    mainScreen: makeMainScreen({
      title: "",
      titleFontColor: BaljanColors.White,
      backgroundImage: "url(/images/queen/ukEliza.jpg)",
    }),
    successScreen: makeSuccessScreen({
      image: new BlippImage("/images/queen/tea.png"),
    }),
    errorScreen: makeErrorScreen(),
    snowfall: makeSnowfall({
      content: [new BlippImage("/images/queen/corgi.png")],
      size: 1,
    }),
  },
  // kafferepet theme
  // ---
  {
    name: "kafferepet",
    shouldApplyToday: () => {
      const date = new Date();
      return (
        date.getMonth() === 8 &&
        date.getDate() === 16 &&
        date.getFullYear() === 2022
      );
    },

    mainScreen: makeMainScreen({
      title: "",
      titleFontColor: BaljanColors.DarkBlue,
      backgroundImage:
        "url(/images/kafferepet/Baljan.png), linear-gradient(-45deg, rgba(67, 160, 71), rgb(255, 234, 0), rgba(255, 182, 193), rgba(134,207,240)",
    }),
    successScreen: makeSuccessScreen({}),
    errorScreen: makeErrorScreen(),
    snowfall: makeSnowfall({
      content: [
        new BlippImage("/images/kafferepet/cm.png"),
        "❤",
        "☕",
        new BlippImage("/images/kafferepet/baljanlo.png"),
      ],
      size: 1.5,
    }),
  },

  // ---
  // Baljan 35 x brandon
  // ---
  {
    name: "frepub",
    shouldApplyToday: () => {
      const date = new Date();
      return (
        date.getMonth() === 8 &&
        date.getFullYear() === 2022 &&
        date.getDate() == 23
      );
    },

    mainScreen: makeMainScreen({
      titleFontColor: BaljanColors.Magenta,
      //backgroundColor: "rgb(255, 182, 0)",
      // infoText: "X dagar kvar"

      title: "",
      backgroundImage: "url(/images/frepub/frepub.png)",
    }),
    successScreen: makeSuccessScreen({
      backgroundImage:
        "linear-gradient(-45deg, rgba(0, 0, 0), rgba(67, 160, 71), rgba(225, 225, 0), rgba(255, 182, 193)",
      image: new BlippImage("/images/lattol.png"),
      sound: [new BlippAudio("/sounds/lattol/oppna.m4a")],
    }),
    errorScreen: makeErrorScreen({}),
    snowfall: makeSnowfall({
      content: [
        new BlippImage("/images/frepub/danne.png"),
        new BlippImage("/images/frepub/kille1.png"),
        new BlippImage("/images/frepub/kille2.png"),
        new BlippImage("/images/frepub/kille3.png"),
        new BlippImage("/images/frepub/kille4.png"),
      ],
      size: 3,
      randomHue: true,
    }),
  },

  // ---
  // Default theme
  // ---
  // Should always be last to not override other themes
  // ---
  {
    name: "default",
    shouldApplyToday: () => true,
    mainScreen: makeMainScreen(),
    successScreen: makeSuccessScreen(),
    errorScreen: makeErrorScreen(),
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
