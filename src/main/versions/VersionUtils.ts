import rp from "request-promise";
import { VersionManifest, MinecraftVersion } from "@/main/versions/VersionManifest";

export class VersionUtils {
  snapshotsURL =
    "https://gist.githubusercontent.com/MelonHell/2df2dde087e91b521258bb2f1a313b03/raw/08950ccf0a41c0d72ba86fc93ffa07d32065dc08/snapshots";
  versionManifestURL =
    "https://launchermeta.mojang.com/mc/game/version_manifest.json";

  async getVersionManifest(): Promise<VersionManifest> {
    const data = await rp(this.versionManifestURL);
    return JSON.parse(data);
  }
  async getSnapshots(): Promise<Record<string, Set<string>>> {
    const data = await rp(this.snapshotsURL);
    return JSON.parse(data);
  }

  async getMinor(
    verName: string,
    versionManifest: VersionManifest | null = null,
    snapshots: Record<string, Set<string>> | null = null
  ): Promise<string> {
    if (versionManifest === null)
      versionManifest = await this.getVersionManifest();
    if (snapshots === null) snapshots = await this.getSnapshots();
    let ver: MinecraftVersion | null = null;
    for (const verInfo of versionManifest["versions"]) {
      if (verInfo["id"] === verName) ver = verInfo;
    }
    if (!ver) return "unknown";
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
      subVer = JSON.parse(await rp(ver["url"]))["assets"];
    }
    return subVer;
  }
}
