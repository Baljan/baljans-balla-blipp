import { ThemeInfo } from "../utils/types";

export default {
    name: "default",
    assets: {
        "success-sound": {
            type: "audio",
            url: "/sounds/success.wav",
            id: "success-sound",
        },
        "error-sound": {
            type: "audio",
            url: "/sounds/error.wav",
            id: "error-sound",
        },
        "success-icon": {
            type: "image",
            url: "/images/check.svg",
            id: "success-icon",
        },
        "error-icon": {
            type: "image",
            url: "/images/times.svg",
            id: "error-icon",
        },
    },
    idle: {
        background: {
            content: "#00a4e0",
            blendMode: "normal",
        },
        title: {
            content: "Baljans Balla Blipp",
            fontColor: "#e6008b",
        },
    },
    error: {
        background: {
            blendMode: "normal",
            content: "#820c0c",
        },
        sounds: ["error-sound"],
        fontColor: "#ff2b2b",
        image: "error-icon",
    },
    success: {
        sounds: ["success-sound"],
        background: {
            blendMode: "normal",
            content: "#00a54c",
        },
        fontColor: "#00F771",
        image: "success-icon",
    },
} as ThemeInfo;
