import { useCallback, useState } from "react";
import { ANIMATION_DURATION } from "../constants";
import { mockBlipp, sendBlipp } from "./blippApi";
import { BlippStatus, Theme } from "./types";

export function useBlippApi(theme: Theme, testing: boolean) {
  const [blippStatus, setBlippStatus] = useState<BlippStatus>({
    show: false,
    loading: false,
  });

  const doBlipp = useCallback(
    async (val: string) => {
      console.log("doing blipp");
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
              Du har <b>{res.balance === "unlimited" ? "∞" : res.balance} kr</b>{" "}
              kvar att blippa för
            </span>
          ),
          duration: ANIMATION_DURATION,
        });
      } else {
        setBlippStatus({
          loading: false,
          show: true,
          success: false,
          theme: theme.errorScreen(),
          message: res.message,
          duration: ANIMATION_DURATION,
        });
      }
    },
    [theme, testing]
  );

  const resetBlippStatus = useCallback(() => {
    console.log("reset");
    setBlippStatus({ show: false, loading: false });
  }, []);

  return { doBlipp, blippStatus, resetBlippStatus };
}
