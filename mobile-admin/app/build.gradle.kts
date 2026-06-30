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

        // ---- App configuration ----
        // API base for the native client. All admin/staff calls hit this origin.
        buildConfigField("String", "API_BASE_URL", "\"https://muskit.in/api/v1/\"")
        buildConfigField("String", "SITE_URL", "\"https://muskit.in\"")

        vectorDrawables { useSupportLibrary = true }
    }

    signingConfigs {
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
        compose = true
        buildConfig = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.06.00")
    implementation(composeBom)

    implementation("androidx.core:core-ktx:1.13.1")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.activity:activity-compose:1.9.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.2")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.2")

    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.7.7")

    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-moshi:2.11.0")
    implementation("com.squareup.moshi:moshi:1.15.1")
    implementation("com.squareup.moshi:moshi-kotlin:1.15.1")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")

    debugImplementation("androidx.compose.ui:ui-tooling")
}
