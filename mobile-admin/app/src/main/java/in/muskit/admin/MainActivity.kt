package `in`.muskit.admin

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import `in`.muskit.admin.databinding.ActivityMainBinding

/**
 * Launcher screen. Lets the user pick which console to open:
 *  - Admin console  -> BASE_URL + ADMIN_PATH   (email + OTP login)
 *  - Staff portal   -> BASE_URL + STAFF_PATH    (email + password + OTP login)
 * Each opens the in-app WebView, which reuses the full existing web UI and
 * all admin/staff functions (leads, quotations, users, companies, campaigns,
 * payments, etc.).
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnAdmin.setOnClickListener {
            openConsole(BuildConfig.BASE_URL + BuildConfig.ADMIN_PATH, getString(R.string.admin_console))
        }
        binding.btnStaff.setOnClickListener {
            openConsole(BuildConfig.BASE_URL + BuildConfig.STAFF_PATH, getString(R.string.staff_portal))
        }
    }

    private fun openConsole(url: String, title: String) {
        val intent = Intent(this, WebViewActivity::class.java).apply {
            putExtra(WebViewActivity.EXTRA_URL, url)
            putExtra(WebViewActivity.EXTRA_TITLE, title)
        }
        startActivity(intent)
    }
}
