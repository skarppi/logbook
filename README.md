# OpenTX Logbook

Logbook for radio controlled (RC) flights from OpenTX logs.

---

Web application to keep track of your RC flights flown with transmitter running [OpenTX](https://www.open-tx.org) or [EdgeTX firmware](https://edgetx.org) such as Radiomaster TX16S. Logbook entries are generated automatically from log files uploaded to the service and can be enriched with additional details manually such as batteries used or journal.

Current functionalities include

- Graphs presenting flights and flight times
- Watch DVR or other related videos for flights
- Visualize full telemetry similar to OpenTX Companion Log Viewer
- Battery cycles, state and graphs
- Manage planes
- Manage locations
- iOS app for easy syncing of new flights

### OpenTX Log Files

In your transmitter setup "SD Logs" Special Function to enable logging of telemetry values to SD card while flying.

I use two-stage arming. Switch SA is a safety switch and also turns on the logging, then switch SB arms the quadcopter. Flight timer starts when the quad is armed and throttle is increased. A new flight is created when logging is turned off for more than 30 seconds and restarted again.

After flying is done, sync new log files automatically using [uploader iOS app](https://github.com/skarppi/logbook/tree/master/uploader) or connect transmitter to computer and drag&drop latest csv files from SD card LOGS directory to Upload-tab of the service. 

For more information read [Working with Log Files](https://open-txu.org/home/special-interests/telemetry/working-with-log-files/).

### Quick Start

```
git clone https://github.com/skarppi/logbook.git <MyProjectName>
cd <MyProjectName>

yarn

psql
create database logbook;
create user logbook with password 'logbook';
grant all privileges on database logbook to logbook;

psql -d logbook -f 1-init.sql
psql -d logbook -f 2-locations.sql
psql -d logbook -f 3-batteries.sql

yarn dev
```

### Usage

- `yarn dev` - Client and server are in development mode [http://localhost:3000](http://localhost:3000)
- `yarn build` - `server/dist` folder will include all the needed files, both client (Bundle) and server.
- `yarn prod` - Just runs `node ./server/dist/server/src/server.js`

Upload DVR files from FatShark or similar googles to VIDEOS/ folder. Use flight ID as filename e.g. TWR-2018-10-09-Session1.mov or just TWR-2018-10-09.mov if the video is not specific to any single flight.

Videos can also be stored in another server configured with VIDEO_SERVER env variable. See example PHP implementation at ```src/videoserver``` for Synology NAS running Web Station.

### Deployments

Run ```docker-build.sh [dev/prod] http://host/path``` and ```docker-run.sh``` scripts. Set public url if your service is not running at the default https://localhost:3000.

Example Apache configuration to proxy requests into Docker container.

<VirtualHost *:443>
        # Host videos from another server
        ProxyPass /api/videos !
        Redirect 301 /api/videos https://your.synology.ip/videoserver/search.php

        # Service running at the root
        ProxyPass /sockjs-node ws://localhost:3000/sockjs-node
        ProxyPassReverse /sockjs-node ws://localhost:3000/sockjs-node
        ProxyPass / http://localhost:3000/
        ProxyPassReverse / http://localhost:3000/

        # Service running under some path (PUBLIC_URL)
        # ProxyPass /logbook http://localhost:3000/logbook
        # ProxyPassReverse /logbook http://localhost:3000/logbook

</VirtualHost>

---

#### Requirements

- Node 16+
- Postgres

---

#### Licence

This code is released as is, under MIT licence. Feel free to use it for free for both commercial and private projects. No warranty provided.
