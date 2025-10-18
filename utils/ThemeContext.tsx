import axios from "axios";
import { useSearchParams } from "next/navigation";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { preload } from "react-dom";
import useSWR from "swr";
import defaultTheme from "../components/defaultTheme";
import { BlippStatus, IdleTheme, StatusTheme, ThemeInfo } from "./types";

interface IThemeContext {
    getVariant: (status: BlippStatus) => StatusTheme | IdleTheme;
    ready: boolean;
    testing: boolean;
    theme: ThemeInfo;
}

const ThemeContext = createContext<IThemeContext>({
    getVariant: (_) => ({
        backgroundBlendMode: "hahahaha",
        backgroundColor: "hahahaha",
        backgroundImage: "hahahaha",
    }),
    ready: false,
    testing: false,
    theme: defaultTheme,
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [ready, setReady] = useState(false);
    const searchParams = useSearchParams();

    const testing = searchParams.has("testing") !== undefined;

    const themes = searchParams.getAll("theme");
    const themeOverride = themes[0];

    // const isPWA = searchParams.has("pwa") !== undefined;
    // useEffect(() => setToken(isPWA), [isPWA]);

    const [theme, setTheme] = useState<ThemeInfo>(defaultTheme);

    const getVariant = useCallback(
        (status: BlippStatus) => {
            if (status.show) {
                if (status.data.success) {
                    return theme.success;
                } else if (!status.data.success) {
                    return theme.error;
                }
            }

            return theme.idle;
        },
        [theme]
    );

    const { data, error, isLoading, isValidating } = useSWR<ThemeInfo>(
        `/api/theme/default`,
        (url: string) => axios.get(url).then((res) => res.data)
    );

    useEffect(() => {
        if (!isLoading && data) {
            setTheme(data);
            for (const asset of data.assets) {
                preload(asset.url, { as: asset.type });
                console.debug(`Loaded ${asset.url}`);
            }
            setTimeout(() => setReady(true), 5e3);
            // TODO: Maybe implement fallback. What if data is null, but loading is false
        }
    }, [isLoading, data]);

    return (
        <ThemeContext.Provider value={{ theme, testing, getVariant, ready }}>
            {children}
        </ThemeContext.Provider>
    );
};
