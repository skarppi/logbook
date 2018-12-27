import * as parse from "csv-parse";
import { createReadStream } from "fs";

export default function read(filename: string): Promise<object[]> {
  const results: object[] = [];
  return new Promise((resolve, reject) => {
    createReadStream(filename)
      .pipe(
        parse({
          skip_empty_lines: true,
          columns: true,
          delimiter: ","
        })
      )
      .on("data", (data: object) => results.push(data))
      .on("error", msg => {
        reject(msg);
        console.log(msg);
      })
      .on("end", () => {
        resolve(results);
      });
  });
}
