package `in`.muskit.admin.network


/*
 * Data transfer objects. Property names are snake_case to match the FastAPI
 * backend JSON exactly, so the Moshi reflective adapter maps them with no
 * per-field annotations. Monetary values arrive as strings (Pydantic serialises
 * Decimal to string); rates/percentages arrive as numbers.
 */

// ---------- Auth ----------

data class AdminOtpRequest(val email: String)

data class AdminOtpRequestResponse(
    val challenge_id: String,
    val masked_email: String? = null,
    val expires_in_seconds: Int? = null,
    val otp_digits: Int? = null,
)

data class AdminOtpVerify(val email: String, val challenge_id: String, val otp: String)

data class AdminSession(
    val token: String,
    val admin_email: String,
    val expires_at: String? = null,
)

data class StaffLogin(val email: String, val password: String)

data class StaffOtpChallenge(
    val challenge_id: String,
    val masked_email: String? = null,
    val otp_digits: Int? = null,
    val expires_in_seconds: Int? = null,
)

data class StaffOtpVerify(val email: String, val challenge_id: String, val otp: String)

data class StaffSession(
    val token: String,
    val email: String,
    val name: String,
    val must_change_password: Boolean = false,
    val expires_at: String? = null,
)

data class StaffMe(val email: String, val name: String, val must_change_password: Boolean = false)

data class StaffChangePassword(val current_password: String, val new_password: String)

data class ApiMessage(val message: String? = null)

// ---------- Dashboard ----------

data class DashboardSummary(
    val total_leads: Int = 0,
    val qualified_leads: Int = 0,
    val proposal_sent: Int = 0,
    val won_leads: Int = 0,
    val lost_leads: Int = 0,
    val conversion_rate: Double = 0.0,
    val revenue: String = "0",
)

data class FunnelStage(
    val key: String,
    val label: String,
    val count: Int = 0,
    val pct_of_total: Double = 0.0,
    val conversion_from_prev: Double = 0.0,
)

data class FunnelSourceRow(val source: String, val count: Int = 0)

data class FunnelTrendPoint(val month: String, val leads: Int = 0)

data class Funnel(
    val total_leads: Int = 0,
    val won_leads: Int = 0,
    val paid_leads: Int = 0,
    val revenue: String = "0",
    val win_rate: Double = 0.0,
    val stages: List<FunnelStage> = emptyList(),
    val sources: List<FunnelSourceRow> = emptyList(),
    val trend: List<FunnelTrendPoint> = emptyList(),
)

// ---------- Leads ----------

data class LeadListItem(
    val id: String,
    val full_name: String = "",
    val email: String = "",
    val phone: String? = null,
    val company: String? = null,
    val lead_reference: String? = null,
    val project_type: String? = null,
    val request_type: String? = null,
    val status: String = "new",
    val created_at: String? = null,
    val updated_at: String? = null,
    val preferred_demo_date: String? = null,
    val preferred_demo_time: String? = null,
    val assigned_staff_id: String? = null,
    val assigned_staff_name: String? = null,
)

data class LeadActivity(
    val id: Long? = null,
    val activity_type: String = "",
    val description: String = "",
    val created_by: String = "",
    val created_at: String? = null,
)

data class LeadDetail(
    val id: String,
    val full_name: String = "",
    val email: String = "",
    val phone: String? = null,
    val company: String? = null,
    val lead_reference: String? = null,
    val project_type: String? = null,
    val request_type: String? = null,
    val status: String = "new",
    val created_at: String? = null,
    val updated_at: String? = null,
    val preferred_demo_date: String? = null,
    val preferred_demo_time: String? = null,
    val assigned_staff_id: String? = null,
    val assigned_staff_name: String? = null,
    val designation: String? = null,
    val source: String? = null,
    val client_requirements_html: String? = null,
    val client_requirements_text: String? = null,
    val admin_notes: String? = null,
    val latest_quotation_id: String? = null,
    val latest_quotation_number: String? = null,
    val latest_quote_code: String? = null,
    val latest_payment_status: String? = null,
    val activities: List<LeadActivity> = emptyList(),
)

data class LeadUpdate(val status: String? = null, val admin_notes: String? = null)

data class LeadNotesUpdate(val admin_notes: String? = null)

// ---------- Quotations ----------

data class QuotationItem(
    val id: Long? = null,
    val title: String = "",
    val description: String? = null,
    val unit: String? = null,
    val quantity: String = "0",
    val unit_price: String = "0",
    val line_total: String = "0",
)

data class QuotationSection(val title: String = "", val content: String = "")

data class AdminQuotation(
    val id: String,
    val quotation_number: String = "",
    val quote_code: String = "",
    val status: String = "draft",
    val title: String = "",
    val intro_message: String? = null,
    val requirements_summary: String? = null,
    val tax_label: String = "Tax",
    val tax_rate: String = "0",
    val subtotal: String = "0",
    val tax_amount: String = "0",
    val total_amount: String = "0",
    val currency: String = "INR",
    val valid_until: String? = null,
    val pdf_path: String? = null,
    val payment_page_url: String? = null,
    val sent_at: String? = null,
    val created_at: String? = null,
    val updated_at: String? = null,
    val items: List<QuotationItem> = emptyList(),
    val sections: List<QuotationSection> = emptyList(),
    val lead_id: String = "",
    val docx_path: String? = null,
    val personalized_message: String? = null,
    val lead_name: String = "",
    val company: String? = null,
    val lead_email: String = "",
)

data class QuotationSend(val personalized_message: String? = null)

data class PaymentLinkCreate(val message: String? = null, val send_email: Boolean = true)

data class PaymentLinkResult(
    val success: Boolean = true,
    val quotation_id: String? = null,
    val quote_code: String? = null,
    val payment_id: String? = null,
    val status: String? = null,
    val mode: String? = null,
    val order_id: String? = null,
    val payment_page_url: String? = null,
    val email_sent: Boolean = false,
    val message: String = "",
)

// ---------- Payments ----------

data class Payment(
    val id: String,
    val lead_id: String = "",
    val quotation_id: String = "",
    val lead_name: String? = null,
    val company: String? = null,
    val quotation_number: String? = null,
    val status: String = "pending",
    val provider: String = "",
    val currency: String = "INR",
    val subtotal: String = "0",
    val tax_amount: String = "0",
    val total_amount: String = "0",
    val receipt: String? = null,
    val razorpay_order_id: String? = null,
    val razorpay_payment_id: String? = null,
    val invoice_number: String? = null,
    val paid_at: String? = null,
    val created_at: String? = null,
)

// ---------- Users / Companies ----------

data class StaffUser(
    val id: String,
    val name: String = "",
    val email: String = "",
    val phone: String? = null,
    val qualification: String? = null,
    val gender: String? = null,
    val is_active: Boolean = true,
    val must_change_password: Boolean = false,
    val last_login_at: String? = null,
    val created_at: String? = null,
)

data class Company(
    val id: String,
    val name: String = "",
    val company_code: String = "",
    val contact_person: String? = null,
    val contact_email: String? = null,
    val login_url: String? = null,
    val is_active: Boolean = true,
    val created_at: String? = null,
)
