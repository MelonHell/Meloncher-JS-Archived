import { EventEmitter } from "events";
import * as request from "request";
import fs from "fs";
import * as path from "path";

export class Downloader extends EventEmitter {
  constructor(
    private url: string,
    private path: string,
    private retry: boolean
  ) {
    super();
  }
  async start(): Promise<boolean> {
    return await this.downloadAsync(this.url, this.path, this.retry);
  }

  downloadAsync(
    url: string,
    directory: string,
    retry: boolean
  ): Promise<boolean> {
    const baseRequest = request.defaults({
      pool: { maxSockets: 2 },
      timeout: 10000,
    });

    return new Promise<boolean>((resolve) => {
      fs.mkdirSync(path.dirname(directory), { recursive: true });

      const _request = baseRequest(url);

      let receivedBytes = 0;
      let totalBytes = 0;

      _request.on("response", (data) => {
        if (data.statusCode === 404) {
          this.emit(
            "debug",
            `Failed to download ${url} due to: File not found...`
          );
          resolve(false);
        }

        totalBytes = parseInt(data.headers["content-length"] + "");
      });

      _request.on("error", async (error) => {
        this.emit(
          "debug",
          ` Failed to download to ${path} due to\n${error}.` +
            ` Retrying... ${retry}`
        );
        if (retry) await this.downloadAsync(url, directory, false);
        resolve(false);
      });

      _request.on("data", (data) => {
        receivedBytes += data.length;
        this.emit("progress", {
          current: receivedBytes,
          total: totalBytes,
        });
      });

      const file = fs.createWriteStream(directory);
      _request.pipe(file);

      file.once("finish", () => {
        this.emit("success");
        resolve(true);
      });

      file.on("error", async (e) => {
        this.emit(
          "debug",
          `Failed to download to ${directory} due to\n${e}.` +
            ` Retrying... ${retry}`
        );
        if (fs.existsSync(directory)) fs.unlinkSync(directory);
        if (retry) await this.downloadAsync(url, directory, false);
        resolve(false);
      });
    });
  }
}
