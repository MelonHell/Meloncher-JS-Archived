import { IFilesystem } from "@/main/data/IFilesystem";
import fs from "fs";
import { Account } from "@/main/accounts/account/Account";

export class AccountStorage {
  constructor(private filesystem: IFilesystem) {}
  async load(): Promise<Array<Account>> {
    return fs.existsSync(this.filesystem.launcherAccounts)
      ? JSON.parse(
          await fs.promises.readFile(this.filesystem.launcherAccounts, "utf8")
        )
      : [];
  }
  async save(accounts: Array<Account>): Promise<void> {
    await fs.promises.writeFile(
      this.filesystem.launcherAccounts,
      JSON.stringify(accounts)
    );
  }
}
