import * as fs from "fs";
import * as gameSettings from "@xmcl/gamesetting";
import * as datamanager from "./datamanager";
import * as files from "../utils/files";
import * as options_data from "./options.data";

export enum OptionsType {
  Minecraft,
  Optifine,
}

const minecraft_options_file = datamanager.getPath(
  "data",
  "minecraft_options.json"
);

export async function loadOptions(
  optionsType: OptionsType,
  instance: string
): Promise<void> {
  const opts = await getFromSync(optionsType, instance);
  await saveToInstance(opts, optionsType, instance);
}

export async function saveOptions(
  optionsType: OptionsType,
  instance: string
): Promise<void> {
  const opts = await getFromInstance(optionsType, instance);
  await saveToSync(opts, optionsType, instance);
}

async function getFromInstance(
  optionsType: OptionsType,
  instance: string
): Promise<Record<string, unknown>> {
  const file = datamanager.getPath(
    "instances",
    instance,
    ["options.txt", "optionsof.txt"][optionsType]
  );
  return fs.existsSync(file)
    ? gameSettings.parse(await fs.promises.readFile(file, "utf8"))
    : {};
}

async function getMinecraftOptions(): Promise<Record<string, unknown>> {
  return fs.existsSync(minecraft_options_file)
    ? JSON.parse(await fs.promises.readFile(minecraft_options_file, "utf8"))
    : options_data.minecraft_options_template;
}

async function getFromSync(
  optionsType: OptionsType,
  instance: string
): Promise<Record<string, unknown>> {
  const minecraftOptions = await getMinecraftOptions();
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
    opts = add(opts, minecraftOptions["instances"][instance]);
  }
  return opts;
}

async function saveToInstance(
  opts: Record<string, unknown>,
  optionsType: OptionsType,
  instance: string
) {
  files.makeDirIfNotExist(datamanager.getPath("instances", instance));
  const file = datamanager.getPath(
    "instances",
    instance,
    ["options.txt", "optionsof.txt"][optionsType]
  );
  await fs.promises.writeFile(file, gameSettings.stringify(opts));
}

async function saveToSync(
  opts: Record<string, unknown>,
  optionsType: OptionsType,
  instance: string
) {
  files.makeDirIfNotExist(datamanager.getPath("data"));
  const minecraftOptions = await getMinecraftOptions();
  const key = ["minecraft", "optifine"][optionsType];
  // @ts-ignore
  let optsSync: Record<string, unknown> = minecraftOptions.hasOwnProperty(key)
    ? minecraftOptions[key]
    : {};
  optsSync = add(optsSync, downgrade(opts));
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
    minecraft_options_file,
    JSON.stringify(minecraftOptions)
  );
}

function add(opts: Record<string, unknown>, optsAdd: Record<string, unknown>) {
  Object.keys(optsAdd).forEach((key) => {
    opts[key] = optsAdd[key];
  });
  return opts;
}

function downgrade(options: Record<string, unknown>) {
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
