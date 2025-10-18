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
import useSWR from "swr";
import defaultTheme from "../utils/defaultTheme";
import { getRandomElement } from "./helpers";
import { BlippStatus, StatusTheme, ThemeInfo } from "./types";

interface IThemeContext {
    assets: Map<string, HTMLAudioElement | HTMLImageElement>;
    getVariant: (status: BlippStatus) => StatusTheme | null;
    playSound: (variant: StatusTheme) => void;
    ready: boolean;
    testing: boolean;
    theme: ThemeInfo;
}

const ThemeContext = createContext<IThemeContext>({
    assets: new Map(),
    getVariant: (_) => defaultTheme.success,
    playSound: () => void 0,
    ready: false,
    testing: false,
    theme: defaultTheme,
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [ready, setReady] = useState(false);
    const [theme, setTheme] = useState<ThemeInfo>(defaultTheme);
    const [assets, setAssets] = useState<
        Map<string, HTMLAudioElement | HTMLImageElement>
    >(new Map());
    const searchParams = useSearchParams();

    const testing = searchParams.has("testing");

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

            return null;
        },
        [theme]
    );

    const playSound = useCallback(
        (variant: StatusTheme) => {
            if (variant.sounds) {
                const soundId = getRandomElement(variant.sounds);
                const soundAsset = assets.get(soundId);

                if (soundAsset && soundAsset instanceof HTMLAudioElement) {
                    soundAsset.currentTime = 0.01;
                    soundAsset.play();
                } else {
                    console.debug(`Could not find sound "${soundId}"`);
                }
            }
        },
        [assets]
    );

    useEffect(() => {
        // TODO: Maybe implement fallback. What if data is null, but loading is false
        if (!isLoading && data) {
            setTheme({ ...defaultTheme, ...data });

            console.time("load-assets");
            Promise.all(
                Object.values(data.assets).map((asset) => {
                    return new Promise<
                        [string, HTMLAudioElement | HTMLImageElement]
                    >((resolve) => {
                        switch (asset.type) {
                            case "audio":
                                const audio = new Audio();
                                audio.id = asset.id;
                                audio.src = asset.url;
                                audio.addEventListener(
                                    "canplaythrough",
                                    () => resolve([asset.id, audio]),
                                    { once: true }
                                );
                                audio.addEventListener(
                                    "error",
                                    () => resolve([asset.id, audio]),
                                    {
                                        once: true,
                                    }
                                );
                                break;
                            case "image":
                                const image = new Image();
                                image.id = asset.id;
                                image.src = asset.url;

                                image
                                    .decode()
                                    .finally(() => resolve([asset.id, image]));
                                break;
                        }
                    });
                })
            ).then((loadedAssets) => {
                console.timeEnd("load-assets");
                setAssets(new Map(loadedAssets));
                setTimeout(() => setReady(true), 1e3);
            });
        }
    }, [isLoading, data]);

    return (
        <ThemeContext.Provider
            value={{ assets, getVariant, playSound, ready, theme, testing }}
        >
            {children}
        </ThemeContext.Provider>
    );
};
