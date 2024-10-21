NodeJS Game Server
=======================

This is a test project, for simple game server with WebSocket.

## Install
```sh
npm install
```

## Start the server
```sh
npm run start
```

## Open browser
```sh
open http://127.0.0.1:3000/
```

## Development notes

The /client directory has the browser source code and it's build using webpack module.

 - Webpack
   - Installed dependency: `npm install webpack webpack-cli --save-dev`
 - Build
   - Command: `npm run build`
   - This will build all the client source into `/dist` directory.
 - Build watch
   - You can use `npm run watch` for client development.
   - This will watch client file changes and rebuild.
 - HTML template
   - Installed dependency: `npm install --save-dev html-webpack-plugin`
 - Loading CSS files
   - See: https://webpack.js.org/guides/asset-management/
   - **Optional.** When you don't have any CSS to load, skip this.
   - After this, you can import CSS files in js source like this: `import './style.css';`
   - Install dependency: `npm install --save-dev style-loader css-loader`
   - Add webpack.config.js:
```js
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
```

Client library... something small and easy
 - [Mithril.js](https://mithril.js.org/) or [VanJS](https://vanjs.org/)
 - Let's use VanJS for now. Good opportunity to test it.
   - Installed dependency: `npm install vanjs-core` in https://vanjs.org/start

## To-Do
 - Proper map dimensions, now we only have x, y coordinates
 - Client game library
 - Item DB split by types: Weapon, Armor, etc.
 - Database