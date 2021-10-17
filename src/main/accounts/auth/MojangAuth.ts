import { Account } from "@/main/accounts/account/Account";
import { Authentication, login } from "@xmcl/user";

export class MojangAuth {
  async auth(username: string, password: string): Promise<Account> {
    const authFromMojang: Authentication = await login({ username, password });
    return {
      accessToken: authFromMojang.accessToken,
      uuid: authFromMojang.selectedProfile.id,
      name: authFromMojang.selectedProfile.name,
      clientToken: authFromMojang.clientToken,
    };
  }
}
