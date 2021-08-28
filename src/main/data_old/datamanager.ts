import path from "path";

// @ts-ignore
const appdata = path.resolve(process.env.APPDATA, ".meloncher");

export function getPath(...pathSegments: string[]): string {
  return path.join(appdata, ...pathSegments);
}
