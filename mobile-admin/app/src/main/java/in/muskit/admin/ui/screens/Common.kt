package `in`.muskit.admin.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.platform.LocalContext
import android.widget.Toast
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/** Generic UI state for screens that load a single payload. */
sealed interface UiState<out T> {
    data object Loading : UiState<Nothing>
    data class Error(val message: String) : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
}

@Composable
fun LoadingBox(modifier: Modifier = Modifier) {
    Box(modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator()
    }
}

@Composable
fun ErrorBox(message: String, onRetry: (() -> Unit)? = null, modifier: Modifier = Modifier) {
    Box(modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(message, color = MaterialTheme.colorScheme.error)
            if (onRetry != null) {
                Button(onClick = onRetry, modifier = Modifier.padding(top = 16.dp)) { Text("Retry") }
            }
        }
    }
}

@Composable
fun EmptyBox(message: String, modifier: Modifier = Modifier) {
    Box(modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
        Text(message, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
fun InfoRow(label: String, value: String?) {
    if (value.isNullOrBlank()) return
    Row(
        Modifier.fillMaxWidth().padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 14.sp)
        Text(
            value,
            fontWeight = FontWeight.Medium,
            fontSize = 14.sp,
            modifier = Modifier.padding(start = 16.dp),
        )
    }
}

@Composable
fun StatusChip(status: String) {
    val color = statusColor(status)
    Box(
        Modifier
            .background(color.copy(alpha = 0.15f), RoundedCornerShape(50))
            .padding(horizontal = 10.dp, vertical = 4.dp),
    ) {
        Text(
            status.replace('_', ' ').replaceFirstChar { it.uppercase() },
            color = color,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
        )
    }
}

fun statusColor(status: String): Color = when (status.lowercase()) {
    "new" -> Color(0xFF2563EB)
    "contacted" -> Color(0xFF7C3AED)
    "qualified" -> Color(0xFF0891B2)
    "proposal_sent", "sent" -> Color(0xFFD97706)
    "won", "paid" -> Color(0xFF059669)
    "lost", "failed", "cancelled" -> Color(0xFFDC2626)
    "draft", "pending", "created" -> Color(0xFF6B7280)
    "expired", "refunded" -> Color(0xFFB45309)
    else -> Color(0xFF6B7280)
}

/** Fires a one-shot Toast for transient feedback, then calls [onShown]. */
@Composable
fun Snack(message: String, onShown: () -> Unit) {
    val context = LocalContext.current
    LaunchedEffect(message) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        onShown()
    }
}

/** Money values arrive as decimal strings; show with the rupee symbol. */
fun money(currency: String?, amount: String?): String {
    val a = amount?.takeIf { it.isNotBlank() } ?: "0"
    val symbol = when (currency?.uppercase()) {
        "INR", null, "" -> "₹"
        "USD" -> "$"
        else -> "${currency} "
    }
    return "$symbol$a"
}
