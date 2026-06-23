"use client";

export default function AdminLoginCard({
  session,
  title = "OTP-protected dashboard",
  description = "Request a one-time code for the admin inbox, then enter it here to manage leads.",
}) {
  return (
    <section className="login-screen shell">
      <div className="login-card stack-md">
        <div className="auth-brand">
          <span className="brand-wordmark">
            <span>Musk</span>
            <span>-IT</span>
          </span>
        </div>
        <div className="eyebrow">Admin access</div>
        <h1 style={{ fontSize: "42px" }}>{title}</h1>
        <p>{description}</p>

        {session.authMessage ? <div className="success-box">{session.authMessage}</div> : null}
        {session.authError ? <div className="error-box">{session.authError}</div> : null}

        <div className="stack-sm">
          <div className="field">
            <label>Admin email</label>
            <input
              type="email"
              placeholder="Enter admin email"
              value={session.loginEmail}
              onChange={(event) => session.setLoginEmail(event.target.value)}
            />
          </div>

          {session.challengeId ? (
            <div className="field">
              <label>OTP</label>
              <input
                inputMode="numeric"
                maxLength={session.otpDigits}
                value={session.otp}
                onChange={(event) =>
                  session.setOtp(event.target.value.replace(/\D/g, "").slice(0, session.otpDigits))
                }
              />
            </div>
          ) : null}
        </div>

        <div className="dashboard-toolbar">
          <button
            className="button button-primary"
            type="button"
            onClick={session.challengeId ? session.verifyOtp : session.requestOtp}
            disabled={session.authLoading}
          >
            {session.authLoading
              ? "Please wait..."
              : session.challengeId
                ? "Verify OTP"
                : "Send OTP"}
          </button>

          {session.challengeId ? (
            <button className="button button-ghost" type="button" onClick={session.requestOtp}>
              Send fresh OTP
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
