import { useEffect, useState } from "react";
import { CARD_REGISTER_URL } from "../constants";
import { RegisterCardState } from "./types";

type StateType = Pick<RegisterCardState, "value" | "remainingTime" | "status">;

export default function useCardRegister(): RegisterCardState {
  const [state, setState] = useState<StateType>({
    remainingTime: 0,
    status: "hidden",
    value: "",
  });

  const show = (signedRfid: string) => {
    setState({
      remainingTime: 15,
      status: "shown",
      value: `${CARD_REGISTER_URL}${signedRfid}`,
    });
  };

  const reset = () => {
    setState({
      remainingTime: 0,
      status: "hidden",
      value: "",
    });
  };

  const close = () => {
    setState({
      remainingTime: 0,
      status: "dismissed",
      value: "",
    });
  };

  // Extend time if still active
  const extendTime = (seconds: number) => {
    setState((prev) => ({
      ...prev,
      remainingTime:
        prev.remainingTime > 0 ? Math.min(prev.remainingTime + seconds, 20) : 0,
    }));
  };

  // Countdown
  useEffect(() => {
    if (state.remainingTime > 0) {
      const timeout = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          remainingTime: Math.max(prev.remainingTime - 1, 0),
          status: prev.remainingTime <= 1 ? "dismissed" : prev.status,
        }));
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [state]);

  return {
    ...state,
    show,
    close,
    reset,
    extendTime,
  };
}
