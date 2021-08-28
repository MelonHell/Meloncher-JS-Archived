import * as datamanager from "@/main/data_old/datamanager";
import {
  getVersionList,
  installOptifine,
  installTask,
  MinecraftVersionBaseInfo,
} from "@xmcl/installer";
import { EventEmitter } from "events";
import { launch, MinecraftLocation, MinecraftPath, ResolvedVersion } from "@xmcl/core";
import { Task } from "@xmcl/task";
import { Optifine } from "@/main/optifine/Optifine";
import { OptifineDownloader } from "@/main/optifine/OptifineDownloader";
import { Authentication, offline } from "@xmcl/user";
import * as sync from "@/main/data_old/sync";
import { ChildProcess } from "child_process";
import * as tmp from "tmp-promise";
import { VersionUtils } from "@/main/versions/VersionUtils";

export class Launcher extends EventEmitter {
  constructor(private versionUtils: VersionUtils) {
    super();
  }
  async launch(
    version: string,
    useOptiFine = true,
    username = "player"
  ): Promise<void> {
    const minor = await this.versionUtils.getMinor(version);
    const minecraftLocation = datamanager.getPath("minecraft");
    const minecraftVersion = (await getVersionList()).versions.find(
      (value) => value.id == version
    );
    if (minecraftVersion) {
      this.emit("progress", { value: 0, text: "Загрузка" });
      await this.installProgress(minecraftVersion, minecraftLocation);
    }
    let fullVersionName = version;
    if (useOptiFine) {
      const optifine = new Optifine();
      const optifineDownloader = new OptifineDownloader();
      optifineDownloader.on("download-status", (status) => {
        this.emit("progress", {
          value: status["current"] / status["total"],
          text: "Загрузка OptiFine",
        });
      });
      const optifineVersion = await optifine.getLatestOptifineVersion(version);
      if (optifineVersion != null) {
        if (await optifineDownloader.isInstalled(optifineVersion)) {
          fullVersionName = optifineDownloader.getMinecraftVersionName(
            optifineVersion
          );
        } else {
          const tempFileOF = await tmp.file();
          await optifineDownloader.downloadOptifineJar(
            optifineVersion,
            tempFileOF.path
          );
          fullVersionName = await installOptifine(
            tempFileOF.path,
            minecraftLocation
          );
        }
      }
    }
    this.emit("progress", { value: -1, text: "" });

    const authOffline: Authentication = offline(username);

    const javaPath = "java";
    const gamePath: string = datamanager.getPath("instances", minor);
    await sync.load(minor);
    const proc: ChildProcess = await launch({
      gameProfile: authOffline.selectedProfile,
      gamePath,
      javaPath,
      version: fullVersionName,
      resourcePath: minecraftLocation,
      nativeRoot: datamanager.getPath("minecraft", "natives", version),
      versionType: "Meloncher",
    });
    proc.on("close", () => {
      console.log("close");
      sync.save(minor);
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
