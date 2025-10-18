import { useCallback, useState } from "react";
import { ANIMATION_DURATION } from "../../utils/constants";
import { mockBlipp, sendBlipp } from "./blippApi";
import { BlippStatus, Theme } from "./types";

export function useBlippApi(
    theme: Theme,
    testing: boolean,
    setThemeOverride: (name: string) => void
) {
    const [blippStatus, setBlippStatus] = useState<BlippStatus>({
        show: false,
        loading: false,
    });

    const doBlipp = useCallback(
        async (val: string) => {
            setBlippStatus({
                show: false,
                loading: true,
            });

            const res = await (testing ? mockBlipp(val) : sendBlipp(val));

            if (res.success) {
                setBlippStatus({
                    loading: false,
                    show: true,
                    success: true,
                    theme: theme.successScreen(),
                    message: (
                        <span>
                            Du har{" "}
                            <b>
                                {res.balance === "unlimited"
                                    ? "∞"
                                    : res.balance}{" "}
                                kr
                            </b>{" "}
                            kvar att blippa för
                        </span>
                    ),
                    duration: ANIMATION_DURATION,
                });
                setThemeOverride(res.themeOverride);
            } else {
                setBlippStatus({
                    loading: false,
                    show: true,
                    success: false,
                    theme: theme.errorScreen(),
                    message: res.message,
                    help_text: res.help_text ?? null,
                    duration: res.signedRfid
                        ? ANIMATION_DURATION * 2
                        : ANIMATION_DURATION,
                    signedRfid: res.signedRfid,
                });
            }
        },
        [theme, testing]
    );

    const resetBlippStatus = useCallback(() => {
        setBlippStatus({ show: false, loading: false });
    }, []);

    return { doBlipp, blippStatus, resetBlippStatus };
}
