import { Router } from "express";
import * as fs from "fs";
import { VIDEO_FOLDER, VIDEO_SERVER } from "../config";
import { readdirSync } from "fs";


export function videosRouter() {
  const router = Router();

  router.get("/", function(req, res) {
    if(VIDEO_SERVER) {
      res.redirect(VIDEO_SERVER + "?" + require('url').parse(req.url).query)
    } else {
      const prefix = req.query.plane + "-" + req.query.date
      const sessionPrefix = prefix + (req.query.session ? `-Session${req.query.session}` : '' )
      const videos = readdirSync(VIDEO_FOLDER).filter(file =>
        file.indexOf('-Session') === -1 ? file.startsWith(prefix) : file.startsWith(sessionPrefix)
      );  
      res.json(videos.map(v => `${req.protocol}://${req.get('Host')}${req.baseUrl}/${v}`));
    }
  })

  router.get("/:video", function(req, res) {
    const path = VIDEO_FOLDER + req.params.video;

    // if (!file) {
    //   return res.sendStatus(404);
    // }

    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(path, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize
        // "Content-Type": "video/mov"
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize
        // "Content-Type": "video/mov"
      };
      res.writeHead(200, head);
      fs.createReadStream(path).pipe(res);
    }
  });
  return router;
}
