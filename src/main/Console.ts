import { MojangJavaDownloader } from "@/main/java/MojangJavaDownloader";
import { TestFilesystem } from "@/main/data/TestFilesystem";
import { ZuluJavaDownloader } from "@/main/java/ZuluJavaDownloader";

export class Console {
  run(text: string): void {
    if (text == "java1") {
      const jd = new ZuluJavaDownloader(new TestFilesystem());
      jd.on("progress", (status) => {
        console.log(status);
      });
      jd.download("java-runtime-alpha").then(
        console.log("ыпывакпвыапи")
      );
    }
  }
}
