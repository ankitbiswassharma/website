package `in`.muskit.admin.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import `in`.muskit.admin.network.Backend
import kotlinx.coroutines.launch

enum class LoginStep { CREDENTIALS, OTP }

// ---------------- Role selection ----------------

@Composable
fun RoleSelectScreen(onSelectAdmin: () -> Unit, onSelectStaff: () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("Musk-IT", fontSize = 34.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        Text(
            "Build | Automate | Grow",
            fontSize = 15.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 6.dp, bottom = 48.dp),
        )
        Button(onClick = onSelectAdmin, modifier = Modifier.fillMaxWidth().height(56.dp)) {
            Text("Admin Console", fontSize = 16.sp)
        }
        Spacer(Modifier.height(16.dp))
        OutlinedButton(onClick = onSelectStaff, modifier = Modifier.fillMaxWidth().height(56.dp)) {
            Text("Staff Portal", fontSize = 16.sp)
        }
        Text(
            "Admin signs in with email + OTP. Staff use email, password and OTP.",
            fontSize = 12.sp,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 40.dp),
        )
    }
}

// ---------------- Admin login ----------------

class AdminLoginViewModel : ViewModel() {
    var email by mutableStateOf("")
    var otp by mutableStateOf("")
    var step by mutableStateOf(LoginStep.CREDENTIALS)
        private set
    var loading by mutableStateOf(false)
        private set
    var error by mutableStateOf<String?>(null)
        private set
    var info by mutableStateOf<String?>(null)
        private set
    private var challengeId: String? = null

    fun requestOtp() {
        if (email.isBlank()) { error = "Enter your admin email."; return }
        loading = true; error = null
        viewModelScope.launch {
            val res = Backend.adminRequestOtp(email)
            loading = false
            res.onSuccess {
                challengeId = it.challenge_id
                step = LoginStep.OTP
                info = "OTP sent to ${it.masked_email ?: email}."
            }.onFailure { error = it.message }
        }
    }

    fun verify(onSuccess: () -> Unit) {
        val cid = challengeId ?: return
        if (otp.isBlank()) { error = "Enter the OTP."; return }
        loading = true; error = null
        viewModelScope.launch {
            val res = Backend.adminVerifyOtp(email, cid, otp)
            loading = false
            res.onSuccess { onSuccess() }.onFailure { error = it.message }
        }
    }

    fun back() { step = LoginStep.CREDENTIALS; otp = ""; error = null; info = null }
}

@Composable
fun AdminLoginScreen(onSuccess: () -> Unit, vm: AdminLoginViewModel = viewModel()) {
    AuthFormScaffold(title = "Admin Console") {
        if (vm.step == LoginStep.CREDENTIALS) {
            OutlinedTextField(
                value = vm.email,
                onValueChange = { vm.email = it },
                label = { Text("Admin email") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            )
            Spacer(Modifier.height(16.dp))
            PrimaryButton("Send OTP", vm.loading) { vm.requestOtp() }
        } else {
            OutlinedTextField(
                value = vm.otp,
                onValueChange = { vm.otp = it },
                label = { Text("Enter OTP") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            )
            Spacer(Modifier.height(16.dp))
            PrimaryButton("Verify & Sign in", vm.loading) { vm.verify(onSuccess) }
            TextButton(onClick = { vm.back() }) { Text("Use a different email") }
        }
        FormMessages(vm.info, vm.error)
    }
}

// ---------------- Staff login ----------------

class StaffLoginViewModel : ViewModel() {
    var email by mutableStateOf("")
    var password by mutableStateOf("")
    var otp by mutableStateOf("")
    var step by mutableStateOf(LoginStep.CREDENTIALS)
        private set
    var loading by mutableStateOf(false)
        private set
    var error by mutableStateOf<String?>(null)
        private set
    var info by mutableStateOf<String?>(null)
        private set
    private var challengeId: String? = null

    fun login() {
        if (email.isBlank() || password.isBlank()) { error = "Enter email and password."; return }
        loading = true; error = null
        viewModelScope.launch {
            val res = Backend.staffLogin(email, password)
            loading = false
            res.onSuccess {
                challengeId = it.challenge_id
                step = LoginStep.OTP
                info = "OTP sent to ${it.masked_email ?: email}."
            }.onFailure { error = it.message }
        }
    }

    fun verify(onSuccess: () -> Unit) {
        val cid = challengeId ?: return
        if (otp.isBlank()) { error = "Enter the OTP."; return }
        loading = true; error = null
        viewModelScope.launch {
            val res = Backend.staffVerifyOtp(email, cid, otp)
            loading = false
            res.onSuccess { onSuccess() }.onFailure { error = it.message }
        }
    }

    fun back() { step = LoginStep.CREDENTIALS; otp = ""; error = null; info = null }
}

@Composable
fun StaffLoginScreen(onSuccess: () -> Unit, vm: StaffLoginViewModel = viewModel()) {
    AuthFormScaffold(title = "Staff Portal") {
        if (vm.step == LoginStep.CREDENTIALS) {
            OutlinedTextField(
                value = vm.email,
                onValueChange = { vm.email = it },
                label = { Text("Email") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = vm.password,
                onValueChange = { vm.password = it },
                label = { Text("Password") },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            )
            Spacer(Modifier.height(16.dp))
            PrimaryButton("Continue", vm.loading) { vm.login() }
        } else {
            OutlinedTextField(
                value = vm.otp,
                onValueChange = { vm.otp = it },
                label = { Text("Enter OTP") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            )
            Spacer(Modifier.height(16.dp))
            PrimaryButton("Verify & Sign in", vm.loading) { vm.verify(onSuccess) }
            TextButton(onClick = { vm.back() }) { Text("Back") }
        }
        FormMessages(vm.info, vm.error)
    }
}

// ---------------- Shared bits ----------------

@Composable
private fun AuthFormScaffold(title: String, content: @Composable () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(28.dp),
        verticalArrangement = Arrangement.Center,
    ) {
        Text(title, fontSize = 26.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        Spacer(Modifier.height(24.dp))
        content()
    }
}

@Composable
private fun PrimaryButton(label: String, loading: Boolean, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        enabled = !loading,
        modifier = Modifier.fillMaxWidth().height(52.dp),
    ) {
        if (loading) CircularProgressIndicator(modifier = Modifier.height(22.dp), strokeWidth = 2.dp)
        else Text(label, fontSize = 16.sp)
    }
}

@Composable
private fun FormMessages(info: String?, error: String?) {
    if (!info.isNullOrBlank()) {
        Text(info, color = MaterialTheme.colorScheme.primary, fontSize = 13.sp, modifier = Modifier.padding(top = 12.dp))
    }
    if (!error.isNullOrBlank()) {
        Text(error, color = MaterialTheme.colorScheme.error, fontSize = 13.sp, modifier = Modifier.padding(top = 12.dp))
    }
}
