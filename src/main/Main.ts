import { TestFilesystem } from "@/main/data/TestFilesystem";
import { Options } from "@/main/data_old/Options";
import { Sync } from "@/main/data_old/Sync";
import { VersionUtils } from "@/main/versions/VersionUtils";
import { Launcher } from "@/main/launcher/Launcher";
import { BrowserWindow, ipcMain } from "electron";
import { Account } from "@/main/accounts/account/Account";
import { AccountStorage } from "@/main/accounts/AccountStorage";
import { IFilesystem } from "@/main/data/IFilesystem";

export class Main {
  constructor(private win: BrowserWindow) {}
  async getTestAccount(filesystem: IFilesystem): Promise<Account> {
    const accountStorage = new AccountStorage(filesystem);
    const accounts = await accountStorage.load();
    return accounts[0];
  }
  init(): void {
    const filesystem = new TestFilesystem();
    const options = new Options(filesystem);
    const sync = new Sync(filesystem, options);
    const versionUtils = new VersionUtils();
    const launcher = new Launcher(versionUtils, filesystem, sync);
    launcher.on("progress", (status: unknown) => {
      this.win.webContents.send("progress", status);
    });
    ipcMain.on("play", async (event, args) => {
      launcher
        .launch(args["version"], true, await this.getTestAccount(filesystem))
        .then();
    });
  }
}
