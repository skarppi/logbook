# OpenTX Logbook

Logbook for radio controlled (RC) flights from OpenTX logs.

---

Web application to keep track of your RC flights flown with transmitter running [OpenTX firmware](https://www.open-tx.org) such as Taranis X9D. Logbook entries are generated automatically from log files uploaded to the service and can be enriched with additional details manually such as batteries used or journal.

Current functionalities include

- Graphs presenting flights and flight times
- Watch DVR or other related videos for flights
- Battery cycles and state
- iOS app for easy syncing of new flights

Ongoing and future ideas

- Visualize full telemetry similar to OpenTX Companion Log Viewer
- Battery health graphs
- Manage planes
- Manage locations

### OpenTX Log Files

In your transmitter setup "SD Logs" Special Function to enable logging of telemetry values to SD card while flying.

I use two-stage arming. Switch SA is a safety switch and also turns on the logging, then switch SB arms the quadcopter. Flight timer starts when the quad is armed and throttle is increased. A new flight is created when logging is turned off for more than 30 seconds and restarted again.

After flying is done, connect your transmitter to a computer and drag&drop latest csv files from SD card LOGS directory to Upload-tab of the service. A separate uploader iOS app can be used to automatically upload new files using wireless card reader (Kingston MobileLite Wireless or similar). Check out code at ```uploader``` folder.

For more information read [Working with Log Files](http://open-txu.org/home/special-interests/telemetry/working-with-log-files/).

### Quick Start

```
git clone https://github.com/skarppi/logbook.git <MyProjectName>
cd <MyProjectName>

yarn install

createdb logbook

sudo -u postgres psql
create database logbook;
create user logbook with password 'logbook';
grant all privileges on database logbook to logbook;

psql -d logbook -f init.sql

yarn run dev
```

### Usage

- `yarn run dev` - Client and server are in watch mode with source maps, opens [http://localhost:3000](http://localhost:3000)
- `yarn run build` - `dist` folder will include all the needed files, both client (Bundle) and server.
- `yarn start` - Just runs `node ./dist/server/server.js`

Upload DVR files from FatShark or similar googles to VIDEOS/ folder. Use flight ID as filename e.g. TWR-2018-10-09-Session1.mov or just TWR-2018-10-09.mov if the video is not specific to any single flight.

Videos can also be stored in another server configured with VIDEO_SERVER env variable. See example PHP implementation at ```src/videoserver``` for Synology NAS running Web Station.

### Deployments

See ```docker-build.sh``` and ```docker-run.sh``` scripts . Replace PUBLIC_URL with your path the service is hosted at, defaults to root.

Example Apache configuration to proxy requests into Docker container.

<VirtualHost *:443>
        # Host videos from another server
        ProxyPass /api/videos !
        Redirect 301 /api/videos https://your.synology.ip/videoserver/search.php

        # Service running at the root
        ProxyPass / http://localhost:3000/
        ProxyPassReverse / http://localhost:3000/

        # Service running under some path (PUBLIC_URL)
        # ProxyPass /logbook http://localhost:3000/logbook
        # ProxyPassReverse /logbook http://localhost:3000/logbook
</VirtualHost>

---

#### Requirements

- Node 6+
- Postgres

---

#### Licence

This code is released as is, under MIT licence. Feel free to use it for free for both commercial and private projects. No warranty provided.
