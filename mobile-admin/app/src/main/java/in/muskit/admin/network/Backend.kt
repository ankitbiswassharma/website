package `in`.muskit.admin.network

import android.content.Context
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import `in`.muskit.admin.BuildConfig
import `in`.muskit.admin.data.Role
import `in`.muskit.admin.data.Session
import `in`.muskit.admin.data.SessionStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.HttpException
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Single entry point to the backend. Holds the Retrofit service, the session
 * store, and convenience suspend methods that return [Result] with friendly
 * error messages. Initialise once from the Application/Activity with [init].
 */
object Backend {

    lateinit var sessionStore: SessionStore
        private set

    private val moshi: Moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    lateinit var service: ApiService
        private set

    fun init(context: Context) {
        if (::service.isInitialized) return
        sessionStore = SessionStore(context)

        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BASIC
            else HttpLoggingInterceptor.Level.NONE
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor { sessionStore })
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()

        service = retrofit.create(ApiService::class.java)
    }

    val isLoggedIn: Boolean get() = sessionStore.load() != null
    val currentSession: Session? get() = sessionStore.load()

    fun logoutLocal() = sessionStore.clear()

    // ---- Auth flows ----

    suspend fun adminRequestOtp(email: String): Result<AdminOtpRequestResponse> =
        call { service.adminRequestOtp(AdminOtpRequest(email.trim())) }

    suspend fun adminVerifyOtp(email: String, challengeId: String, otp: String): Result<Session> = call {
        val res = service.adminVerifyOtp(AdminOtpVerify(email.trim(), challengeId, otp.trim()))
        val session = Session(Role.ADMIN, res.token, res.admin_email, "Administrator")
        sessionStore.save(session)
        session
    }

    suspend fun staffLogin(email: String, password: String): Result<StaffOtpChallenge> =
        call { service.staffLogin(StaffLogin(email.trim(), password)) }

    suspend fun staffVerifyOtp(email: String, challengeId: String, otp: String): Result<Session> = call {
        val res = service.staffVerifyOtp(StaffOtpVerify(email.trim(), challengeId, otp.trim()))
        val session = Session(Role.STAFF, res.token, res.email, res.name)
        sessionStore.save(session)
        session
    }

    suspend fun logout(): Result<Unit> = call {
        val role = sessionStore.role
        try {
            if (role == Role.ADMIN) service.adminLogout() else if (role == Role.STAFF) service.staffLogout()
        } catch (_: Exception) {
            // Even if the server call fails, clear the local session.
        }
        sessionStore.clear()
        Unit
    }

    /** Wraps a network call, mapping exceptions to readable messages. */
    suspend fun <T> call(block: suspend () -> T): Result<T> = withContext(Dispatchers.IO) {
        try {
            Result.success(block())
        } catch (e: HttpException) {
            if (e.code() == 401 || e.code() == 403) {
                // Session no longer valid -> force re-login.
                sessionStore.clear()
            }
            Result.failure(Exception(parseError(e)))
        } catch (e: IOException) {
            Result.failure(Exception("Network error. Check your connection and try again."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Something went wrong."))
        }
    }

    private fun parseError(e: HttpException): String {
        val raw = try {
            e.response()?.errorBody()?.string()
        } catch (_: Exception) {
            null
        }
        if (!raw.isNullOrBlank()) {
            // Backend returns {"detail": "..."}.
            val match = Regex("\"detail\"\\s*:\\s*\"([^\"]*)\"").find(raw)
            if (match != null) return match.groupValues[1]
        }
        return when (e.code()) {
            400 -> "Invalid request."
            401, 403 -> "Session expired. Please log in again."
            404 -> "Not found."
            429 -> "Too many attempts. Please wait a moment."
            in 500..599 -> "Server error. Please try again later."
            else -> "Request failed (${e.code()})."
        }
    }
}

/** Adds the correct auth token header based on the saved role. */
class AuthInterceptor(private val storeProvider: () -> SessionStore) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val store = storeProvider()
        val token = store.token
        val role = store.role
        val builder = chain.request().newBuilder()
            .header("Accept", "application/json")
        if (!token.isNullOrBlank() && role != null) {
            val header = if (role == Role.ADMIN) "X-Admin-Token" else "X-Staff-Token"
            builder.header(header, token)
        }
        return chain.proceed(builder.build())
    }
}
