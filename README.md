# OpenTX Logbook

Logbook for radio controlled (RC) flights from OpenTX logs.

---

Web application to keep track of your RC flights flown with transmitter running [OpenTX firmware](https://www.open-tx.org) such as Taranis X9D. Logbook entries are generated automatically from log files uploaded to the service and can be enriched with additional details manually such as batteries used or journal.

Current functionalities include

- Graphical presentation of flights and flight times over time
- Watch DVR or other related videos
- Battery cycles

Future ideas

- Visualize full telemetry similar to OpenTX Companion Log Viewer

### OpenTX Log Files

In your transmitter setup "SD Logs" Special Function to enable logging of telemetry values to SD card while flying.

I use two-stage arming. Switch SA is a safety switch and also turns on the logging, then switch SB arms the quadcopter. Flight timer starts when the quad is armed and throttle is increased. A new flight is generated when logging is turned off for more than 30 seconds and restarted again.

After flying is done, connect your transmitter to a computer and drag&drop latest csv files from OpenTX LOGS directory to the service.

For more information read [Working with Log Files](http://open-txu.org/home/special-interests/telemetry/working-with-log-files/)).

### Directory Layout

```
.
├── /node_modules/          # 3rd-party libraries and utilities
├── /dist/                  # All the generated files will go here, and will run from this folder
├── /src/                   # The source code of the application
│   ├── /client/            # React app
│   ├── /server/            # Express server app
│   ├── /shared/            # The shared code between the client and the server
├── /assets/                # images, css, jsons etc.
```

### Quick Start

Just clone this repository into your own project folder. and start working

```
git clone https://github.com/skarppi/opentx-logbook.git <MyProjectName>
cd <MyProjectName>
yarn install
yarn run dev
```

If you want to detach from this repository into your own repository do this:

```
git remote remove origin
git remote add origin YOUR_REPO_URL
git push -u origin master
```

Setup database

```
createdb logbook
psql -d logbook -f init.sql
```

### Usage

- `yarn run dev` - Client and server are in watch mode with source maps, opens [http://localhost:3000](http://localhost:3000)
- `yarn run build` - `dist` folder will include all the needed files, both client (Bundle) and server.
- `yarn start` - Just runs `node ./dist/server/server.js`

---

#### Requirements

- Node 6+
- Postgres

---

#### Licence

This code is released as is, under MIT licence. Feel free to use it for free for both commercial and private projects. No warranty provided.
