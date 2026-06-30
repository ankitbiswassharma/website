package `in`.muskit.admin.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import `in`.muskit.admin.data.Role
import `in`.muskit.admin.network.AdminQuotation
import `in`.muskit.admin.network.Backend
import `in`.muskit.admin.network.PaymentLinkCreate
import `in`.muskit.admin.network.QuotationSend
import kotlinx.coroutines.launch

// ---------------- Quotations list ----------------

class QuotationsViewModel : ViewModel() {
    var state by mutableStateOf<UiState<List<AdminQuotation>>>(UiState.Loading)
        private set

    fun load(role: Role) {
        state = UiState.Loading
        viewModelScope.launch {
            val res = Backend.call {
                if (role == Role.ADMIN) Backend.service.adminQuotations() else Backend.service.staffQuotations()
            }
            state = res.fold({ UiState.Success(it) }, { UiState.Error(it.message ?: "Failed to load quotations") })
        }
    }
}

@Composable
fun QuotationsScreen(role: Role, onOpen: (String) -> Unit, vm: QuotationsViewModel = viewModel()) {
    LaunchedEffect(role) { if (vm.state is UiState.Loading) vm.load(role) }
    when (val s = vm.state) {
        is UiState.Loading -> LoadingBox()
        is UiState.Error -> ErrorBox(s.message) { vm.load(role) }
        is UiState.Success -> {
            if (s.data.isEmpty()) {
                EmptyBox("No quotations yet.")
            } else {
                LazyColumn(Modifier.fillMaxSize().padding(12.dp)) {
                    items(s.data, key = { it.id }) { q ->
                        Card(
                            Modifier.fillMaxWidth().padding(vertical = 6.dp)
                                .clickable(enabled = role == Role.ADMIN) { onOpen(q.id) },
                        ) {
                            Column(Modifier.padding(16.dp)) {
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text(q.quotation_number.ifBlank { q.quote_code }, fontWeight = FontWeight.SemiBold)
                                    StatusChip(q.status)
                                }
                                Text(q.lead_name.ifBlank { q.title }, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                                if (!q.company.isNullOrBlank()) {
                                    Text(q.company, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                                }
                                Text(
                                    money(q.currency, q.total_amount),
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

// ---------------- Quotation detail (admin) ----------------

class QuotationDetailViewModel : ViewModel() {
    var state by mutableStateOf<UiState<AdminQuotation>>(UiState.Loading)
        private set
    var message by mutableStateOf("")
    var working by mutableStateOf(false)
        private set
    var toast by mutableStateOf<String?>(null)

    fun load(id: String) {
        state = UiState.Loading
        viewModelScope.launch {
            val res = Backend.call { Backend.service.adminQuotation(id) }
            state = res.fold({ UiState.Success(it) }, { UiState.Error(it.message ?: "Failed to load") })
        }
    }

    fun send(id: String) {
        working = true
        viewModelScope.launch {
            val res = Backend.call {
                Backend.service.adminSendQuotation(id, QuotationSend(message.ifBlank { null }))
            }
            working = false
            res.onSuccess { state = UiState.Success(it); toast = "Quotation sent" }
                .onFailure { toast = it.message }
        }
    }

    fun createPaymentLink(id: String) {
        working = true
        viewModelScope.launch {
            val res = Backend.call {
                Backend.service.adminCreatePaymentLink(id, PaymentLinkCreate(message.ifBlank { null }, true))
            }
            working = false
            res.onSuccess { toast = it.message.ifBlank { "Payment link created" } }
                .onFailure { toast = it.message }
        }
    }
}

@Composable
fun QuotationDetailScreen(quotationId: String, vm: QuotationDetailViewModel = viewModel()) {
    LaunchedEffect(quotationId) { vm.load(quotationId) }
    when (val s = vm.state) {
        is UiState.Loading -> LoadingBox()
        is UiState.Error -> ErrorBox(s.message) { vm.load(quotationId) }
        is UiState.Success -> {
            val q = s.data
            LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
                item {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(q.quotation_number.ifBlank { q.quote_code }, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        StatusChip(q.status)
                    }
                    Text(q.title, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(12.dp))
                    Card(Modifier.fillMaxWidth()) {
                        Column(Modifier.padding(16.dp)) {
                            InfoRow("Client", q.lead_name)
                            InfoRow("Company", q.company)
                            InfoRow("Email", q.lead_email)
                            InfoRow("Valid until", q.valid_until)
                            Divider(Modifier.padding(vertical = 8.dp))
                            InfoRow("Subtotal", money(q.currency, q.subtotal))
                            InfoRow(q.tax_label, money(q.currency, q.tax_amount))
                            Row(Modifier.fillMaxWidth().padding(top = 6.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Total", fontWeight = FontWeight.Bold)
                                Text(money(q.currency, q.total_amount), fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                            }
                        }
                    }

                    if (q.items.isNotEmpty()) {
                        Spacer(Modifier.height(16.dp))
                        SectionTitle("Line items")
                    }
                }
                items(q.items) { item ->
                    Card(Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                        Column(Modifier.padding(12.dp)) {
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(item.title, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                                Text(money(q.currency, item.line_total), fontSize = 14.sp)
                            }
                            Text(
                                "${item.quantity} ${item.unit ?: ""} × ${money(q.currency, item.unit_price)}",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
                item {
                    Spacer(Modifier.height(16.dp))
                    SectionTitle("Actions")
                    OutlinedTextField(
                        value = vm.message,
                        onValueChange = { vm.message = it },
                        label = { Text("Optional message to client") },
                        modifier = Modifier.fillMaxWidth().height(100.dp),
                    )
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Button(onClick = { vm.send(quotationId) }, enabled = !vm.working) {
                            Text("Send to client")
                        }
                        OutlinedButton(onClick = { vm.createPaymentLink(quotationId) }, enabled = !vm.working) {
                            Text("Payment link")
                        }
                    }
                    Spacer(Modifier.height(24.dp))
                }
            }
        }
    }
    val toast = vm.toast
    if (toast != null) Snack(toast) { vm.toast = null }
}
