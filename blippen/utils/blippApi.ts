import axios from "axios";
import Cookies from "js-cookie";
import { TOKEN_KEY_LS, TOKEN_KEY_COOKIE, BLIPP_API_URL } from "../constants";
import { ApiResult } from "./types";
import { getRandomNumberBetween } from "./utils";

// Cookie is to support old app version, remove if only using PWA in the future.

// token for auth in PWA version, saved in localStorage as cookies are time-limited on iOS.
export function setToken(isPWA: boolean) {
  if (isPWA && !Cookies.get(TOKEN_KEY_COOKIE)) {
    const lsToken = localStorage.getItem(TOKEN_KEY_LS);
    if (!lsToken) {
      const tokenPromptValue = window.prompt(
        "Enter the API token for this location."
      );
      if (tokenPromptValue) {
        Cookies.set(TOKEN_KEY_COOKIE, tokenPromptValue);
        localStorage.setItem(TOKEN_KEY_LS, tokenPromptValue);
      }
    } else {
      Cookies.set(TOKEN_KEY_COOKIE, lsToken);
    }
  }
}

export async function sendBlipp(input: string): Promise<ApiResult> {
  const token = Cookies.get(TOKEN_KEY_COOKIE);

  const bodyFormData = new FormData();
  bodyFormData.append("id", input);
  return axios
    .post(BLIPP_API_URL, bodyFormData, {
      headers: {
        Authorization: "Token " + token,
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => {
      // TODO: validate
      const apiRes: ApiResult = {
        success: true,
        balance: res.data.balance as number | "unlimited",
        paid: res.data.paid as number,
      };

      return Promise.resolve(apiRes);
    })
    .catch((e) => {
      let message = "Ett fel inträffade";
      let signedRfid: string | undefined = undefined;
      if (!e.response) {
        message = "Nätverksfel";
      } else {
        if (typeof e.response?.data?.message === "string") {
          message = e.response.data.message;
        }
        if (typeof e.response?.data?.signed_rfid === "string") {
          signedRfid = e.response.data.signed_rfid;
        }
      }
      const apiRes: ApiResult = {
        success: false,
        message,
        signedRfid,
      };
      return Promise.resolve(apiRes);
    });
}

export async function mockBlipp(input: string): Promise<ApiResult> {
  await new Promise((resolve) =>
    setTimeout(resolve, getRandomNumberBetween(50, 400))
  );

  if (input.length) {
    return {
      success: true,
      paid: 0,
      balance: "unlimited",
    };
  }
  return {
    success: false,
    message: "Ett fel inträffade",
  };
}
