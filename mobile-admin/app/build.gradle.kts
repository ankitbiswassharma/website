plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "in.muskit.admin"
    compileSdk = 34

    defaultConfig {
        applicationId = "in.muskit.admin"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        // ---- App configuration (edit here to repoint the app) ----
        // Base site. Admin console + staff portal live under this origin.
        buildConfigField("String", "BASE_URL", "\"https://muskit.in\"")
        buildConfigField("String", "ADMIN_PATH", "\"/dashboard\"")
        buildConfigField("String", "STAFF_PATH", "\"/staff\"")
        // Hosts the WebView is allowed to keep in-app (others open in browser).
        buildConfigField("String", "ALLOWED_HOSTS", "\"muskit.in,www.muskit.in\"")
    }

    signingConfigs {
        // Release signing is supplied by CI / local keystore via env or gradle props.
        // See README. Falls back gracefully when not present.
        create("release") {
            val storeFilePath = System.getenv("ANDROID_KEYSTORE_FILE")
                ?: (project.findProperty("ANDROID_KEYSTORE_FILE") as String?)
            if (storeFilePath != null) {
                storeFile = file(storeFilePath)
                storePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
                    ?: (project.findProperty("ANDROID_KEYSTORE_PASSWORD") as String?)
                keyAlias = System.getenv("ANDROID_KEY_ALIAS")
                    ?: (project.findProperty("ANDROID_KEY_ALIAS") as String?)
                keyPassword = System.getenv("ANDROID_KEY_PASSWORD")
                    ?: (project.findProperty("ANDROID_KEY_PASSWORD") as String?)
            }
        }
    }

    buildTypes {
        getByName("debug") {
            isMinifyEnabled = false
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
        getByName("release") {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // Use the release keystore only when it was configured; otherwise
            // the build still produces an unsigned release APK.
            val ks = System.getenv("ANDROID_KEYSTORE_FILE")
                ?: (project.findProperty("ANDROID_KEYSTORE_FILE") as String?)
            if (ks != null) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        buildConfig = true
        viewBinding = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
    implementation("androidx.webkit:webkit:1.11.0")
}
