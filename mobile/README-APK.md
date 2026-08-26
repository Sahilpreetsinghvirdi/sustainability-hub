# Sustainability Hub — Mobile APK (install like Instagram)

This app builds a standalone `.apk` you can install on any Android phone. No Expo Go.

### Install from GitHub (like Instagram)

1. Go to **Releases**: `https://github.com/Sahilpreetsinghvirdi/sustainability-hub/releases`
2. Open the latest `mobile-vX.Y.Z` release
3. Download `SustainabilityHub-mobile-vX.Y.Z.apk`
4. On your phone: open the file → allow "Install unknown apps" → Install

To update: download the newer APK from the next `mobile-v*` release.

### How releases are built

`.github/workflows/mobile-apk.yml` runs on GitHub (Ubuntu, Java 17, Android SDK):

- `expo prebuild --platform android --clean`
- `./gradlew assembleDebug` → `app-debug.apk`
- Uploads as artifact + creates GitHub Release when you push a `mobile-v*` tag.

### Trigger a new build

**Option A — push a tag (recommended):**
```bash
git tag mobile-v1.0.0
git push origin mobile-v1.0.0
```

**Option B — manual dispatch:**
GitHub → Actions → Mobile APK → Run workflow → enter version `mobile-v1.0.1`.

### Local build (requires Android SDK + Java 17)

Your PC currently has ~1 GB free — free up ≥4 GB first, then:

```powershell
cd mobile
npm ci
npx expo prebuild --platform android --clean
cd android
.\gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

For a signed release APK, add a keystore at `android/app/release.keystore` and configure `android/gradle.properties`.

### Config

- `mobile/app.json` — `android.package = com.sustainabilityhub.app`, `versionCode`
- `mobile/eas.json` — EAS preview/production profiles (`buildType: apk`) if you use `eas build`
- `mobile/src/constants/config.ts` — API base URL. For phone → PC backend, replace `localhost` with your PC's LAN IP (`ipconfig` → IPv4) and run backend on `0.0.0.0`.

### Troubleshooting

- `INSTALL_FAILED` — uninstall old debug build first.
- Backend `localhost` on phone won't work — use LAN IP.
- If GitHub Action fails on `npm ci`, run `npm install` locally and commit updated `package-lock.json`.
