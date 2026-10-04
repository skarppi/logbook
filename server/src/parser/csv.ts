import parse from "csv-parse";
import { createReadStream } from "fs";

export default function read<T>(filename: string): Promise<T[]> {
  let results: object[] = [];
  return new Promise((resolve, reject) => {
    const fileStream = createReadStream(filename);
    const parser = fileStream.pipe(
      parse({
        skip_empty_lines: true,
        columns: true,
        delimiter: ",",
      }),
    );

    const fail = (msg: Error) => {
      console.log(msg);
      // Tear down the file stream so its descriptor is released, and drop the
      // accumulated rows so they can be garbage collected instead of lingering
      // until the stream auto-closes.
      fileStream.destroy();
      results = [];
      reject(msg);
    };

    // Handle errors on both ends of the pipe: the file read (e.g. missing
    // file, I/O error) and the CSV parser (e.g. malformed input).
    fileStream.on("error", fail);
    parser
      .on("data", (data: object) => results.push(data))
      .on("error", fail)
      .on("end", () => resolve(results as T[]));
  });
}
