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
    const [theme, setTheme] = useState<ThemeInfo>(defaultTheme);
    const searchParams = useSearchParams();

    const testing = searchParams.has("testing") !== undefined;

    const themes = searchParams.getAll("theme");
    const themeOverride = themes[0];

    const url = `/api/theme/${themeOverride || "current"}`;
    const { data, error, isLoading, isValidating } = useSWR<ThemeInfo>(
        url,
        (url: string) => axios.get(url).then((res) => res.data)
    );

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

    useEffect(() => {
        // TODO: Maybe implement fallback. What if data is null, but loading is false
        let loaded = 0;

        if (!isLoading && data) {
            setTheme(data);

            for (const asset of Object.values(data.assets)) {
                preload(asset.url, { as: asset.type });
                console.debug(`Loaded ${asset.url}`);

                const assetElement =
                    asset.type == "image" ? new Image() : new Audio();
                assetElement.src = asset.url;
                assetElement.onload = () => {
                    loaded++;

                    if (loaded === Object.values(data.assets).length) {
                        console.debug(
                            "Loaded all but waiting for clean transition..."
                        );
                        setTimeout(() => {
                            console.debug("Ready!");
                            setReady(true);
                        }, 1e3);
                    }
                };
            }
        }
    }, [isLoading, data]);

    return (
        <ThemeContext.Provider value={{ theme, testing, getVariant, ready }}>
            {children}
        </ThemeContext.Provider>
    );
};
