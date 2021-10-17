import msmc, { update } from "msmc";
import fetch from "node-fetch";
import { Account } from "@/main/accounts/account/Account";

export class MicrosoftAuth {
  async auth(): Promise<Account> {
    console.log("1")
    msmc.setFetch(fetch);
    console.log("2")
    const result = await msmc.fastLaunch("raw", (update: update) => {
      //A hook for catching loading bar events and errors, standard with MSMC
      console.log("CallBack!!!!!");
      console.log(update);
    });
    console.log("3")
    if (msmc.errorCheck(result)) {
      console.log("We failed to log someone in because : " + result.reason);
      // return;
    }
    console.log("4")
    return {
      accessToken: result.access_token,
      uuid: result.profile?.id,
      name: result.profile?.name,
    };
  }
}
