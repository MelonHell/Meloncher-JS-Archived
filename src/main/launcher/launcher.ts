import * as minecraftVersions from "./versions";
import * as settings from "../settings";
import {
  getVersionList,
  installOptifine,
  MinecraftVersionBaseInfo,
  installTask,
} from "@xmcl/installer";
import { Optifine } from "./optifine";
import * as tmp from "tmp-promise";
import { ChildProcess } from "child_process";
import { launch, MinecraftLocation, ResolvedVersion } from "@xmcl/core";
import * as sync from "./sync";
import { Task } from "@xmcl/task";
import { WebContents } from "electron";
import { Authentication, offline } from "@xmcl/user";

export class Launcher {
  private readonly webContents: WebContents;
  constructor(webContents: WebContents) {
    this.webContents = webContents;
  }

  async play(
    version: string,
    useOptiFine = true,
    username = "player"
  ): Promise<void> {
    const instance = await minecraftVersions.getSubVer(version);
    const minecraftLocation = settings.getMinecraftPath();
    const minecraftVersion = (await getVersionList()).versions.find(
      (value) => value.id == version
    );
    if (minecraftVersion == undefined) return;

    this.webContents.send("progress", { value: 0, text: "Загрузка" });

    await this.installProgress(minecraftVersion, minecraftLocation);

    let fullVersionName = minecraftVersion.id;
    if (useOptiFine) {
      const optifine = new Optifine();
      optifine.on("download-status", (status) => {
        this.webContents.send("progress", {
          value: status["current"] / status["total"],
          text: "Загрузка OptiFine",
        });
      });
      const optifineVersion = await optifine.getOptifineVersion(version);
      if (optifineVersion != null) {
        if (await optifine.isInstalled(optifineVersion)) {
          fullVersionName = optifine.getMinecraftVersionName(optifineVersion);
        } else {
          const tempFileOF = await tmp.file();
          await optifine.downloadOptifineJar(optifineVersion, tempFileOF.path);
          fullVersionName = await installOptifine(
            tempFileOF.path,
            minecraftLocation
          );
        }
      }
    }
    this.webContents.send("progress", { value: -1, text: "" });

    const authOffline: Authentication = offline(username);

    const javaPath = "java";
    const gamePath: string = settings.getInstancesPath(instance);
    await sync.load(instance);
    const proc: ChildProcess = await launch({
      gameProfile: authOffline.selectedProfile,
      gamePath,
      javaPath,
      version: fullVersionName,
      resourcePath: minecraftLocation,
      nativeRoot: settings.getMinecraftPath("natives", version),
      versionType: "Meloncher",
    });
    proc.on("close", () => {
      console.log("close");
      sync.save(instance);
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
    const webContents = this.webContents;
    await installAllTask.startAndWait({
      onUpdate() {
        webContents.send("progress", {
          value: installAllTask.progress / installAllTask.total,
          text: "Загрузка Minecraft",
        });
      },
    });
  }
}
