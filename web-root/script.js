const urlParams = new URLSearchParams(window.location.search);
const isPWA = urlParams.get("pwa") !== null;
const isTestingEnvironment = urlParams.get("testing") !== null;
const overrideTheme = urlParams.get("theme");

const theme = selectTheme(overrideTheme);

//Animation times
const transitionTime = 300;
const errorDelay = 2300;
const successDelay = 2300;

// ID of the reset timeout. Is used for detecting when success/failed screen is
//displayed and when to abort that if needed.
let resetTimeout = -1;
// Function that should be called when the reset has been done
let callAfterReset = null;
// current audio playing
let currentAudio = null;

// token for auth in PWA version, saved in localStorage as cookies are time-limited on iOS.
if (isPWA && !Cookies.get("token")) {
  const lsToken = localStorage.getItem("token");
  if (!lsToken) {
    const tokenPromptValue = window.prompt(
      "Enter the API token for this location."
    );
    if (tokenPromptValue) {
      Cookies.set("token", tokenPromptValue);
      localStorage.setItem("token", tokenPromptValue);
    }
  } else {
    Cookies.set("token", lsToken);
  }
}

// Elements
const rfidInput = document.getElementById("rfid");
const rfidForm = document.getElementById("form");
const statusMessage = document.getElementById("status-message");
const statusIcon = document.getElementById("status-icon");
const snowflakes = document.getElementById("snowflakes");
const loader = document.getElementById("loader");
const root = document.documentElement;

// Get random element from a list
function getRandomElement(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomNumberBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// Focus the RFID input element
function focusInput() {
  rfidInput.focus();
}

// Never lose focus (by drinking a lot of coffee)
window.addEventListener("load", focusInput);
window.addEventListener("click", focusInput);
window.addEventListener("focus", focusInput);
rfidInput.addEventListener("blur", focusInput);

// Reload every day
const pageLoadedAt = new Date().toDateString();
window.addEventListener(
  "focus",
  () => {
    if (new Date().toDateString() !== pageLoadedAt) {
      window.location.reload();
    }
  },
  false
);

// update loading state
function setLoading(state) {
  if (state) {
    loader.classList.add("loading");
  } else {
    loader.classList.remove("loading");
  }
}

// Reset color variables for displaying default view
function resetColors() {
  root.style.setProperty("--background-color", theme.defaultBackground);
  root.style.setProperty("--main-title-color", theme.defaultTextColor);
  root.style.setProperty("--text-color", theme.infoTextColor);
  root.style.setProperty("--github-color", theme.githubColor);
}
// set default colors
resetColors();

// Add snowflakes according to theme
if (theme.snowflakes) {
  root.style.setProperty("--snowflake-size", theme.snowflakeSize);

  const range = [...Array(10).keys()]; // array of [0, ..., 9]

  const flakes = range.map((i) => {
    const flake = document.createElement("div");
    const flakeInner = document.createElement("div");
    flake.classList.add("snowflake");
    const flakeInput = theme.snowflakes[i % theme.snowflakes.length];
    if (flakeInput instanceof Image) {
      flakeInner.appendChild(flakeInput.cloneNode());
    } else {
      flakeInner.innerText = flakeInput;
    }
    flake.appendChild(flakeInner);

    // TODO: snowflake size variation??
    // set snowflake specific CSS values.
    const fallSpeed = getRandomNumberBetween(7, 12);
    const shakeSpeed = getRandomNumberBetween(2.5, 3.5);
    const fallDelay = getRandomNumberBetween(0, fallSpeed);
    const shakeDelay = getRandomNumberBetween(0, shakeSpeed);
    flake.style.setProperty("--fall-speed", `${fallSpeed}s`);
    flake.style.setProperty("--shake-speed", `${shakeSpeed}s`);
    // Negative delays for instant start.
    flake.style.setProperty("--fall-delay", `-${fallDelay}s`);
    flake.style.setProperty("--shake-delay", `-${shakeDelay}s`);

    return flake;
  });

  snowflakes.innerHTML = "";
  snowflakes.append(...flakes);
}

// Add background according to theme
if (theme.backgroundImage) {
  console.log("cool", theme.backgroundImage.src);
  document.body.style.backgroundImage = `ùrl(${theme.backgroundImage.src})`;
}

// When the scanner has written the rfid code
rfidForm.addEventListener("submit", function (event) {
  event.preventDefault();

  // If the success / failed screen is active
  if (resetTimeout !== -1) {
    clearTimeout(resetTimeout);
    resetBlipp();
  }

  // LiU-card number (or whatever user configured)
  const rfid = rfidInput.value;

  setLoading(true);

  const token = Cookies.get("token");
  // Only send request in live environment.
  if (!isTestingEnvironment) {
    // TODO: change to fetch API
    $.ajax({
      url: "https://www.baljan.org/baljan/do-blipp",
      method: "POST",
      headers: {
        Authorization: "Token " + token,
      },
      data: { id: rfid },
      dataType: "json",
      success: successfulBlipp,
      error: failedBlipp,
    });
  } else {
    // Debug only
    if (rfid !== "") {
      successfulBlipp(
        {
          message: "Testar blippen: " + rfid,
        },
        "success"
      );
    } else {
      failedBlipp({}, "error");
    }
  }

  // Clear input
  rfidInput.value = "";
  rfidInput.setAttribute("disabled", true);
});

// If a status message is being shown, delay function call.
function delayUntilReset(func) {
  if (resetTimeout === -1) {
    // Call instantly
    func();
  } else {
    // Wait to after the reset animation has finished
    callAfterReset = func;
  }
}

function successfulBlipp(data) {
  delayUntilReset(() =>
    statusAnimation({
      sounds: theme.successSounds,
      backgroundColor: theme.successBackground,
      textColor: theme.successTextColor,
      icons: theme.successIcons,
      delay: successDelay,
      message: data && data["message"] ? data["message"] : undefined,
    })
  );
}

function failedBlipp(data) {
  delayUntilReset(() =>
    statusAnimation({
      sounds: theme.errorSounds,
      backgroundColor: theme.errorBackground,
      textColor: theme.errorTextColor,
      icons: theme.errorIcons,
      delay: errorDelay,
      message:
        data && data["responseJSON"] && data["responseJSON"]["message"]
          ? data["responseJSON"]["message"]
          : undefined,
    })
  );
}

function statusAnimation(options) {
  setLoading(false);

  // Play status sound (and cancel previous playback)
  if (currentAudio && !currentAudio.isPaused) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = getRandomElement(options.sounds);
  currentAudio.play();

  const currentIcon = getRandomElement(options.icons);
  // Set status text
  statusMessage.innerHTML = options.message || "Ett fel inträffade";
  // Set status icon
  statusIcon.innerHTML = "";
  if (currentIcon instanceof Image) {
    statusIcon.appendChild(currentIcon);
  } else if (currentIcon.startsWith("glyphicon-")) {
    const iconElem = document.createElement("div");
    iconElem.classList.add("glyphicon", currentIcon);
    statusIcon.appendChild(iconElem);
  } else {
    statusIcon.innerText = currentIcon;
  }

  // Set colors
  root.style.setProperty("--background-color", options.backgroundColor);
  root.style.setProperty("--main-title-color", options.textColor);
  root.style.setProperty("--text-color", options.textColor);
  root.style.setProperty("--status-text-color", options.textColor); // should not be reset on resetColors

  // body gets a class while showing status message.
  document.body.classList.add("showing-status");

  // Re-enable form
  setTimeout(() => {
    rfidInput.removeAttribute("disabled");
    focusInput();
  }, transitionTime);

  // Make sure form resets
  resetTimeout = setTimeout(resetBlipp, options.delay);
}

function resetBlipp() {
  resetColors();

  document.body.classList.remove("showing-status");

  setTimeout(() => {
    resetTimeout = -1;

    // Called when reset is completed
    if (callAfterReset) {
      callAfterReset();
      callAfterReset = null;
    }
  }, transitionTime);
}
