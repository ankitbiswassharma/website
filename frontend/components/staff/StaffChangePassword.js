"use client";

import { useState } from "react";

export default function StaffChangePassword({ session, forced = false, onDone }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    try {
      await session.changePassword(currentPassword, newPassword);
      setMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      if (onDone) onDone();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card dashboard-card stack-md">
      <div className="stack-sm">
        <div className="eyebrow">Account security</div>
        <h3>{forced ? "Set a new password" : "Change password"}</h3>
        <p>
          {forced
            ? "Before you continue, please replace the temporary password from your welcome email."
            : "Update the password you use to sign in."}
        </p>
      </div>

      {message ? <div className="success-box">{message}</div> : null}
      {error ? <div className="error-box">{error}</div> : null}

      <form className="stack-sm" onSubmit={handleSubmit}>
        <div className="field">
          <label>{forced ? "Temporary password" : "Current password"}</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </div>
        <div className="field">
          <label>New password</label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <div className="field">
          <label>Confirm new password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        <div className="dashboard-toolbar">
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Update password"}
          </button>
        </div>
      </form>
    </div>
  );
}
