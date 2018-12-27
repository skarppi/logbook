# OpenTX Logbook

Flight logbook from OpenTX logs.

---

Web application to keep track of your flights flown with RC transmitter running [OpenTX firmware](https://www.open-tx.org) such as Taranis X9D.

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
├── .gitignore              # ignored git files and folders
├── .nvmrc                  # Force nodejs version
├── package.json            # The list of 3rd party libraries and utilities
└── tslint.json             # TypeScript linting configuration file
├── README.md               # This file
```

### What's included

- [React v16](https://facebook.github.io/react/)
- [React router v4](https://github.com/ReactTraining/react-router)
- [Material-ui](https://github.com/mui-org/material-ui)
- [Css modules](https://github.com/css-modules/css-modules)
- [Axios](https://github.com/mzabriskie/axios) (For Client/Server communication)

### Quick Start

Just clone this repository into your own project folder. and start working

```
git clone https://github.com/skarppi/opentx-logbook.git <MyProjectName>
cd <MyProjectName>
npm install
npm run dev
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

- `npm run dev` - Client and server are in watch mode with source maps, opens [http://localhost:3000](http://localhost:3000)
- `npm run build` - `dist` folder will include all the needed files, both client (Bundle) and server.
- `npm start` - Just runs `node ./dist/server/server.js`

---

#### Requirements

- Node 6+

---

#### Licence

This code is released as is, under MIT licence. Feel free to use it for free for both commercial and private projects. No warranty provided.
