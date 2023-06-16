# Setup

- `npm i` (if having dependency resolver issue, just go `npm i --force`)
- in root folder, rename `sample.env` to `.env` and fill in all fields except APP_SERVER

# Get a stable extension key

https://developer.chrome.com/docs/extensions/mv3/manifest/key/

- copy `manifest.json` to `local` folder
- fill in `key` value
- copy your extension id over to `.env`

# Local run

- `npm run ngrok` and copy ngrok url value to `.env` - APP_SERVER
- `npm run dev` to start local server
- `npm run build-local-ext` to build out the extension to `dist` folder
- Open Chrome extension manager, `Load unpacked` to load `dist` folder
- Go to Google Docs or Figma
