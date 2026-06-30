package `in`.muskit.admin.data

import android.content.Context
import android.content.SharedPreferences

/** Which console the user logged into. Decides which auth header is sent. */
enum class Role { ADMIN, STAFF }

/** Logged-in session details. */
data class Session(
    val role: Role,
    val token: String,
    val email: String,
    val name: String,
)

/**
 * Persists the session in app-private SharedPreferences so the user stays
 * logged in across app restarts (until the server-side token expires).
 */
class SessionStore(context: Context) {

    private val prefs: SharedPreferences =
        context.applicationContext.getSharedPreferences("muskit_session", Context.MODE_PRIVATE)

    fun save(session: Session) {
        prefs.edit()
            .putString(KEY_ROLE, session.role.name)
            .putString(KEY_TOKEN, session.token)
            .putString(KEY_EMAIL, session.email)
            .putString(KEY_NAME, session.name)
            .apply()
    }

    fun load(): Session? {
        val roleName = prefs.getString(KEY_ROLE, null) ?: return null
        val token = prefs.getString(KEY_TOKEN, null) ?: return null
        return Session(
            role = runCatching { Role.valueOf(roleName) }.getOrNull() ?: return null,
            token = token,
            email = prefs.getString(KEY_EMAIL, "").orEmpty(),
            name = prefs.getString(KEY_NAME, "").orEmpty(),
        )
    }

    fun clear() = prefs.edit().clear().apply()

    val token: String? get() = prefs.getString(KEY_TOKEN, null)
    val role: Role? get() = prefs.getString(KEY_ROLE, null)?.let { runCatching { Role.valueOf(it) }.getOrNull() }

    private companion object {
        const val KEY_ROLE = "role"
        const val KEY_TOKEN = "token"
        const val KEY_EMAIL = "email"
        const val KEY_NAME = "name"
    }
}
