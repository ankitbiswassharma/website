package `in`.muskit.admin.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import `in`.muskit.admin.data.Role
import `in`.muskit.admin.network.Backend
import `in`.muskit.admin.network.DashboardSummary
import `in`.muskit.admin.network.Funnel
import `in`.muskit.admin.network.Payment
import `in`.muskit.admin.network.StaffUser
import kotlinx.coroutines.launch

// ---------------- Dashboard (admin) ----------------

data class DashboardData(val summary: DashboardSummary, val funnel: Funnel)

class DashboardViewModel : ViewModel() {
    var state by mutableStateOf<UiState<DashboardData>>(UiState.Loading)
        private set

    fun load() {
        state = UiState.Loading
        viewModelScope.launch {
            val res = Backend.call {
                val summary = Backend.service.adminSummary()
                val funnel = Backend.service.adminFunnel()
                DashboardData(summary, funnel)
            }
            state = res.fold({ UiState.Success(it) }, { UiState.Error(it.message ?: "Failed to load dashboard") })
        }
    }
}

@Composable
fun DashboardScreen(vm: DashboardViewModel = viewModel()) {
    LaunchedEffect(Unit) { if (vm.state is UiState.Loading) vm.load() }
    when (val s = vm.state) {
        is UiState.Loading -> LoadingBox()
        is UiState.Error -> ErrorBox(s.message) { vm.load() }
        is UiState.Success -> {
            val d = s.data
            LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
                item {
                    Text("Overview", fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(12.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        KpiCard("Total leads", d.summary.total_leads.toString(), Modifier.weight(1f))
                        KpiCard("Won", d.summary.won_leads.toString(), Modifier.weight(1f))
                    }
                    Spacer(Modifier.height(12.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        KpiCard("Conversion", "${"%.1f".format(d.summary.conversion_rate)}%", Modifier.weight(1f))
                        KpiCard("Revenue", money("INR", d.summary.revenue), Modifier.weight(1f))
                    }
                    Spacer(Modifier.height(20.dp))
                    SectionTitle("Pipeline funnel")
                }
                items(d.funnel.stages) { stage ->
                    Column(Modifier.fillMaxWidth().padding(vertical = 6.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(stage.label, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                            Text("${stage.count}", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Spacer(Modifier.height(4.dp))
                        Box(
                            Modifier.fillMaxWidth().height(10.dp).clip(RoundedCornerShape(50))
                                .background(MaterialTheme.colorScheme.surfaceVariant),
                        ) {
                            val frac = (stage.pct_of_total / 100.0).toFloat().coerceIn(0f, 1f)
                            Box(
                                Modifier.fillMaxWidth(frac).height(10.dp).clip(RoundedCornerShape(50))
                                    .background(statusColor(stage.key)),
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun KpiCard(label: String, value: String, modifier: Modifier = Modifier) {
    Card(modifier) {
        Column(Modifier.padding(16.dp)) {
            Text(label, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        }
    }
}

// ---------------- Payments ----------------

class PaymentsViewModel : ViewModel() {
    var state by mutableStateOf<UiState<List<Payment>>>(UiState.Loading)
        private set

    fun load(role: Role) {
        state = UiState.Loading
        viewModelScope.launch {
            val res = Backend.call {
                if (role == Role.ADMIN) Backend.service.adminPayments() else Backend.service.staffPayments()
            }
            state = res.fold({ UiState.Success(it) }, { UiState.Error(it.message ?: "Failed to load payments") })
        }
    }
}

@Composable
fun PaymentsScreen(role: Role, vm: PaymentsViewModel = viewModel()) {
    LaunchedEffect(role) { if (vm.state is UiState.Loading) vm.load(role) }
    when (val s = vm.state) {
        is UiState.Loading -> LoadingBox()
        is UiState.Error -> ErrorBox(s.message) { vm.load(role) }
        is UiState.Success -> {
            if (s.data.isEmpty()) {
                EmptyBox("No payments yet.")
            } else {
                LazyColumn(Modifier.fillMaxSize().padding(12.dp)) {
                    items(s.data, key = { it.id }) { p ->
                        Card(Modifier.fillMaxWidth().padding(vertical = 6.dp)) {
                            Column(Modifier.padding(16.dp)) {
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text(p.lead_name ?: p.quotation_number ?: p.id, fontWeight = FontWeight.SemiBold)
                                    StatusChip(p.status)
                                }
                                if (!p.company.isNullOrBlank()) {
                                    Text(p.company, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                if (!p.invoice_number.isNullOrBlank()) {
                                    Text("Invoice ${p.invoice_number}", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                Text(
                                    money(p.currency, p.total_amount),
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.padding(top = 4.dp),
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

// ---------------- Users (admin) ----------------

class UsersViewModel : ViewModel() {
    var state by mutableStateOf<UiState<List<StaffUser>>>(UiState.Loading)
        private set

    fun load() {
        state = UiState.Loading
        viewModelScope.launch {
            val res = Backend.call { Backend.service.adminUsers() }
            state = res.fold({ UiState.Success(it) }, { UiState.Error(it.message ?: "Failed to load users") })
        }
    }
}

@Composable
fun UsersScreen(vm: UsersViewModel = viewModel()) {
    LaunchedEffect(Unit) { if (vm.state is UiState.Loading) vm.load() }
    when (val s = vm.state) {
        is UiState.Loading -> LoadingBox()
        is UiState.Error -> ErrorBox(s.message) { vm.load() }
        is UiState.Success -> {
            if (s.data.isEmpty()) {
                EmptyBox("No staff users yet.")
            } else {
                LazyColumn(Modifier.fillMaxSize().padding(12.dp)) {
                    items(s.data, key = { it.id }) { u ->
                        Card(Modifier.fillMaxWidth().padding(vertical = 6.dp)) {
                            Column(Modifier.padding(16.dp)) {
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text(u.name, fontWeight = FontWeight.SemiBold)
                                    StatusChip(if (u.is_active) "active" else "inactive")
                                }
                                Text(u.email, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                if (!u.phone.isNullOrBlank()) {
                                    Text(u.phone, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ---------------- Profile ----------------

@Composable
fun ProfileScreen(onLoggedOut: () -> Unit) {
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
        Spacer(Modifier.height(24.dp))
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
