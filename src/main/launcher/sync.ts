import * as fs from "fs";
import * as options from "./options";
import * as settings from "../settings";
import * as files from "../utils/files";

export async function load(instance: string): Promise<void> {
  files.makeDirIfNotExist(settings.getInstancesPath(instance));
  await options.loadOptions(options.OptionsType.Minecraft, instance);
  await options.loadOptions(options.OptionsType.Optifine, instance);
  files.makeDirIfNotExist(settings.getSyncPath("resourcepacks"));
  files.makeDirIfNotExist(settings.getSyncPath("shaderpacks"));
  await createSymlink(instance, "resourcepacks");
  await createSymlink(instance, "shaderpacks");
}

export async function save(instance: string): Promise<void> {
  await options.saveOptions(options.OptionsType.Minecraft, instance);
  await options.saveOptions(options.OptionsType.Optifine, instance);
}

async function createSymlink(mcSubVer: string, folder: string) {
  const rpPath = settings.getInstancesPath(mcSubVer, folder);
  if (fs.existsSync(rpPath))
    await fs.promises.rmdir(rpPath, { recursive: true });
  if (fs.existsSync(rpPath + ".symlink"))
    await fs.promises.rm(rpPath, { recursive: true });
  await fs.promises.symlink(settings.getSyncPath(folder), rpPath, "junction");
}
