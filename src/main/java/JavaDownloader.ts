import { EventEmitter } from "events";

export abstract class JavaDownloader extends EventEmitter {
  abstract download(javaType: string): Promise<boolean>;
  emitProgress(current: number, total: number): void {
    this.emit("progress", {
      current: current,
      total: total,
    });
  }
  abstract has(javaType: string): boolean;
  abstract getPath(javaType: string): string;
}
