export interface VersionManifest {
  latest: Latest;
  versions: Set<MinecraftVersion>;
}

export interface Latest {
  release: string;
  snapshot: string;
}

export interface MinecraftVersion {
  id: string;
  type: string;
  url: string;
  time: string;
  releaseTime: string;
}
