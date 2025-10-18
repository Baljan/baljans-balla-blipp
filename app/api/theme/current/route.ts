import fs from "fs";
import { NextResponse } from "next/server";
import { join } from "path";

const postsDirectory = join(process.cwd(), "_themes");

// TODO: All this info should in the future come from cafesys maybe

export async function GET(req: Request) {
    const themeNames = ["default", "kaffetsdag"];
    const index = Math.floor(Math.random() * themeNames.length);
    const themeName = themeNames[index];

    const fullPath = join(postsDirectory, `${themeName}.json`);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    return NextResponse.json(JSON.parse(fileContents));
}
