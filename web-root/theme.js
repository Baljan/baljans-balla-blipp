class BaseTheme {
  // Unique name for theme
  static name = "base";

  // ---
  // Colors
  // ---
  // background
  defaultBackground = "#00aae4";
  errorBackground = "#820C0C";
  successBackground = "rgb(0, 165, 76)";
  // text
  defaultTextColor = "#f70079";
  successTextColor = "#00F771";
  errorTextColor = "#FF2b2b";
  infoTextColor = "#333333";

  // ---
  // Background image
  // ---
  // null or Image object
  backgroundImage = null; // NOT IMPLEMENTED

  // ---
  // Sounds
  // ---
  // examples:
  // Choose random:
  // successSounds = [new Audio("sounds/success1.wav"), new Audio("sounds/success2.wav")];
  // No sound:
  // successSounds = [];
  // Same works for errors.
  successSounds = [new Audio("sounds/success.wav")];
  errorSounds = [new Audio("sounds/error.wav")];

  // ---
  // "Snowflakes"
  // ---
  // examples:
  // Repeat pattern (array of text strings and images):
  // snowflakes = ["❄️", "❅", new Image("images/snowflake.png")];
  // No snowflakes:
  snowflakes = null;
  snowflakeSize = 1;
  // TODO: alternate size of flakes?

  // ---
  // Icons
  // ---
  // icons can be of types:
  // - Image object
  // - string with "glyphicon-" prefix for glyphicon
  // - string with text to display (probably emoji)
  successIcons = ["glyphicon-ok"];
  errorIcons = ["glyphicon-remove"];

  // Conditional to decide whether to automatically apply this theme.
  // Will not guarantee application over higher priority themes.
  static shouldApplyToday() {
    return true;
  }
}

class ChristmasTheme extends BaseTheme {
  static name = "christmas";
  successIcons = ["glyphicon-tree-conifer"];
  snowflakes = ["❆", "❅"];
  defaultBackground = "#d42426";
  greenBg = "#18802b";
  defaultTextColor = "#ffffff";
  successTextColor = "#ffffff";
  errorTextColor = "#ffffff";
  infoTextColor = "rgba(240,240,240, 0.7)";
  successSounds = [new Audio("sounds/christmas-success.wav")];

  static shouldApplyToday() {
    const date = new Date();

    return date.getMonth() === 11; // 11 means december (January is 0)
  }
}

class ValentineTheme extends BaseTheme {
  static name = "valentine";
  successIcons = ["💖"];
  errorIcons = ["💔"];
  snowflakes = ["❤", "💕", "❤", "💘", "😘", "❤", "💘", "❤", "❥", "☕"];
  defaultBackground = "#ffc0cb";
  successSounds = [
    new Audio("sounds/lasse1.mp3"),
    new Audio("sounds/lasse2.mp3"),
    new Audio("sounds/lasse3.mp3"),
    new Audio("sounds/lass4.mp3"),
    new Audio("sounds/agge.mp3"),
    new Audio("sounds/emma.mp3"),
    new Audio("sounds/baljan.mp3"),
  ];

  static shouldApplyToday() {
    const date = new Date();

    return date.getMonth() === 1 && date.getDate() === 14;
  }
}

class SemlaTheme extends BaseTheme {
  static name = "semla";
  constructor() {
    super();
    const semla = new Image();
    semla.src = "images/semla.png";
    this.successIcons = [semla];
    this.snowflakes = [semla]; // TODO: alternating size??
  }

  static shouldApplyToday() {
    const date = new Date();
    const semlaDay = getSemlaDay(date.getFullYear());

    return (
      date.getMonth() === semlaDay.getMonth() &&
      date.getDate() === semlaDay.getDate()
    );
  }
}

class KanelbulleTheme extends BaseTheme {
  static name = "kanelbulle";
  constructor() {
    super();
    const bulle = new Image();
    bulle.src = "images/kanelbulle.png";
    this.successIcons = [bulle];
    this.snowflakes = [bulle];
  }

  static shouldApplyToday() {
    const date = new Date();
    return date.getMonth() === 9 && date.getDate() === 4;
  }
}

class RecruitingTheme extends BaseTheme {
  static name = "recruiting";

  snowflakes = ["Sök", "Styrelsen"];
  snowflakeSize = 0.4;

  successSounds = [new Audio("sounds/cykelklocka.wav")];

  constructor() {
    super();

    const styrelsen = [
      "Albin",
      "Alma",
      "Astapasta",
      "Emil",
      "Emma",
      "Frida",
      "Janne",
      "Jesper",
      "Josephine",
      "Julia",
      "Klara",
      "Lasse",
      "Lukas",
      "LUKKEP",
      "Nico",
      "Oliver",
      "Rosanna",
      "Uno",
    ];

    const styrelsenImages = shuffle(styrelsen).map((name) => {
      const person = new Image();
      person.src = `images/styret-ht21/${name}.png`;
      return person;
    });

    this.successIcons = styrelsenImages;
  }

  static shouldApplyToday() {
    return false;
  }
}

// Add any active themes to this list.
const themes = [
  ChristmasTheme,
  ValentineTheme,
  SemlaTheme,
  KanelbulleTheme,
  RecruitingTheme,
];

function selectTheme(override) {
  const OverrideTheme = themes.find((theme) => override === theme.name);
  if (OverrideTheme) {
    return new OverrideTheme();
  }

  const Theme = themes.find((theme) => theme.shouldApplyToday()) || BaseTheme;

  // init instance here to not initialize unnecessary resources.
  return new Theme();
}

// Utility function to get easter day
function getEaster(year) {
  var f = Math.floor,
    // Golden Number - 1
    G = year % 19,
    C = f(year / 100),
    // related to Epact
    H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
    // number of days from 21 March to the Paschal full moon
    I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
    // weekday for the Paschal full moon
    J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
    // number of days from 21 March to the Sunday on or before the Paschal full moon
    L = I - J,
    month = 3 + f((L + 40) / 44),
    day = L + 28 - 31 * f(month / 4);

  return new Date(year, month - 1, day);
}

function getSemlaDay(year) {
  const easterDate = getEaster(year);
  const semlaDate = new Date(easterDate);
  // Semmeldagen is 46 days before easter (which somehow means subtract 47 days)
  semlaDate.setDate(easterDate.getDate() - 47);
  return semlaDate;
}

function shuffle(arr) {
  const newArr = arr.slice();
  for (let i = newArr.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
  }
  return newArr;
}
