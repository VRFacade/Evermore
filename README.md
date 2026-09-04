# Evermore (Lane A - Expo Go)

Android-first Expo TypeScript app for Expo Go.

## Requirements

- Node.js 20+
- Expo Go on Android
- Same Wi-Fi or tunnel

## Install and start

```bash
git clone https://github.com/VRFacade/Evermore.git
cd Evermore
npm install
npx expo start
```

Optional Android start:

```bash
npx expo start --android
```

If LAN fails, use tunnel:

```bash
npx expo start --tunnel
```

## Open in Expo Go (Android)

1. Install Expo Go from the Play Store.
2. On your computer, run the start command above.
3. Wait for the Metro QR code / URL (exp://...).
4. Open Expo Go on Android and scan the QR code (or enter the URL).
5. The Evermore app loads inside Expo Go.

Tips: keep Metro open; use tunnel if needed; force-quit Expo Go to verify Lists persistence.

## What is in v1

- **Home** — Full-screen icon grid: Lists, Games, Inbox (Coming soon, not launchable). Dark/light via system.
- **Lists** — Full local CRUD (lists + items). Empty names forbidden. Delete list cascades items. Persisted with versioned SQLite (PRAGMA user_version, migrate path). Not AsyncStorage.
- **Games** — Library shell: Memory Match (Available, opens in-app) + Star Drift (Coming soon). No remote URL loads.
- **Inbox** — Home Coming soon card only.
- **Home control** — Persistent Home button on every module screen.
- **Chief** — Not built.

## Acceptance checklist

- Home icons: Lists and Games open; Inbox shows Coming soon and does not navigate.
- Lists survive force-quit / Expo Go restart (SQLite).
- Games then Memory Match opens in-app.
- Home is reachable from Lists, List detail, Games, and Memory Match.

## Scripts

- `npx expo start` — Start Metro for Expo Go
- `npx expo start --android` — Start and target Android
- `npx expo start --tunnel` — Tunnel when LAN fails

## License

See `LICENSE`.
