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
  // VSR 2024
  // ---
  {
    name: "VSR2024",
    shouldApplyToday: () => {
      const date = new Date();
      return  date.getFullYear() == 2024 && 
              date.getMonth() < 2 &&
              date.getDate() <= 31;
    },
    mainScreen: makeMainScreen({
      title: "",
      backgroundColor: "#000000",
      backgroundImage: "url(/images/VSR2024/VSR3.png)",
      infoFontColor: "rgba(240,240,240, 0.7)",
    }),
    successScreen: makeSuccessScreen({
      image: [
        new BlippImage("images/VSR2024/arryn.png"),
        new BlippImage("images/VSR2024/baratheon.png"),
        new BlippImage("images/VSR2024/greyjoy.png"),
        new BlippImage("images/VSR2024/lannister.png"),
        new BlippImage("images/VSR2024/mormont.png"),
        new BlippImage("images/VSR2024/stark.png"),
        new BlippImage("images/VSR2024/targaryen.png")
      ],

      backgroundColor: "#011910",
      fontColor: BaljanColors.White,
      sound: [
        new BlippAudio("/sounds/VSR2024/Hodor.mp3"),
        new BlippAudio("/sounds/VSR2024/Dracarys.mp3"),
        new BlippAudio("/sounds/VSR2024/Fire-cannot-kill-a-dragon.mp3"),
        new BlippAudio("/sounds/VSR2024/Lannister-sends-their-regards.mp3"),
        new BlippAudio("/sounds/VSR2024/The-things-I-do-for-love.mp3"),
        new BlippAudio("/sounds/VSR2024/Wheres-the-god.mp3"),
        new BlippAudio("/sounds/VSR2024/Winter-is-Coming.mp3"),
      ],
    }),
    errorScreen: makeErrorScreen({
      sound: [
        new BlippAudio("/sounds/VSR2024/A-lannister-always-pays-his-debts.mp3")
      ]
    }),

    snowfall: makeSnowfall({
      content: [
        new BlippImage("images/VSR2024/baljanregn-01.png"),
        new BlippImage("images/VSR2024/baljanregn-02.png"),
        new BlippImage("images/VSR2024/baljanregn-03.png"),
        new BlippImage("images/VSR2024/baljanregn-04.png"),
        new BlippImage("images/VSR2024/baljanregn-05.png"),
        new BlippImage("images/VSR2024/baljanregn-06.png"),
      ],
      size: 3,
      reverse: true,
      count: 4,
    }),
  },

  // ---
  // pi
  // ---
  {
    name: "pi",
    shouldApplyToday: () => {
      const date = new Date();
      return date.getMonth() === 2 && date.getDate() === 14;
    },
    successScreen: makeSuccessScreen({
      image: ["π = 3.1415...","...9265...", "...3589...", "...7932...", "...3846...", "...2643...", "...3832...", "...7950...", "...2884...", "...1971...","...6939...","...9375...","...1058...","...2097...","...4944...","...5923...","...0781...","...6406..."],
    }, "alternating"),

    mainScreen: makeMainScreen(),
    errorScreen: makeErrorScreen(),

    snowfall: makeSnowfall({
      content: [new BlippImage("images/bakelser/pie.png"), ],
      size: 4,
      count: 1,
    }),
  },

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
        new BlippAudio("/sounds/christmas/christmas-success.wav"),
        new BlippAudio("/sounds/christmas/merry-christmas.mp3"),
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
      backgroundImage: "url(/images/valentine/kyss.jpg)",
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
      image: new BlippImage("/images/bakelser/semla.png"),
    }),

    mainScreen: makeMainScreen({
      infoFontColor: BaljanColors.White,
      footerFontColor: BaljanColors.White,
      backgroundColor: BaljanColors.DarkBlue,
      backgroundImage: "url(/images/bakelser/semlor.jpg)",
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
      image: new BlippImage("/images/bakelser/kanelbulle.png"),
      sound: [new BlippAudio("/sounds/Kanelbulle/swedishfika.mp3")],
    }),

    mainScreen: makeMainScreen({
      title: "Baljans balla bullar",
    }),
    errorScreen: makeErrorScreen(),

    snowfall: makeSnowfall({
      content: [new BlippImage("/images/bakelser/kanelbulle.png")],
      size: 2,
    }),
  },

  // ---
  // Chokladbollens dag
  // ---
  {
    name: "chokladboll",
    shouldApplyToday: () => {
      const date = new Date();
      return (
        date.getMonth() === 4 &&
        date.getDate() === 11 &&
        date.getFullYear() === 2023
      );
    },
    mainScreen: makeMainScreen({
      title: "Chokladbollens dag",
      titleFontColor: BaljanColors.White,
    }),
    successScreen: makeSuccessScreen(
      {
        backgroundImage: `linear-gradient(0deg, rgba(228,124,142,255) 0%, ${BaljanColors.BrightBlue} 150%)`,

        image: [new BlippImage("/images/chokladboll/delicatoboll.png")],
        sound: [
          new BlippAudio("/sounds/chokladbollens dag/first.mp3"),
          new BlippAudio("/sounds/success.wav"),
          new BlippAudio("/sounds/chokladbollens dag/davidtackar.mp3"),
          new BlippAudio("/sounds/success.wav"),
        ],
      },
      "alternating"
    ),
    errorScreen: makeErrorScreen(),
    snowfall: makeSnowfall({
      content: [
        new BlippImage("/images/chokladboll/emilMumsar.png"),
        new BlippImage("/images/chokladboll/gott.png"),
        new BlippImage("/images/chokladboll/pärlboll.png"),
        new BlippImage("/images/chokladboll/juanitaChokladbollStor.png"),
        new BlippImage("/images/chokladboll/gigantiskOliver.png"),
        new BlippImage("/images/chokladboll/styrelseChokladboll.png"),
        new BlippImage("/images/chokladboll/styrelseChokladboll2.png"),
        new BlippImage("/images/chokladboll/delicatoboll.png"),
      ],
      size: 1.0,
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
        date.getMonth() === 3 &&
        date.getDate() > 2 &&
        date.getDate() < 9 &&
        date.getFullYear() === 2023
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
        new BlippAudio("/sounds/funny-sounds/wopi.mp3"),
        new BlippAudio("/sounds/baljan35/woohoo.mp3"),
      ],

      image: [
        new BlippImage("/images/styret-vt23/astrid2.png"),
        new BlippImage("/images/styret-vt23/emil.png"),
        new BlippImage("/images/styret-vt23/emma.png"),
        new BlippImage("/images/styret-vt23/erik.png"),
        new BlippImage("/images/styret-vt23/filip2.png"),
        new BlippImage("/images/styret-vt23/frida2.png"),
        new BlippImage("/images/styret-vt23/hlj.png"),
        new BlippImage("/images/styret-vt23/inge.png"),
        new BlippImage("/images/styret-vt23/jesper.png"),
        new BlippImage("/images/styret-vt23/john2.png"),
        new BlippImage("/images/styret-vt23/jossan2.png"),
        new BlippImage("/images/styret-vt23/jullan.png"),
        new BlippImage("/images/styret-vt23/molly.png"),
        new BlippImage("/images/styret-vt23/og.png"),
        new BlippImage("/images/styret-vt23/nico.png"),
        new BlippImage("/images/styret-vt23/oliver.png"),
        new BlippImage("/images/styret-vt23/otto.png"),
        new BlippImage("/images/styret-vt23/rosanna.png"),
        new BlippImage("/images/styret-vt23/unnbonk.png"),
        new BlippImage("/images/styret-vt23/shakira.png"),
        new BlippImage("/images/styret-vt23/vincent.png"),
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
      sound: new BlippAudio("/sounds/funny-sounds/funnyturtle.mp3"),
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
        date.getDate() === 3 &&
        date.getFullYear() === 2023
      );
    },

    mainScreen: makeMainScreen({
      title: "",
      titleFontColor: BaljanColors.White,
      backgroundImage:
        "url(/images/VSR2023/heroes/Logga.png), linear-gradient(0deg,rgba(29,61,144,255) 0%, rgba(160,198,221,255) 150%)",
    }),

    successScreen: makeSuccessScreen(
      {
        backgroundImage: `linear-gradient(0deg, ${OtherColors.DarkGreen} 0%, ${BaljanColors.BrightBlue} 150%)`,
        image: [
          new BlippImage("/images/VSR2023/heroes/hero1.png"),
          new BlippImage("/images/VSR2023/heroes/hero2.png"),
          new BlippImage("/images/VSR2023/heroes/hero3.png"),
          new BlippImage("/images/VSR2023/heroes/hero4.png"),
          new BlippImage("/images/VSR2023/heroes/hero5.png"),
          new BlippImage("/images/VSR2023/heroes/hero6.png"),
          new BlippImage("/images/VSR2023/heroes/hero7.png"),
          new BlippImage("/images/VSR2023/heroes/hero8.png"),
          new BlippImage("/images/VSR2023/heroes/hero9.png"),
          new BlippImage("/images/VSR2023/heroes/hero10.png"),
          new BlippImage("/images/VSR2023/heroes/hero11.png"),
          new BlippImage("/images/VSR2023/heroes/hero12.png"),
        ],
        sound: [
          new BlippAudio("/sounds/VSR2023/pow.mp3"),
          new BlippAudio("/sounds/VSR2023/trans.mp3"),
          new BlippAudio("/sounds/VSR2023/slap.mp3"),
          new BlippAudio("/sounds/VSR2023/bonk.mp3"),
        ],
      },
      "alternating"
    ),
    errorScreen: makeErrorScreen({
      sound: [
        new BlippAudio("/sounds/VSR2023/evil1.mp3"),
        new BlippAudio("/sounds/VSR2023/evil2.mp3"),
      ],
    }),
    snowfall: makeSnowfall({
      content: [
        new BlippImage("/images/VSR2023/pow/boom.png"),
        new BlippImage("/images/VSR2023/pow/boom1.png"),
        new BlippImage("/images/VSR2023/pow/kapow.png"),
        new BlippImage("/images/VSR2023/pow/poof.png"),
        new BlippImage("/images/VSR2023/pow/pow1.png"),
        new BlippImage("/images/VSR2023/pow/pow2.png"),
        new BlippImage("/images/VSR2023/pow/wow.png"),
        new BlippImage("/images/VSR2023/pow/zap.png"),
      ],
      size: 2,
      randomHue: true,
    }),
  },

  // ---
  // UK 2023
  // ---
  {
    name: "UK2023",
    shouldApplyToday: () => {
      const date = new Date();
      return (
        date.getMonth() === 7 &&
        date.getDate() > 2 &&
        date.getDate() < 7 &&
        date.getFullYear() === 2023
      );
    },
    mainScreen: makeMainScreen({
      title: "",
      titleFontColor: BaljanColors.White,
      backgroundImage:
        "url(/images/UK/blomma2.png), linear-gradient(0deg,rgba(228,124,142,255) 0%, rgba(243,212,210,255) 150%)",
    }),

    successScreen: makeSuccessScreen(
      {
        backgroundImage: `linear-gradient(0deg, rgba(228,124,142,255) 0%, ${BaljanColors.BrightBlue} 150%)`,

        image: [new BlippImage("/images/UK/cm_text.png")],
        sound: [
          new BlippAudio("/sounds/UK/tagga.mp3"),
          new BlippAudio("/sounds/UK/kicka-i-huvve.mp3"),
          new BlippAudio("/sounds/UK/tagga.mp3"),
          new BlippAudio("/sounds/UK/eee_aaa.mp3"),
          new BlippAudio("/sounds/UK/va_som_jag.mp3"),
        ],
      },
      "alternating"
    ),
    errorScreen: makeErrorScreen(),

    snowfall: makeSnowfall({
      content: ["TAGGA", "TAGGA", "UK"],
      size: 0.8,
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

  // kafferepet theme
  // ---
  {
    name: "kafferepet",
    shouldApplyToday: () => {
      const date = new Date();
      return (
        date.getMonth() === 8 &&
        date.getDate() === 15 &&
        date.getFullYear() === 2023
      );
    },

    mainScreen: makeMainScreen({
      title: "",
      titleFontColor: BaljanColors.DarkBlue,
      backgroundImage:
        "url(/images/kafferepet/Kafferepbaljan.jpg), linear-gradient(-45deg, rgba(67, 160, 71), rgb(255, 234, 0), rgba(255, 182, 193), rgba(134,207,240)",
    }),
    successScreen: makeSuccessScreen({
      sound: [
        new BlippAudio("/sounds/CM/howdy.mp3"),
        new BlippAudio("/sounds/CM/dra.mp3"),
        new BlippAudio("/sounds/CM/cowboy.mp3"),
        new BlippAudio("/sounds/CM/taggaDraget.mp3"),
        new BlippAudio("/sounds/CM/yee-haw.mp3"),
      ],
    }),
    errorScreen: makeErrorScreen({
      image: [new BlippImage("/images/kafferepet/wanted.png")],
      sound: [new BlippAudio("/sounds/CM/prison.mp3")],
    }),
    snowfall: makeSnowfall({
      content: [
        new BlippImage("/images/kafferepet/cm.png"),
        "❤",
        "☕",
        new BlippImage("/images/kafferepet/baljanlo.png"),
      ],
      size: 1,
    }),
  },
  // ---
  // Dumb coffee theme
  // ---
  {
    name: "coffe",
    shouldApplyToday: () => {
      const date = new Date();
      return (
        date.getMonth() === 8 &&
        date.getDate() === 29 &&
        date.getFullYear() === 2023
      );
    },

    mainScreen: makeMainScreen({
      title: "Kaffets dag, halvet priset!!",
    }),
    successScreen: makeSuccessScreen({
      image: "☕",
      sound: [
        new BlippAudio("/sounds/funny-sounds/funnyturtle.mp3"),
        new BlippAudio("/sounds/kaffetsdag/kaffe1.mp3"),
        new BlippAudio("/sounds/kaffetsdag/kaffe2.mp3"),
        new BlippAudio("/sounds/kaffetsdag/kaffe3.mp3"),
        new BlippAudio("/sounds/kaffetsdag/kaffe4.mp3"),
        new BlippAudio("/sounds/kaffetsdag/kaffe5.mp3"),
        new BlippAudio("/sounds/kaffetsdag/kaffe6.mp3"),
        new BlippAudio("/sounds/kaffetsdag/kaffe7.mp3"),
      ],
    }),
    errorScreen: makeErrorScreen(),
  },

  {
    name: "player",
    shouldApplyToday: () => {
      const date = new Date();
      return (
        date.getMonth() === 10 && date.getDate() > 23 && date.getDate() < 28
      );
    },
    successScreen: makeSuccessScreen({}),

    mainScreen: makeMainScreen({
      title: " ",
      backgroundImage: "url(/images/player.png",
      backgroundColor: "#00000",
    }),
    errorScreen: makeErrorScreen(),
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
