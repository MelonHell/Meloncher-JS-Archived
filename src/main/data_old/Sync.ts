import { Options, OptionsType } from "./Options";
import * as files from "../utils/files";
import { IFilesystem } from "@/main/data/IFilesystem";
import path from "path";

export class Sync {
  constructor(private filesystem: IFilesystem, private options: Options) {}

  async load(instance: string): Promise<void> {
    files.makeDirIfNotExist(
      path.resolve(this.filesystem.versionProfiles, instance)
    );
    await this.options.loadOptions(OptionsType.Minecraft, instance);
    await this.options.loadOptions(OptionsType.Optifine, instance);
  }

  async save(instance: string): Promise<void> {
    await this.options.saveOptions(OptionsType.Minecraft, instance);
    await this.options.saveOptions(OptionsType.Optifine, instance);
  }
}
