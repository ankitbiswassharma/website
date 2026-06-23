"use client";

export default function StaffLoginCard({ session }) {
  const stage = session.challengeId ? "otp" : "credentials";

  function onSubmit(event) {
    event.preventDefault();
    if (stage === "otp") {
      session.verifyOtp();
    } else {
      session.requestOtp();
    }
  }

  return (
    <section className="login-screen shell">
      <div className="login-card stack-md">
        <div className="eyebrow">Staff access</div>
        <h1 style={{ fontSize: "42px" }}>Staff sign-in</h1>
        <p>
          Sign in with your email and password. We&apos;ll send a one-time passcode to your email to
          finish login.
        </p>

        {session.authMessage ? <div className="success-box">{session.authMessage}</div> : null}
        {session.authError ? <div className="error-box">{session.authError}</div> : null}

        <form className="stack-sm" onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={session.loginEmail}
              disabled={stage === "otp"}
              onChange={(event) => session.setLoginEmail(event.target.value)}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="Enter your password"
              value={session.password}
              disabled={stage === "otp"}
              onChange={(event) => session.setPassword(event.target.value)}
            />
          </div>

          {stage === "otp" ? (
            <div className="field">
              <label>OTP</label>
              <input
                inputMode="numeric"
                autoFocus
                maxLength={session.otpDigits}
                placeholder={`${session.otpDigits}-digit code`}
                value={session.otp}
                onChange={(event) =>
                  session.setOtp(event.target.value.replace(/\D/g, "").slice(0, session.otpDigits))
                }
              />
            </div>
          ) : null}

          <div className="dashboard-toolbar">
            <button className="button button-primary" type="submit" disabled={session.authLoading}>
              {session.authLoading
                ? "Please wait..."
                : stage === "otp"
                  ? "Verify OTP"
                  : "Send OTP"}
            </button>
            {stage === "otp" ? (
              <button
                className="button button-ghost"
                type="button"
                disabled={session.authLoading}
                onClick={session.requestOtp}
              >
                Resend code
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
