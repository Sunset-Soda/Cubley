# Cubely as a Linux AppImage

You need Node.js 18 or newer and an internet connection for the first build.

    npm install
    npm run dist

The AppImage appears in `dist/` as `Cubely-1.0.0.AppImage`.

    chmod +x dist/Cubely-1.0.0.AppImage
    ./dist/Cubely-1.0.0.AppImage

To try it without packaging, run `npm start`.

## Notes
- Your solve times, painted cube and theme are saved in the app's own data folder (`~/.config/Cubely`). They stay when you close the app, and updating to a new build keeps them. Deleting that folder wipes them.
- The first `npm install` / `npm run dist` (or `npm start`) downloads all the theme fonts into the `fonts` folder and bundles them into the AppImage, so the finished app needs no internet at all.
- Some distros need FUSE 2 to run AppImages (Ubuntu: `sudo apt install libfuse2`).
- On Ubuntu 24.04 and newer, if the window does not open, run it with `--no-sandbox`.

## Using git
The first build downloads fonts into `fonts/` and points `index.html` at them. Commit those too so the repo works offline. `node_modules/` and `dist/` are ignored.
