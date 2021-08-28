export interface Version {
  version: string;
  minor: number;
  type: VersionType;
}

enum VersionType {
  RELEASE,
  SNAPSHOT,
  BETA,
  ALPHA,
  INFDEV,
  INDEV,
  CLASSIC,
  PRE_CLASSIC,
}
