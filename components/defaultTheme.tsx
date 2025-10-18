import { ThemeInfo } from "../utils/types";

export default {
    name: "default",
    idle: {
        backgroundColor: "#00a4e0",
        backgroundImage: "none",
        backgroundBlendMode: "normal",
        titleFontColor: "#e6008b",
        infoFontColor: "#333333",
        footerFontColor: "#333333",
        infoText: "",
        title: "Baljans Balla Blipp",
    },
    success: {
        sounds: ["/sounds/success.wav"],
        backgroundColor: "#00a54c",
        backgroundImage: "none",
        backgroundBlendMode: "normal",
        fontColor: "#00F771",
        image: {
            type: "icon",
            value: "check",
        },
    },
    error: {
        sounds: ["/sounds/error.wav"],
        backgroundColor: "#820c0c",
        backgroundImage: "none",
        backgroundBlendMode: "normal",
        fontColor: "#ff2b2b",
    },
} as ThemeInfo;
