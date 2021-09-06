import fs from "fs";
import { IFilesystem } from "@/main/data/IFilesystem";
import path from "path";
import { JavaDownloader } from "@/main/java/JavaDownloader";
import { Downloader } from "@/main/utils/Downloader";
import * as tmp from "tmp-promise";
import extract from "extract-zip";
import * as url from "url";

export class ZuluJavaDownloader extends JavaDownloader {
  constructor(private filesystem: IFilesystem) {
    super();
  }

  async download(javaType: string): Promise<boolean> {
    if (this.has(javaType)) return false;
    let name = "";
    if (javaType == "java-runtime-alpha") {
      name = "zulu16.32.15-ca-jre16.0.2-win_x64";
    } else if (javaType == "jre-legacy") {
      name = "zulu8.56.0.21-ca-jre8.0.302-win_x64";
    } else {
      return false;
    }
    const url = "https://cdn.azul.com/zulu/bin/" + name + ".zip";
    const tempPath = (await tmp.file()).path;
    const downloader = new Downloader(url, tempPath, true);
    downloader.on("progress", (status) => {
      this.emitProgress(status["current"], status["total"]);
    });
    const result = await downloader.start();
    if (!result) return false;
    await extract(tempPath, {dir: this.filesystem.runtimeDir})
    fs.renameSync(path.join(this.filesystem.runtimeDir, name), path.join(this.filesystem.runtimeDir, javaType));
  }

  has(name: string): boolean {
    return fs.existsSync(
      path.resolve(this.filesystem.runtimeDir, name, "release")
    );
  }

  getPath(javaType: string): string {
    return path.resolve(this.filesystem.runtimeDir, javaType);
  }
}
