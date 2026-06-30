package `in`.muskit.admin.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val BrandNavy = Color(0xFF0B1F3A)
val BrandNavyDark = Color(0xFF06122A)
val BrandBlue = Color(0xFF2563EB)
val BrandBlueLight = Color(0xFF60A5FA)

private val LightColors = lightColorScheme(
    primary = BrandBlue,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFD9E4FF),
    onPrimaryContainer = BrandNavyDark,
    secondary = BrandNavy,
    onSecondary = Color.White,
    background = Color(0xFFF5F7FA),
    onBackground = BrandNavyDark,
    surface = Color.White,
    onSurface = BrandNavyDark,
    surfaceVariant = Color(0xFFE6EAF0),
    onSurfaceVariant = Color(0xFF44505F),
)

private val DarkColors = darkColorScheme(
    primary = BrandBlueLight,
    onPrimary = BrandNavyDark,
    primaryContainer = BrandNavy,
    onPrimaryContainer = Color.White,
    secondary = BrandBlueLight,
    onSecondary = BrandNavyDark,
    background = Color(0xFF0A1426),
    onBackground = Color(0xFFE6EAF0),
    surface = Color(0xFF111E33),
    onSurface = Color(0xFFE6EAF0),
    surfaceVariant = Color(0xFF1C2B45),
    onSurfaceVariant = Color(0xFFB3BECC),
)

@Composable
fun MuskITTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = MaterialTheme.typography,
        content = content,
    )
}
