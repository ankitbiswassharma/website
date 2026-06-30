# Keep JavaScript interface members if any are added later.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
# AndroidX WebKit
-keep class androidx.webkit.** { *; }
