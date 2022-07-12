import {
  dirname,
} from "node:path";
import {
  mkdir,
  writeFile,
} from "fs/promises";
import type {
  Exporter,
  ExportValue,
} from "App/Exporters/Exporter";

export class JsonFileExporter implements Exporter {
  public async export<T extends ExportValue>(data: T, savePath: string) {
    const dir = dirname(savePath);

    await mkdir(
      dir,
      {
        recursive: true,
      },
    );

    await writeFile(
      savePath,
      JSON.stringify(data),
      {
        encoding: "utf8",
      },
    );

    return savePath;
  }
}
