# Scry Chrome Extension

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the Express backend:
```bash
npm run server
```

3. Build the extension:
```bash
npm run build
```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## Development

- `npm run dev` - Run Next.js dev server (for UI development)
- `npm run server` - Run Express backend
- `npm run build` - Build extension for Chrome
