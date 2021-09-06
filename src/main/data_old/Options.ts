import * as fs from "fs";
import * as gameSettings from "@xmcl/gamesetting";
import * as files from "../utils/files";
import * as options_data from "./options.data";
import { IFilesystem } from "@/main/data/IFilesystem";
import path from "path";

export enum OptionsType {
  Minecraft,
  Optifine,
}

export class Options {
  constructor(private filesystem: IFilesystem) {}

  async loadOptions(optionsType: OptionsType, instance: string): Promise<void> {
    const opts = await this.getFromSync(optionsType, instance);
    await this.saveToInstance(opts, optionsType, instance);
  }

  async saveOptions(optionsType: OptionsType, instance: string): Promise<void> {
    const opts = await this.getFromInstance(optionsType, instance);
    await this.saveToSync(opts, optionsType, instance);
  }

  async getFromInstance(
    optionsType: OptionsType,
    instance: string
  ): Promise<Record<string, unknown>> {
    const file = path.resolve(
      this.filesystem.versionProfiles,
      instance,
      ["options.txt", "optionsof.txt"][optionsType]
    );
    return fs.existsSync(file)
      ? gameSettings.parse(await fs.promises.readFile(file, "utf8"))
      : {};
  }

  async getMinecraftOptions(): Promise<Record<string, unknown>> {
    return fs.existsSync(this.filesystem.minecraftOptions)
      ? JSON.parse(
          await fs.promises.readFile(this.filesystem.minecraftOptions, "utf8")
        )
      : options_data.minecraft_options_template;
  }

  async getFromSync(
    optionsType: OptionsType,
    instance: string
  ): Promise<Record<string, unknown>> {
    const minecraftOptions = await this.getMinecraftOptions();
    const key = ["minecraft", "optifine"][optionsType];
    let opts = {};
    if (minecraftOptions.hasOwnProperty(key)) {
      // @ts-ignore
      opts = minecraftOptions[key];
    }
    if (
      optionsType == 0 &&
      minecraftOptions.hasOwnProperty("instances") &&
      // @ts-ignore
      minecraftOptions["instances"].hasOwnProperty(instance)
    ) {
      // @ts-ignore
      opts = this.add(opts, minecraftOptions["instances"][instance]);
    }
    return opts;
  }

  async saveToInstance(
    opts: Record<string, unknown>,
    optionsType: OptionsType,
    instance: string
  ) {
    files.makeDirIfNotExist(
      path.resolve(this.filesystem.versionProfiles, instance)
    );
    const file = path.resolve(
      this.filesystem.versionProfiles,
      instance,
      ["options.txt", "optionsof.txt"][optionsType]
    );
    await fs.promises.writeFile(file, gameSettings.stringify(opts));
  }

  async saveToSync(
    opts: Record<string, unknown>,
    optionsType: OptionsType,
    instance: string
  ) {
    const minecraftOptions = await this.getMinecraftOptions();
    const key = ["minecraft", "optifine"][optionsType];
    // @ts-ignore
    let optsSync: Record<string, unknown> = minecraftOptions.hasOwnProperty(key)
      ? minecraftOptions[key]
      : {};
    optsSync = this.add(optsSync, this.downgrade(opts));
    if (optionsType == 0) {
      if (!minecraftOptions.hasOwnProperty("instances")) {
        minecraftOptions["instances"] = {};
      }
      // @ts-ignore
      if (!minecraftOptions["instances"].hasOwnProperty(instance)) {
        // @ts-ignore
        minecraftOptions["instances"][instance] = {};
      }
      ["resourcePacks", "incompatibleResourcePacks"].forEach((value) => {
        if (opts.hasOwnProperty(value)) {
          // @ts-ignore
          minecraftOptions["instances"][instance][value] = opts[value];
        }
      });
    }
    // @ts-ignore
    minecraftOptions[key] = optsSync;
    await fs.promises.writeFile(
      this.filesystem.minecraftOptions,
      JSON.stringify(minecraftOptions)
    );
  }

  add(opts: Record<string, unknown>, optsAdd: Record<string, unknown>) {
    Object.keys(optsAdd).forEach((key) => {
      opts[key] = optsAdd[key];
    });
    return opts;
  }

  downgrade(options: Record<string, unknown>) {
    if (options.hasOwnProperty("version") && options["version"] != 0) {
      options["version"] = 0;
    }
    if (options.hasOwnProperty("lang")) {
      // @ts-ignore
      const lang_split = options["lang"].split("_");
      options["lang"] = lang_split[0] + "_" + lang_split[1].toUpperCase();
    }
    Object.keys(options).forEach((key) => {
      if (key.startsWith("key_")) {
        // @ts-ignore
        if (options_data.keycodes.hasOwnProperty(options[key])) {
          // @ts-ignore
          options[key] = options_data.keycodes[options[key]].toString();
        }
      }
    });
    return options;
  }
}
