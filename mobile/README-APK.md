# Sustainability Hub — Release Installers

The GitHub Releases page publishes both installable builds for each version:

- Android: `SustainabilityHub-vX.Y.Z.apk`
- Windows: `Sustainability Hub_X.Y.Z_x64_en-US.msi`

The Android APK is a standalone signed build and does not require Expo Go. The Windows installer bundles WebView2 so the desktop app can be installed without a separate runtime download.

## How releases are built

`.github/workflows/mobile-apk.yml` builds both installers on GitHub Actions:

- Android uses Java 17, the Android SDK, Expo prebuild, and a signed Gradle release build.
- Windows uses Node, Rust, Tauri, and the offline WebView2 installer bundle.
- The final job publishes both files to one GitHub Release.

## Trigger a release

Push a semantic version tag:

```bash
git tag v1.4.6
git push origin v1.4.6
```

The workflow also supports a manual dispatch with a version tag.

## Local Android build

Local Android builds require Android SDK, Java 17, and enough free disk space:

```powershell
cd mobile
npm install --legacy-peer-deps
npx expo prebuild --platform android --clean
npx expo export --platform android
cd android
.\gradlew assembleRelease --no-daemon
```

The APK is written to `mobile/android/app/build/outputs/apk/release/app-release.apk`.

## Mobile configuration

- `mobile/app.json` contains the Android package and version code.
- `mobile/eas.json` contains optional EAS preview and production profiles.
- `mobile/src/constants/config.ts` contains the app version shown in Settings.
