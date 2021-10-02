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
const maindiv = document.getElementById("maindiv");
const statusMessage = document.getElementById("status-message");
const statusIcon = document.getElementById("status-icon");
const snowflakes = document.getElementById("snowflakes");
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
rfidInput.addEventListener("blur", focusInput);

// Reset color variables for displaying default view
function resetColors() {
  root.style.setProperty("--background-color", theme.defaultBackground);
  root.style.setProperty("--main-title-color", theme.defaultTextColor);
  root.style.setProperty("--text-color", theme.infoTextColor);
  root.style.setProperty("--github-color", theme.infoTextColor);
}
// set default colors
resetColors();

// Add snowflakes according to theme
if (theme.snowflakes) {
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

  // console.log("Sending blipp request for id: " + rfid);

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
          message: "Bra blipp " + rfid,
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
      icon: theme.successIcon,
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
      icon: theme.errorIcon,
      delay: errorDelay,
      message:
        data && data["responseJSON"] && data["responseJSON"]["message"]
          ? data["responseJSON"]["message"]
          : undefined,
    })
  );
}

function statusAnimation(options) {
  // TODO: purpose of "easeOutCubic" vs no ease??
  // should error be more aggressive?

  // Play status sound (and cancel previous playback)
  if (currentAudio && !currentAudio.isPaused) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = getRandomElement(options.sounds);
  currentAudio.play();

  // Set status text
  statusMessage.innerHTML = options.message || "Ett fel inträffade";
  // Set status icon
  statusIcon.innerHTML = "";
  if (options.icon instanceof Image) {
    statusIcon.appendChild(options.icon);
  } else if (options.icon.startsWith("glyphicon-")) {
    const iconElem = document.createElement("div");
    iconElem.classList.add("glyphicon", options.icon);
    statusIcon.appendChild(iconElem);
  } else {
    statusIcon.innerText = options.icon;
  }

  // Set colors
  root.style.setProperty("--background-color", options.backgroundColor);
  root.style.setProperty("--main-title-color", options.textColor);
  root.style.setProperty("--text-color", options.textColor);
  root.style.setProperty("--status-text-color", options.textColor); // should not be reset on resetColors

  // maindiv gets a class while showing status message.
  maindiv.classList.add("showing-status");

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

  maindiv.classList.remove("showing-status");

  setTimeout(() => {
    resetTimeout = -1;

    // Called when reset is completed
    if (callAfterReset) {
      callAfterReset();
      callAfterReset = null;
    }
  }, transitionTime);
}
