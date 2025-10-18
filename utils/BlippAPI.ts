import axios from "axios";
import { TOKEN_KEY_LS, BLIPP_API_URL } from "./constants";
import { ApiResult } from "./types";
import { getRandomNumberBetween } from "./helpers";

// token for auth in PWA version, saved in localStorage as cookies are time-limited on iOS.
export function setToken(isPWA: boolean) {
    if (isPWA) {
        const lsToken = localStorage.getItem(TOKEN_KEY_LS);
        if (!lsToken) {
            const tokenPromptValue = window.prompt(
                "Enter the API token for this location."
            );
            if (tokenPromptValue) {
                localStorage.setItem(TOKEN_KEY_LS, tokenPromptValue);
            }
        }
    }
}

export async function sendBlipp(input: string): Promise<ApiResult> {
    const token = localStorage.getItem(TOKEN_KEY_LS) ?? "";

    const bodyFormData = new FormData();
    bodyFormData.append("id", input);
    return axios
        .post(BLIPP_API_URL, bodyFormData, {
            headers: {
                Authorization: `Token ${token}`,
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
            let help_text = undefined;

            if (!e.response) {
                message = "Nätverksfel";
            } else {
                if (typeof e.response?.data?.message === "string") {
                    message = e.response.data.message;
                }
                if (typeof e.response?.data?.help_text === "string") {
                    help_text = e.response.data.help_text;
                }
                if (typeof e.response?.data?.signed_rfid === "string") {
                    signedRfid = e.response.data.signed_rfid;
                }
            }
            const apiRes: ApiResult = {
                success: false,
                message,
                help_text,
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
        help_text: undefined,
    };
}
