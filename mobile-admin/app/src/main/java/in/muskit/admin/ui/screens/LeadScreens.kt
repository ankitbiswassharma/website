package `in`.muskit.admin.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.Card
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
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
import `in`.muskit.admin.network.Backend
import `in`.muskit.admin.network.LeadDetail
import `in`.muskit.admin.network.LeadListItem
import `in`.muskit.admin.network.LeadNotesUpdate
import `in`.muskit.admin.network.LeadUpdate
import kotlinx.coroutines.launch

val LEAD_STATUSES = listOf("new", "contacted", "qualified", "proposal_sent", "won", "lost")

// ---------------- Leads list ----------------

class LeadsViewModel : ViewModel() {
    var state by mutableStateOf<UiState<List<LeadListItem>>>(UiState.Loading)
        private set
    var search by mutableStateOf("")
    var statusFilter by mutableStateOf<String?>(null)
        private set

    fun setFilter(role: Role, status: String?) {
        statusFilter = status
        load(role)
    }

    fun load(role: Role) {
        state = UiState.Loading
        viewModelScope.launch {
            val res = Backend.call {
                val s = search.ifBlank { null }
                if (role == Role.ADMIN) Backend.service.adminLeads(statusFilter, s)
                else Backend.service.staffLeads(statusFilter, s)
            }
            state = res.fold({ UiState.Success(it) }, { UiState.Error(it.message ?: "Failed to load leads") })
        }
    }
}

@OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
@Composable
fun LeadsScreen(role: Role, onOpenLead: (String) -> Unit, vm: LeadsViewModel = viewModel()) {
    LaunchedEffect(role) { if (vm.state is UiState.Loading) vm.load(role) }

    Column(Modifier.fillMaxSize()) {
        OutlinedTextField(
            value = vm.search,
            onValueChange = { vm.search = it },
            label = { Text("Search leads") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
        )
        Row(
            Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            FilterChip(
                selected = vm.statusFilter == null,
                onClick = { vm.setFilter(role, null) },
                label = { Text("All") },
            )
            LEAD_STATUSES.forEach { st ->
                FilterChip(
                    selected = vm.statusFilter == st,
                    onClick = { vm.setFilter(role, st) },
                    label = { Text(st.replace('_', ' ')) },
                )
            }
        }
        Spacer(Modifier.height(4.dp))

        when (val s = vm.state) {
            is UiState.Loading -> LoadingBox()
            is UiState.Error -> ErrorBox(s.message) { vm.load(role) }
            is UiState.Success -> {
                if (s.data.isEmpty()) {
                    EmptyBox("No leads found.")
                } else {
                    LazyColumn(Modifier.fillMaxSize().padding(horizontal = 12.dp)) {
                        items(s.data, key = { it.id }) { lead ->
                            LeadCard(lead) { onOpenLead(lead.id) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun LeadCard(lead: LeadListItem, onClick: () -> Unit) {
    Card(
        Modifier.fillMaxWidth().padding(vertical = 6.dp).clickable(onClick = onClick),
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(lead.full_name.ifBlank { lead.email }, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
                StatusChip(lead.status)
            }
            if (!lead.company.isNullOrBlank()) {
                Text(lead.company, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
            }
            Text(lead.email, color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
            if (!lead.assigned_staff_name.isNullOrBlank()) {
                Text("Assigned: ${lead.assigned_staff_name}", fontSize = 12.sp, color = MaterialTheme.colorScheme.primary)
            }
        }
    }
}

// ---------------- Lead detail ----------------

class LeadDetailViewModel : ViewModel() {
    var state by mutableStateOf<UiState<LeadDetail>>(UiState.Loading)
        private set
    var notes by mutableStateOf("")
    var working by mutableStateOf(false)
        private set
    var toast by mutableStateOf<String?>(null)

    fun load(role: Role, id: String) {
        state = UiState.Loading
        viewModelScope.launch {
            val res = Backend.call {
                if (role == Role.ADMIN) Backend.service.adminLead(id) else Backend.service.staffLead(id)
            }
            res.onSuccess { notes = it.admin_notes ?: "" }
            state = res.fold({ UiState.Success(it) }, { UiState.Error(it.message ?: "Failed to load lead") })
        }
    }

    fun changeStatus(role: Role, id: String, status: String) {
        working = true
        viewModelScope.launch {
            val res = Backend.call {
                if (role == Role.ADMIN) Backend.service.adminUpdateLead(id, LeadUpdate(status = status))
                else Backend.service.staffUpdateLead(id, LeadUpdate(status = status))
            }
            working = false
            res.onSuccess { state = UiState.Success(it); toast = "Status updated" }
                .onFailure { toast = it.message }
        }
    }

    fun saveNotes(role: Role, id: String) {
        working = true
        viewModelScope.launch {
            val res = Backend.call {
                if (role == Role.ADMIN) Backend.service.adminUpdateLeadNotes(id, LeadNotesUpdate(notes))
                else Backend.service.staffUpdateLeadNotes(id, LeadNotesUpdate(notes))
            }
            working = false
            res.onSuccess { state = UiState.Success(it); toast = "Notes saved" }
                .onFailure { toast = it.message }
        }
    }
}

@OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
@Composable
fun LeadDetailScreen(role: Role, leadId: String, vm: LeadDetailViewModel = viewModel()) {
    LaunchedEffect(leadId) { vm.load(role, leadId) }

    when (val s = vm.state) {
        is UiState.Loading -> LoadingBox()
        is UiState.Error -> ErrorBox(s.message) { vm.load(role, leadId) }
        is UiState.Success -> {
            val lead = s.data
            LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
                item {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(lead.full_name, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                        StatusChip(lead.status)
                    }
                    Spacer(Modifier.height(12.dp))
                    Card(Modifier.fillMaxWidth()) {
                        Column(Modifier.padding(16.dp)) {
                            InfoRow("Email", lead.email)
                            InfoRow("Phone", lead.phone)
                            InfoRow("Company", lead.company)
                            InfoRow("Reference", lead.lead_reference)
                            InfoRow("Project", lead.project_type)
                            InfoRow("Source", lead.source)
                            InfoRow("Assigned", lead.assigned_staff_name)
                            InfoRow("Created", lead.created_at)
                        }
                    }

                    val requirements = lead.client_requirements_text?.takeIf { it.isNotBlank() }
                    if (requirements != null) {
                        Spacer(Modifier.height(12.dp))
                        SectionTitle("Requirements")
                        Card(Modifier.fillMaxWidth()) {
                            Text(requirements, Modifier.padding(16.dp), fontSize = 14.sp)
                        }
                    }

                    Spacer(Modifier.height(16.dp))
                    SectionTitle("Update status")
                    Row(
                        Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        LEAD_STATUSES.forEach { st ->
                            FilterChip(
                                selected = lead.status == st,
                                onClick = { if (!vm.working) vm.changeStatus(role, leadId, st) },
                                label = { Text(st.replace('_', ' ')) },
                            )
                        }
                    }

                    Spacer(Modifier.height(16.dp))
                    SectionTitle("Notes")
                    OutlinedTextField(
                        value = vm.notes,
                        onValueChange = { vm.notes = it },
                        modifier = Modifier.fillMaxWidth().height(120.dp),
                        label = { Text("Internal notes") },
                    )
                    androidx.compose.material3.Button(
                        onClick = { vm.saveNotes(role, leadId) },
                        enabled = !vm.working,
                        modifier = Modifier.padding(top = 8.dp),
                    ) { Text("Save notes") }

                    if (lead.activities.isNotEmpty()) {
                        Spacer(Modifier.height(16.dp))
                        SectionTitle("Activity")
                    }
                }
                items(lead.activities) { act ->
                    Card(Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                        Column(Modifier.padding(12.dp)) {
                            Text(act.description, fontSize = 14.sp)
                            Text(
                                "${act.created_by} · ${act.created_at ?: ""}",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
            }
        }
    }

    val toast = vm.toast
    if (toast != null) {
        Snack(toast) { vm.toast = null }
    }
}

@Composable
fun SectionTitle(text: String) {
    Text(
        text,
        fontWeight = FontWeight.SemiBold,
        fontSize = 15.sp,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(bottom = 8.dp),
    )
}
