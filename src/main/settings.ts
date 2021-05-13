import * as path from "path";
import * as fs from "fs";

const appdata = "E:\\Documents\\Meloncher";

export function getPath(...pathSegments: string[]): string {
  const dir = path.resolve(appdata, ...pathSegments);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getInstancesPath(...pathSegments: string[]): string {
  const dir = path.resolve(appdata, "instances", ...pathSegments);
  // fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getMinecraftPath(...pathSegments: string[]): string {
  const dir = path.resolve(appdata, "minecraft", ...pathSegments);
  // fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getSyncPath(...pathSegments: string[]): string {
  const dir = path.resolve(appdata, "data", ...pathSegments);
  // fs.mkdirSync(dir, { recursive: true });
  return dir;
}
