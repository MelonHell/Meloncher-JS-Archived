// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import * as rp from "request-promise";
import * as fs from "fs";

const snapshotsURL =
  "https://gist.githubusercontent.com/MelonHell/2df2dde087e91b521258bb2f1a313b03/raw/08950ccf0a41c0d72ba86fc93ffa07d32065dc08/snapshots";
const versionManifestURL =
  "https://launchermeta.mojang.com/mc/game/version_manifest.json";

export async function getSubVer(
  verName: string,
  versionManifest = null,
  snapshots = null
) {
  if (versionManifest === null)
    versionManifest = await getJson(versionManifestURL);
  if (snapshots === null) snapshots = await getJson(snapshotsURL);
  // console.log(verName)
  let ver = {};
  for (const verInfo of versionManifest["versions"]) {
    if (verInfo["id"] === verName) ver = verInfo;
  }
  let subVer = verName;
  if (ver["type"] === "snapshot") {
    Object.entries(snapshots).forEach(([key, value]) => {
      value.forEach((val) => {
        if (subVer === val) subVer = key;
      });
    });
  }
  if (ver["type"] === "release" || ver["type"] === "snapshot") {
    if (subVer.startsWith("1.")) {
      subVer = subVer.split(".")[0] + "." + subVer.split(".")[1];
      if (subVer.includes(" ")) subVer = subVer.split(" ")[0];
      if (subVer.includes("-")) subVer = subVer.split("-")[0];
    }
  }
  if (ver["type"] === "old_beta") subVer = "beta";
  if (ver["type"] === "old_alpha") {
    if (subVer.startsWith("rd-")) subVer = "pre-classic";
    else if (subVer.startsWith("c0.")) subVer = "classic";
    else if (subVer.startsWith("in-")) subVer = "indev";
    else if (subVer.startsWith("inf-")) subVer = "infdev";
    else subVer = "alpha";
  }
  if (ver["type"] === "snapshot" && subVer[2] === "w") {
    subVer = (await getJson(ver["url"]))["assets"];
  }
  return subVer;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export async function versionManifestToList(): Promise<object> {
  if (fs.existsSync("./appdata/versions.json")) {
    const qwe = await fs.promises.readFile("./appdata/versions.json", "utf8");
    return JSON.parse(qwe);
  }
  const list = { release: {}, snapshot: {}, old: {} };
  const versionManifest = await getJson(versionManifestURL);
  const snapshots = await getJson(snapshotsURL);
  for (const ver of versionManifest["versions"]) {
    const subVer = await getSubVer(ver["id"], versionManifest, snapshots);
    if (ver["type"] === "release") {
      if (!(subVer in list["release"])) {
        list["release"][subVer] = [];
      }
      list["release"][subVer].push(ver["id"]);
    }
    if (ver["type"] === "snapshot") {
      if (!(subVer in list["snapshot"])) {
        list["snapshot"][subVer] = [];
      }
      list["snapshot"][subVer].push(ver["id"]);
    }
    if (ver["type"].startsWith("old_")) {
      if (!(subVer in list["old"])) {
        list["old"][subVer] = [];
      }
      list["old"][subVer].push(ver["id"]);
    }
  }
  await fs.promises.writeFile(
    "./appdata/versions.json",
    JSON.stringify(list),
    "utf8"
  );
  return list;
}

// eslint-disable-next-line @typescript-eslint/ban-types
async function getJson(url): Promise<object> {
  const data = await rp(url);
  return JSON.parse(data);
}
