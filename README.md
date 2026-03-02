# Sentinel Desktop

## Development startup order

0. Install dependencies once:
   - `npm install --prefix render`
   - `npm install --prefix electron`

1. Start renderer dev server:
   - `npm run dev:render`
2. In a second terminal, start Electron shell:
   - `npm run dev:electron`

## Build renderer for packaged Electron

- `npm run build:render`

Electron will load `render/dist/index.html` when `ELECTRON_RENDERER_URL` is not set.
