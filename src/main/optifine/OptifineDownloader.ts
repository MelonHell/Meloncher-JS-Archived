import { EventEmitter } from "events";
import * as request from "request";
import fs from "fs";
import path from "path";
import { OptifineVersion } from "./OptifineVersion";
import * as datamanager from "../data_old/datamanager";

export class OptifineDownloader extends EventEmitter {
  async downloadOptifineJar(
    ofVer: OptifineVersion,
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

  getMinecraftVersionName(ofVer: OptifineVersion): string {
    return (
      ofVer["mcversion"].replace(".0", "") +
      "-Optifine_" +
      ofVer["type"] +
      "_" +
      ofVer["patch"]
    );
  }

  async isInstalled(ofVer: OptifineVersion): Promise<boolean> {
    const mcOfVer = this.getMinecraftVersionName(ofVer);
    console.log(mcOfVer);
    return fs.existsSync(datamanager.getPath("minecraft", "versions", mcOfVer));
  }

  downloadAsync(
    url: string,
    directory: string,
    name: string,
    retry: boolean,
    type: string
  ): Promise<boolean> {
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

        totalBytes = parseInt(data.headers["content-length"] + "");
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
