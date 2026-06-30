package `in`.muskit.admin.network

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * Retrofit description of the Musk-IT platform API (/api/v1). The auth header
 * (X-Admin-Token / X-Staff-Token) is injected by [AuthInterceptor].
 */
interface ApiService {

    // ---- Admin auth ----
    @POST("admin/auth/request-otp")
    suspend fun adminRequestOtp(@Body body: AdminOtpRequest): AdminOtpRequestResponse

    @POST("admin/auth/verify-otp")
    suspend fun adminVerifyOtp(@Body body: AdminOtpVerify): AdminSession

    @POST("admin/auth/logout")
    suspend fun adminLogout(): ApiMessage

    // ---- Staff auth ----
    @POST("staff/auth/login")
    suspend fun staffLogin(@Body body: StaffLogin): StaffOtpChallenge

    @POST("staff/auth/verify-otp")
    suspend fun staffVerifyOtp(@Body body: StaffOtpVerify): StaffSession

    @GET("staff/auth/me")
    suspend fun staffMe(): StaffMe

    @POST("staff/auth/change-password")
    suspend fun staffChangePassword(@Body body: StaffChangePassword): ApiMessage

    @POST("staff/auth/logout")
    suspend fun staffLogout(): ApiMessage

    // ---- Admin dashboard ----
    @GET("admin/dashboard/summary")
    suspend fun adminSummary(): DashboardSummary

    @GET("admin/dashboard/funnel")
    suspend fun adminFunnel(): Funnel

    @GET("admin/payments")
    suspend fun adminPayments(): List<Payment>

    // ---- Admin leads ----
    @GET("admin/leads")
    suspend fun adminLeads(
        @Query("status_filter") status: String? = null,
        @Query("search") search: String? = null,
    ): List<LeadListItem>

    @GET("admin/leads/{id}")
    suspend fun adminLead(@Path("id") id: String): LeadDetail

    @PATCH("admin/leads/{id}")
    suspend fun adminUpdateLead(@Path("id") id: String, @Body body: LeadUpdate): LeadDetail

    @PATCH("admin/leads/{id}/notes")
    suspend fun adminUpdateLeadNotes(@Path("id") id: String, @Body body: LeadNotesUpdate): LeadDetail

    // ---- Admin quotations ----
    @GET("admin/quotations")
    suspend fun adminQuotations(): List<AdminQuotation>

    @GET("admin/quotations/{id}")
    suspend fun adminQuotation(@Path("id") id: String): AdminQuotation

    @POST("admin/quotations/{id}/send")
    suspend fun adminSendQuotation(@Path("id") id: String, @Body body: QuotationSend): AdminQuotation

    @POST("admin/quotations/{id}/payment-link")
    suspend fun adminCreatePaymentLink(
        @Path("id") id: String,
        @Body body: PaymentLinkCreate,
    ): PaymentLinkResult

    // ---- Admin users / companies ----
    @GET("admin/users")
    suspend fun adminUsers(): List<StaffUser>

    @GET("admin/companies")
    suspend fun adminCompanies(): List<Company>

    // ---- Staff data ----
    @GET("staff/leads")
    suspend fun staffLeads(
        @Query("status_filter") status: String? = null,
        @Query("search") search: String? = null,
    ): List<LeadListItem>

    @GET("staff/leads/{id}")
    suspend fun staffLead(@Path("id") id: String): LeadDetail

    @PATCH("staff/leads/{id}")
    suspend fun staffUpdateLead(@Path("id") id: String, @Body body: LeadUpdate): LeadDetail

    @PATCH("staff/leads/{id}/notes")
    suspend fun staffUpdateLeadNotes(@Path("id") id: String, @Body body: LeadNotesUpdate): LeadDetail

    @GET("staff/quotations")
    suspend fun staffQuotations(): List<AdminQuotation>

    @GET("staff/payments")
    suspend fun staffPayments(): List<Payment>
}
