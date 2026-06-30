package `in`.muskit.admin

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import `in`.muskit.admin.data.Role
import `in`.muskit.admin.network.Backend
import `in`.muskit.admin.ui.screens.AdminHomeScreen
import `in`.muskit.admin.ui.screens.AdminLoginScreen
import `in`.muskit.admin.ui.screens.LeadDetailScreen
import `in`.muskit.admin.ui.screens.QuotationDetailScreen
import `in`.muskit.admin.ui.screens.RoleSelectScreen
import `in`.muskit.admin.ui.screens.StaffHomeScreen
import `in`.muskit.admin.ui.screens.StaffLoginScreen
import `in`.muskit.admin.ui.screens.UsersScreen
import `in`.muskit.admin.ui.theme.MuskITTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Backend.init(applicationContext)
        setContent {
            MuskITTheme {
                AppRoot()
            }
        }
    }
}

@Composable
fun AppRoot() {
    val nav = rememberNavController()
    val start = when (Backend.currentSession?.role) {
        Role.ADMIN -> "admin"
        Role.STAFF -> "staff"
        else -> "role"
    }

    fun clearTo(route: String) {
        nav.navigate(route) {
            popUpTo(nav.graph.findStartDestination().id) { inclusive = true }
            launchSingleTop = true
        }
    }

    NavHost(navController = nav, startDestination = start) {
        composable("role") {
            RoleSelectScreen(
                onSelectAdmin = { nav.navigate("login/admin") },
                onSelectStaff = { nav.navigate("login/staff") },
            )
        }
        composable("login/admin") {
            AdminLoginScreen(onSuccess = { clearTo("admin") })
        }
        composable("login/staff") {
            StaffLoginScreen(onSuccess = { clearTo("staff") })
        }
        composable("admin") {
            AdminHomeScreen(nav = nav, onLoggedOut = { clearTo("role") })
        }
        composable("staff") {
            StaffHomeScreen(nav = nav, onLoggedOut = { clearTo("role") })
        }
        composable("lead/{role}/{id}") { entry ->
            val role = runCatching { Role.valueOf(entry.arguments?.getString("role") ?: "ADMIN") }
                .getOrDefault(Role.ADMIN)
            val id = entry.arguments?.getString("id").orEmpty()
            DetailScaffold(nav, "Lead details") { LeadDetailScreen(role, id) }
        }
        composable("quotation/{id}") { entry ->
            val id = entry.arguments?.getString("id").orEmpty()
            DetailScaffold(nav, "Quotation") { QuotationDetailScreen(id) }
        }
        composable("users") {
            DetailScaffold(nav, "Staff users") { UsersScreen() }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetailScaffold(nav: NavController, title: String, content: @Composable () -> Unit) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title) },
                navigationIcon = {
                    IconButton(onClick = { nav.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary,
                ),
            )
        },
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) { content() }
    }
}
