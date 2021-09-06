import {
  getVersionList,
  installOptifine,
  installTask,
  MinecraftVersionBaseInfo,
} from "@xmcl/installer";
import { EventEmitter } from "events";
import { launch, MinecraftLocation, ResolvedVersion } from "@xmcl/core";
import { Task } from "@xmcl/task";
import { Optifine } from "@/main/optifine/Optifine";
import { Authentication, offline } from "@xmcl/user";
import { ChildProcess } from "child_process";
import * as tmp from "tmp-promise";
import { VersionUtils } from "@/main/versions/VersionUtils";
import { IFilesystem } from "@/main/data/IFilesystem";
import path from "path";
import { Sync } from "@/main/data_old/Sync";
import rp from "request-promise";
import { MojangJavaDownloader } from "@/main/java/MojangJavaDownloader";
import { ZuluJavaDownloader } from "@/main/java/ZuluJavaDownloader";

export class Launcher extends EventEmitter {
  constructor(
    private versionUtils: VersionUtils,
    private filesystem: IFilesystem,
    private sync: Sync
  ) {
    super();
  }
  async launch(
    version: string,
    useOptiFine = true,
    username = "player"
  ): Promise<void> {
    const minor = await this.versionUtils.getMinor(version);
    const minecraftLocation = this.filesystem.minecraftDir;
    const minecraftVersion = (await getVersionList()).versions.find(
      (value) => value.id == version
    );
    let javaComponent = "jre-legacy";
    if (minecraftVersion) {
      const minecraftVersionJson = JSON.parse(await rp(minecraftVersion.url));
      if (
        minecraftVersionJson["javaVersion"] &&
        minecraftVersionJson["javaVersion"]["component"]
      ) {
        javaComponent = minecraftVersionJson["javaVersion"]["component"];
      }
      const javaDownloader = new ZuluJavaDownloader(this.filesystem);
      if (!javaDownloader.has(javaComponent)) {
        this.emit("progress", {
          value: 0,
          text: "Загрузка Java (" + javaComponent + ")",
        });
        javaDownloader.on("progress", (status) => {
          this.emit("progress", {
            value: status["current"] / status["total"],
            text: "Загрузка Java (" + javaComponent + ")",
          });
        });
        await javaDownloader.download(javaComponent);
      }
      this.emit("progress", { value: 0, text: "Загрузка" });
      await this.installProgress(minecraftVersion, minecraftLocation);
    }
    let fullVersionName = version;
    if (useOptiFine) {
      const optifine = new Optifine(this.filesystem);
      const optifineVersion = await optifine.getLatestOptifineVersion(version);
      if (optifineVersion != null) {
        if (await optifine.isInstalled(optifineVersion)) {
          fullVersionName = optifine.getMinecraftVersionName(optifineVersion);
        } else {
          const tempFileOF = await tmp.file();
          const optifineDownloader = optifine.downloadOptifineJar(
            optifineVersion,
            tempFileOF.path
          );
          optifineDownloader.on("progress", (status) => {
            this.emit("progress", {
              value: status["current"] / status["total"],
              text: "Загрузка OptiFine",
            });
          });
          await optifineDownloader.start();
          fullVersionName = await installOptifine(
            tempFileOF.path,
            minecraftLocation
          );
        }
      }
    }
    this.emit("progress", { value: -1, text: "" });

    const authOffline: Authentication = offline(username);

    const javaPath = path.resolve(
      this.filesystem.runtimeDir,
      javaComponent,
      "bin/java.exe"
    );
    const gamePath: string = path.resolve(
      this.filesystem.versionProfiles,
      minor
    );
    await this.sync.load(minor);
    const proc: ChildProcess = await launch({
      gameProfile: authOffline.selectedProfile,
      gamePath,
      javaPath,
      version: fullVersionName,
      resourcePath: minecraftLocation,
      nativeRoot: path.resolve(this.filesystem.nativesDir, version),
      versionType: "Meloncher",
    });
    proc.on("close", () => {
      console.log("close");
      this.sync.save(minor);
    });
  }

  async installProgress(
    versionMeta: MinecraftVersionBaseInfo,
    minecraft: MinecraftLocation
  ): Promise<void> {
    const installAllTask: Task<ResolvedVersion> = installTask(
      versionMeta,
      minecraft
    );
    // const emit = this.emit;
    await installAllTask.startAndWait({
      onUpdate: () => {
        this.emit("progress", {
          value: installAllTask.progress / installAllTask.total,
          text: "Загрузка Minecraft",
        });
      },
    });
  }
}
