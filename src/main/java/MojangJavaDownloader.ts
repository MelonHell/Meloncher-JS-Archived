import rp from "request-promise";
import fs from "fs";
import { IFilesystem } from "@/main/data/IFilesystem";
import path from "path";
// @ts-ignore
import download from "download";
import { EventEmitter } from "events";
import { JavaDownloader } from "@/main/java/JavaDownloader";

export class MojangJavaDownloader extends JavaDownloader {
  constructor(private filesystem: IFilesystem) {
    super();
  }

  json_url =
    "https://launchermeta.mojang.com/v1/products/java-runtime/2ec0cc96c44e5a76b9c8b7c39df7210883d12871/all.json";

  async download(javaType: string): Promise<boolean> {
    if (this.has(javaType)) return false;
    const json_java_all = JSON.parse(await rp(this.json_url));
    const url = json_java_all["windows-x64"][javaType][0]["manifest"]["url"];
    const json = JSON.parse(await rp(url));
    // const keys = Object.keys(json["files"]);
    let id = 0;
    const max = Object.keys(json["files"]).length;
    for (const key in json["files"]) {
      id++;
      const type = json["files"][key]["type"];
      if (type == "directory") {
        fs.mkdirSync(path.resolve(this.filesystem.runtimeDir, javaType, key), {
          recursive: true,
        });
      } else if (type == "file") {
        const file_url = json["files"][key]["downloads"]["raw"]["url"];
        await download(
          file_url,
          path.dirname(path.resolve(this.filesystem.runtimeDir, javaType, key))
        );
        this.emitProgress(id, max);
      }
    }
    return true;
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
