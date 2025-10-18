import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from "react";
import { BlippStatus } from "./types";
import { mockBlipp, sendBlipp } from "./BlippAPI";
import { useThemeContext } from "./ThemeContext";

interface IBlippContext {
    doBlipp: (val: string) => void;
    resetStatus: () => void;
    status: BlippStatus;
}

const BlippContext = createContext<IBlippContext>({
    doBlipp: () => void 0,
    resetStatus: () => void 0,
    status: { loading: false, show: false },
});

export const useBlippContext = () => useContext(BlippContext);

export const BlippProvider = ({ children }: { children: ReactNode }) => {
    const { testing } = useThemeContext();

    const [status, setStatus] = useState<BlippStatus>({
        loading: false,
        show: false,
    });

    const doBlipp = useCallback(
        async (val: string) => {
            setStatus({
                show: false,
                loading: true,
            });

            const res = await (testing ? mockBlipp(val) : sendBlipp(val));

            if (res.success) {
                setStatus({
                    loading: false,
                    show: true,
                    data: {
                        success: true,
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
                    },
                });
            } else {
                setStatus({
                    loading: false,
                    show: true,
                    data: {
                        success: false,
                        message: res.message,
                        help_text: res.help_text ?? null,
                    },
                    signedRfid: res.signedRfid,
                });
            }
        },
        [testing]
    );

    const resetStatus = useCallback(() => {
        setStatus({ show: false, loading: false });
    }, []);

    return (
        <BlippContext.Provider value={{ doBlipp, resetStatus, status }}>
            {children}
        </BlippContext.Provider>
    );
};
