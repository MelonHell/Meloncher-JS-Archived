import rp from "request-promise";
import { OptifineVersion } from "./OptifineVersion";

export class Optifine {
  getPatch(ofVer: OptifineVersion): string {
    let patch = ofVer["patch"];
    if (patch.startsWith("pre")) patch = ofVer["type"].replace("HD_U_", "");
    return patch;
  }

  getPre(ofVer: OptifineVersion): number {
    let pre = ofVer["patch"];
    if (pre.startsWith("pre")) {
      pre = pre.replace("pre", "");
      return parseInt(pre);
    }
    return 999;
  }

  async getLatestOptifineVersion(mcVersion: string): Promise<OptifineVersion | null> {
    const ofVerList: Array<OptifineVersion> = await this.getOptifineVersionList();
    let latestOfVer: OptifineVersion | null = null;
    for (let i = 0; i < ofVerList.length; i++) {
      const ofVer: OptifineVersion = ofVerList[i];
      if (ofVer["mcversion"].replace(".0", "") == mcVersion) {
        if (latestOfVer == null) latestOfVer = ofVer;
        else {
          const latestPatch = this.getPatch(latestOfVer);
          const thisPatch = this.getPatch(ofVer);
          if (thisPatch > latestPatch) latestOfVer = ofVer;
          else if (thisPatch == latestPatch) {
            const latestPre = this.getPre(latestOfVer);
            const thisPre = this.getPre(ofVer);
            if (thisPre > latestPre) latestOfVer = ofVer;
          }
        }
      }
    }
    return latestOfVer;
  }

  async getOptifineVersionList(): Promise<Array<OptifineVersion>> {
    return JSON.parse(
      await rp("https://bmclapi2.bangbang93.com/optifine/versionlist/")
    );
  }
}
