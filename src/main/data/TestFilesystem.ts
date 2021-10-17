import { IFilesystem } from "@/main/data/IFilesystem";
import path from "path";

export class TestFilesystem implements IFilesystem {
  mainDir = path.resolve(process.env.APPDATA || "./", ".meloncher");
  launcherOptions = path.resolve(this.mainDir, "./launcher_options.json");
  minecraftDir = path.resolve(this.mainDir, "./minecraft");
  nativesDir = path.resolve(this.mainDir, "./minecraft/natives");
  minecraftOptions = path.resolve(this.mainDir, "./minecraft_options.json");
  modpackProfiles = path.resolve(this.mainDir, "./profiles/modpacks");
  runtimeDir = path.resolve(this.mainDir, "./runtime");
  versionProfiles = path.resolve(this.mainDir, "./profiles/versions");
  launcherAccounts = path.resolve(this.mainDir, "./launcher_accounts.json")
}
