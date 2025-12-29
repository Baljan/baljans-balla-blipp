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
import { API, BlippStatus, StatusTheme, ThemeInfo } from "./types";

const parseBackendUrl = (path: string) =>
    new URL(path, "http://localhost:8000").toString();

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
    const {
        data: resp,
        error,
        isLoading,
        isValidating,
    } = useSWR<API.Theme>(url, (url: string) =>
        axios.get(url).then((res) => res.data)
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
        if (!isLoading && resp) {
            setTheme({ ...defaultTheme, ...resp.data });

            console.time("load-assets");
            Promise.all(
                resp.assets.map((assetId) => {
                    return new Promise<
                        [string, HTMLAudioElement | HTMLImageElement]
                    >(async (resolve) => {
                        const resp = await axios.get<API.Asset>(
                            parseBackendUrl(`/blippen/asset/${assetId}`)
                        );

                        const asset = resp.data;

                        switch (asset.type) {
                            case "audio":
                                const audio = new Audio();
                                audio.id = asset.id;
                                audio.src = parseBackendUrl(asset.url);
                                const onceEvent = () =>
                                    resolve([asset.id, audio]);

                                audio.addEventListener(
                                    "canplaythrough",
                                    onceEvent,
                                    { once: true }
                                );
                                audio.addEventListener("error", onceEvent, {
                                    once: true,
                                });
                                break;
                            case "image":
                                const image = new Image();
                                image.id = asset.id;
                                image.src = parseBackendUrl(asset.url);

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
    }, [isLoading, resp]);

    return (
        <ThemeContext.Provider
            value={{ assets, getVariant, playSound, ready, theme, testing }}
        >
            {children}
        </ThemeContext.Provider>
    );
};
