# Musk-IT Admin (Android)

A native Android app that wraps the existing Musk-IT web consoles so you can run
all admin and staff functions from your phone. It reuses the live web UI at
`https://muskit.in`, so every feature the website has is available with no extra
backend work — and the app stays in sync automatically as the site updates.

## What it does

A launcher screen with two buttons:

- **Admin Console** → `https://muskit.in/dashboard` — login by email + OTP. Gives
  the dashboard summary/funnel, payments, leads (view/update/notes/assign/
  activities), quotations (create/PDF/DOCX/send/payment-link), staff users, and
  companies/campaigns.
- **Staff Portal** → `https://muskit.in/staff` — login by email + password + OTP.
  Gives the staff leads and quotations views.

The WebView is configured for the full workflow: persistent cookies/sessions so
OTP logins stick, JavaScript + DOM storage, **file downloads** (quotation PDF /
DOCX land in the Downloads folder), **file uploads** (e.g. uploading an edited
DOCX), swipe-to-refresh, in-app back navigation, and routing of `tel:`,
`mailto:`, `whatsapp:` and external links out to the right app. All traffic is
HTTPS-only (cleartext disabled).

## Get the APK (GitHub Actions — recommended)

A workflow at `.github/workflows/android-apk.yml` builds the APK in the cloud.

1. Commit and push this `mobile-admin/` folder (and the workflow) to GitHub.
2. The **Build Admin APK** workflow runs automatically (or run it manually from
   the Actions tab → *Build Admin APK* → *Run workflow*).
3. Open the finished run and download the **`muskit-admin-debug`** artifact — it
   contains `app-debug.apk`, ready to install.

The debug APK is installable immediately (Android may warn it's from an unknown
source — allow it). No local Android Studio needed.

### Signed release APK (optional, for Play Store / wider distribution)

Add these repository **Secrets** (Settings → Secrets and variables → Actions):

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | your keystore file, base64-encoded |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_ALIAS` | key alias |
| `ANDROID_KEY_PASSWORD` | key password |

Create a keystore and encode it:

```bash
keytool -genkeypair -v -keystore muskit-admin.jks -alias muskit \
  -keyalg RSA -keysize 2048 -validity 10000
base64 -i muskit-admin.jks | tr -d '\n'   # paste into ANDROID_KEYSTORE_BASE64
```

With the secrets present, the workflow also builds and uploads a signed
**`muskit-admin-release`** artifact. Push a git **tag** (e.g. `v1.0.0`) to also
attach both APKs to a GitHub Release.

## Build locally (alternative)

Requires Android Studio (Giraffe+) or a local SDK with JDK 17.

```bash
cd mobile-admin
gradle wrapper --gradle-version 8.9   # first time only, generates ./gradlew
./gradlew assembleDebug                # -> app/build/outputs/apk/debug/app-debug.apk
```

Or just open the `mobile-admin/` folder in Android Studio and Run.

## Configuration

All endpoints live in `app/build.gradle.kts` under `defaultConfig` — edit and
rebuild to repoint the app:

```kotlin
buildConfigField("String", "BASE_URL", "\"https://muskit.in\"")
buildConfigField("String", "ADMIN_PATH", "\"/dashboard\"")
buildConfigField("String", "STAFF_PATH", "\"/staff\"")
buildConfigField("String", "ALLOWED_HOSTS", "\"muskit.in,www.muskit.in\"")
```

`ALLOWED_HOSTS` controls which links stay inside the app; anything else opens in
the system browser. If you change the domain, also update
`app/src/main/res/xml/network_security_config.xml`.

| Setting | Value |
| --- | --- |
| Package / applicationId | `in.muskit.admin` |
| min SDK | 24 (Android 7.0) |
| target / compile SDK | 34 |
| Version | 1.0.0 |
