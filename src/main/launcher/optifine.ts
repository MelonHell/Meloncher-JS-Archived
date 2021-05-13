import rp from "request-promise";
import * as fs from "fs";
import * as path from "path";
import { EventEmitter } from "events";
import * as request from "request";
import * as settings from "../settings";

class OptiFineVersion {
  public mcversion: string;
  public patch: string;
  public type: string;
  public filename: string;
  constructor(
    mcversion: string,
    patch: string,
    type: string,
    filename: string
  ) {
    this.mcversion = mcversion;
    this.patch = patch;
    this.type = type;
    this.filename = filename;
  }
}

export class Optifine extends EventEmitter {
  async downloadOptifineJar(
    ofVer: OptiFineVersion,
    output: string
  ): Promise<void> {
    const url = "https://optifine.net/download?f=" + ofVer["filename"];
    await this.downloadAsync(
      url,
      path.dirname(output),
      path.basename(output),
      true,
      "optifine"
    );
  }

  async isInstalled(ofVer: OptiFineVersion) {
    const mcOfVer = this.getMinecraftVersionName(ofVer);
    console.log(mcOfVer);
    return fs.existsSync(settings.getMinecraftPath("versions", mcOfVer));
  }

  getMinecraftVersionName(ofVer: OptiFineVersion) {
    return (
      ofVer["mcversion"].replace(".0", "") +
      "-Optifine_" +
      ofVer["type"] +
      "_" +
      ofVer["patch"]
    );
  }

  getPatch(ofVer: OptiFineVersion) {
    let patch = ofVer["patch"];
    if (patch.startsWith("pre")) patch = ofVer["type"].replace("HD_U_", "");
    return patch;
  }
  getPre(ofVer: OptiFineVersion) {
    let pre = ofVer["patch"];
    if (pre.startsWith("pre")) {
      pre = pre.replace("pre", "");
      return parseInt(pre);
    }
    return 999;
  }

  async getOptifineVersion(mcVersion: string) {
    const ofVerList = await this.getOptifineVersionList();
    let latestOfVer = null;
    for (const objectKey of Object.keys(ofVerList)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const ofVer = ofVerList[objectKey];
      if (ofVer["mcversion"].replace(".0", "") == mcVersion) {
        if (latestOfVer == null) latestOfVer = ofVer;
        else {
          const latestPatch = this.getPatch(latestOfVer);
          const thisPatch = this.getPatch(ofVer);
          if (thisPatch > latestPatch) latestOfVer = ofVer;
          else if (thisPatch == latestPatch) {
            const latestPre = this.getPre(latestOfVer);
            const thisPre = this.getPre(ofVer);
            if (thisPre > latestPre) latestOfVer = ofVer;
          }
        }
      }
    }
    return latestOfVer;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  async getOptifineVersionList(): Promise<object> {
    const data = await rp(
      "https://bmclapi2.bangbang93.com/optifine/versionlist/"
    );
    return JSON.parse(data);
  }
/* eslint-disable*/
  downloadAsync(url: string, directory: string, name: string, retry: boolean, type: string) {
    const baseRequest = request.defaults({
      pool: { maxSockets: 2 },
      timeout: 10000,
    });

    return new Promise<boolean>((resolve) => {
      fs.mkdirSync(directory, { recursive: true });

      const _request = baseRequest(url);

      let receivedBytes = 0;
      let totalBytes = 0;

      _request.on("response", (data) => {
        if (data.statusCode === 404) {
          this.emit(
            "debug",
            `[MCLC]: Failed to download ${url} due to: File not found...`
          );
          resolve(false);
        }

        // @ts-ignore
        totalBytes = parseInt(data.headers["content-length"]);
      });

      _request.on("error", async (error) => {
        this.emit(
          "debug",
          `[MCLC]: Failed to download asset to ${path.join(
            directory,
            name
          )} due to\n${error}.` + ` Retrying... ${retry}`
        );
        if (retry) await this.downloadAsync(url, directory, name, false, type);
        resolve(false);
      });

      _request.on("data", (data) => {
        receivedBytes += data.length;
        this.emit("download-status", {
          name: name,
          type: type,
          current: receivedBytes,
          total: totalBytes,
        });
      });

      const file = fs.createWriteStream(path.join(directory, name));
      _request.pipe(file);

      file.once("finish", () => {
        this.emit("download", name);
        resolve(true);
      });

      file.on("error", async (e) => {
        this.emit(
          "debug",
          `[MCLC]: Failed to download asset to ${path.join(
            directory,
            name
          )} due to\n${e}.` + ` Retrying... ${retry}`
        );
        if (fs.existsSync(path.join(directory, name)))
          fs.unlinkSync(path.join(directory, name));
        if (retry) await this.downloadAsync(url, directory, name, false, type);
        resolve(false);
      });
    });
  }
}
