package `in`.muskit.admin.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import `in`.muskit.admin.network.Backend
import kotlinx.coroutines.launch
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.font.FontWeight
import androidx.navigation.NavController
import `in`.muskit.admin.data.Role

private data class Tab(val label: String, val icon: ImageVector, val content: @Composable () -> Unit)

@OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
@Composable
private fun HomeShell(title: String, tabs: List<Tab>) {
    var selected by remember { mutableIntStateOf(0) }
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(title) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                ),
            )
        },
        bottomBar = {
            NavigationBar {
                tabs.forEachIndexed { index, tab ->
                    NavigationBarItem(
                        selected = selected == index,
                        onClick = { selected = index },
                        icon = { Icon(tab.icon, contentDescription = tab.label) },
                        label = { Text(tab.label, fontSize = 11.sp) },
                    )
                }
            }
        },
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            tabs[selected].content()
        }
    }
}

@Composable
fun AdminHomeScreen(nav: NavController, onLoggedOut: () -> Unit) {
    HomeShell(
        title = "Musk-IT Admin",
        tabs = listOf(
            Tab("Dashboard", Icons.Filled.Home) { DashboardScreen() },
            Tab("Leads", Icons.Filled.Person) {
                LeadsScreen(Role.ADMIN, onOpenLead = { nav.navigate("lead/ADMIN/$it") })
            },
            Tab("Quotes", Icons.Filled.Email) {
                QuotationsScreen(Role.ADMIN, onOpen = { nav.navigate("quotation/$it") })
            },
            Tab("Payments", Icons.Filled.ShoppingCart) { PaymentsScreen(Role.ADMIN) },
            Tab("Account", Icons.Filled.Settings) {
                AccountScreen(showUsers = true, nav = nav, onLoggedOut = onLoggedOut)
            },
        ),
    )
}

@Composable
fun StaffHomeScreen(nav: NavController, onLoggedOut: () -> Unit) {
    HomeShell(
        title = "Musk-IT Staff",
        tabs = listOf(
            Tab("Leads", Icons.Filled.Person) {
                LeadsScreen(Role.STAFF, onOpenLead = { nav.navigate("lead/STAFF/$it") })
            },
            Tab("Quotes", Icons.Filled.Email) {
                QuotationsScreen(Role.STAFF, onOpen = { })
            },
            Tab("Payments", Icons.Filled.ShoppingCart) { PaymentsScreen(Role.STAFF) },
            Tab("Account", Icons.Filled.Settings) {
                AccountScreen(showUsers = false, nav = nav, onLoggedOut = onLoggedOut)
            },
        ),
    )
}

@Composable
private fun AccountScreen(showUsers: Boolean, nav: NavController, onLoggedOut: () -> Unit) {
    val session = Backend.currentSession
    val scope = rememberCoroutineScope()
    var working by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("Account", fontSize = 22.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(16.dp))
        Card(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp)) {
                InfoRow("Name", session?.name)
                InfoRow("Email", session?.email)
                InfoRow("Role", session?.role?.name?.lowercase()?.replaceFirstChar { it.uppercase() })
            }
        }
        Spacer(Modifier.height(20.dp))
        if (showUsers) {
            OutlinedButton(
                onClick = { nav.navigate("users") },
                modifier = Modifier.fillMaxWidth().height(50.dp),
            ) { Text("Manage staff users") }
            Spacer(Modifier.height(12.dp))
        }
        Button(
            onClick = {
                working = true
                scope.launch {
                    Backend.logout()
                    working = false
                    onLoggedOut()
                }
            },
            enabled = !working,
            modifier = Modifier.fillMaxWidth().height(52.dp),
        ) { Text("Log out") }
    }
}
