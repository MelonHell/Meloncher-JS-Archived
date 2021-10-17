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
import { ZuluJavaDownloader } from "@/main/java/ZuluJavaDownloader";
// @ts-ignore
import { Window, WindowStates } from "win-control";
import { AccountStorage } from "@/main/accounts/AccountStorage";
import { Account } from "@/main/accounts/account/Account";

export class Launcher extends EventEmitter {
  constructor(
    private versionUtils: VersionUtils,
    private filesystem: IFilesystem,
    private sync: Sync
  ) {
    super();
  }
  async launch(version: string, useOptiFine = true, account: Account): Promise<void> {
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
              text: "Загрузка OptiFine (" + optifineVersion.filename + ")",
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

    // const msauth = new MojangAuth();
    // const test: Account = await msauth.auth(
    //   "Ruth.Smith1998j@rambler.ru",
    //   "MarsikLubitSpermu228"
    // );
    // const as = new AccountStorage(this.filesystem);
    // const accounts = await as.load();
    // // const test = await new MicrosoftAuth().auth();
    // // accounts.push(test);
    // // await as.save(accounts);
    // const test = accounts[0];

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
      gameProfile: {
        name: account.name,
        id: account.uuid,
      },
      accessToken: account.accessToken,
      gamePath,
      javaPath,
      version: fullVersionName,
      resourcePath: minecraftLocation,
      nativeRoot: path.resolve(this.filesystem.nativesDir, version),
      versionType: "Meloncher",
      // extraJVMArgs: [
      //   "-Dorg.lwjgl.opengl.Window.undecorated=true"
      // ],
      // resolution: {
      //   width: 1920,
      //   height: 1080,
      // },
    });

    if (proc.pid) this.maximize(proc.pid).then();

    proc.on("close", () => {
      console.log("close");
      this.sync.save(minor);
    });
  }

  async maximize(pid: number, attempts = 20): Promise<boolean> {
    for (let i = 0; i < attempts; i++) {
      const win = Window.getByPid(pid);
      if (win) {
        win.setShowStatus(WindowStates.SHOWMAXIMIZED);
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return false;
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
      onUpdate: (task, chunkSize) => {
        if (
          ["json", "jar", "assetsJson", "asset", "library"].includes(task.name)
        )
          // if (task.name != "dependencies")
          this.emit("progress", {
            value: installAllTask.progress / installAllTask.total,
            text: "Загрузка Minecraft (" + task.name + ")",
          });
      },
    });
  }
}
