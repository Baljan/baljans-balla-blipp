import type { Metadata, Viewport } from "next";
import { BaljanColors } from "../utils/constants";

import "./globals.css";

export const metadata: Metadata = {
    title: "Baljans Balla Blipp",
    manifest: "/manifest.json",
    appleWebApp: {
        startupImage: "/images/pwa-icon-192.png",
        capable: true,
        statusBarStyle: "black-translucent",
    },
    icons: "/favicon.png",
};

export const viewport: Viewport = {
    initialScale: 1,
    themeColor: BaljanColors.BrightBlue,
    userScalable: false,
    width: "device-width",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="sv">
            <head>
                <link
                    href="https://fonts.googleapis.com/css?family=Nunito&display=swap"
                    rel="stylesheet"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css?family=Lobster&display=swap"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
