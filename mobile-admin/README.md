# Musk-IT Admin (Android)

A **native Android app** (Kotlin + Jetpack Compose) for running the Musk-IT
admin and staff functions from a phone. It talks directly to the platform API
(`https://muskit.in/api/v1`) — native login, native screens, native lists — not
a wrapped web page.

## Features

**Login (matches the backend exactly)**
- Admin: email → OTP. Header `X-Admin-Token`.
- Staff: email + password → OTP. Header `X-Staff-Token`.
- The session token is stored privately and restored on launch, so you stay
  logged in until the server-side token expires. 401/403 auto-clears it.

**Admin** (bottom-nav: Dashboard · Leads · Quotes · Payments · Account)
- Dashboard — KPI cards (total leads, won, conversion %, revenue) and the
  pipeline funnel rendered as bars.
- Leads — searchable, status-filtered list; detail with full info, requirements
  and activity log; change status; edit internal notes.
- Quotations — list; detail with line items and totals; **send to client** and
  **create payment link** actions.
- Payments — all payments with status and amounts.
- Account — manage staff users, log out.

**Staff** (bottom-nav: Leads · Quotes · Payments · Account)
- Their assigned leads (list/detail, status + notes), quotations and payments.

## Architecture

```
network/   Dto.kt          data classes mirroring the FastAPI schemas
           ApiService.kt   Retrofit interface (admin + staff endpoints)
           Backend.kt      Retrofit/OkHttp/Moshi setup, auth interceptor,
                           Result-wrapped suspend calls with error mapping
data/      Session.kt      Role + SessionStore (token persistence)
ui/theme/  Theme.kt        Material 3 brand theme
ui/screens/                Compose screens + ViewModels (one per area)
MainActivity.kt            Compose entry + Navigation graph
```

Stack: Jetpack Compose (Material 3), Navigation-Compose, Lifecycle ViewModel +
coroutines, Retrofit + Moshi (reflective) + OkHttp.

## Get the APK (GitHub Actions — recommended)

The workflow `.github/workflows/android-apk.yml` builds the APK in the cloud.

1. Commit and push `mobile-admin/` (and the workflow) to GitHub.
2. The **Build Admin APK** workflow runs automatically (or run it from the
   **Actions** tab → *Build Admin APK* → *Run workflow*).
3. Open the finished run → **Artifacts** → download **`muskit-admin-debug`**,
   unzip, and install `app-debug.apk` on your phone (allow "unknown sources").

### Signed release APK (for Play Store / wider distribution)

Add these repository secrets (Settings → Secrets and variables → Actions):

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | keystore file, base64-encoded |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_ALIAS` | key alias |
| `ANDROID_KEY_PASSWORD` | key password |

```bash
keytool -genkeypair -v -keystore muskit-admin.jks -alias muskit \
  -keyalg RSA -keysize 2048 -validity 10000
base64 -i muskit-admin.jks | tr -d '\n'   # -> ANDROID_KEYSTORE_BASE64
```

With the secrets present the workflow also uploads **`muskit-admin-release`**.
Push a git tag (e.g. `v1.0.0`) to attach both APKs to a GitHub Release.

## Build locally (alternative)

Android Studio (Giraffe+) or a local SDK with JDK 17:

```bash
cd mobile-admin
gradle wrapper --gradle-version 8.9   # first time only -> generates ./gradlew
./gradlew assembleDebug                # app/build/outputs/apk/debug/app-debug.apk
```

Or open the `mobile-admin/` folder in Android Studio and Run.

## Configuration

Endpoints live in `app/build.gradle.kts` under `defaultConfig`:

```kotlin
buildConfigField("String", "API_BASE_URL", "\"https://muskit.in/api/v1/\"")
buildConfigField("String", "SITE_URL", "\"https://muskit.in\"")
```

| Setting | Value |
| --- | --- |
| Package / applicationId | `in.muskit.admin` |
| min SDK | 24 (Android 7.0) |
| target / compile SDK | 34 |
| Version | 1.0.0 |
| Launcher icon | generated from `Muskit_logo.png` (adaptive + legacy densities) |

## Notes / roadmap

- Quotation **creation** (line-item builder) and **staff-user creation** (Aadhaar,
  DOB, etc.) are not yet in the native UI — the endpoints exist and are easy to
  add as a follow-up. Everything else (auth, dashboard, leads, quotation
  send/payment-link, payments, users list) is implemented natively.
- Session tokens are kept in app-private storage. For extra hardening you can
  swap `SessionStore` to `EncryptedSharedPreferences`.
