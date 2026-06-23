"use client";

import { useEffect, useState } from "react";

import { apiJson } from "@/lib/api";

const TOKEN_STORAGE_KEY = "muskit_staff_token";

export default function useStaffSession() {
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [otpDigits, setOtpDigits] = useState(6);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY) || "";
    if (storedToken) {
      setToken(storedToken);
    }
    setReady(true);
  }, []);

  function clearSession() {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken("");
    setProfile(null);
    setOtp("");
    setPassword("");
    setChallengeId("");
    setAuthError("");
    setAuthMessage("");
  }

  async function authFetch(path, options = {}) {
    if (!token) {
      throw new Error("Unauthorized");
    }
    try {
      return await apiJson(path, {
        ...options,
        headers: {
          "x-staff-token": token,
          ...(options.headers || {}),
        },
      });
    } catch (error) {
      if (error.message === "Unauthorized") {
        clearSession();
      }
      throw error;
    }
  }

  async function loadProfile() {
    if (!token) return;
    try {
      const me = await authFetch("/staff/auth/me");
      setProfile(me);
    } catch {
      // handled by authFetch (clears on unauthorized)
    }
  }

  useEffect(() => {
    if (token) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function requestOtp() {
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const response = await apiJson("/staff/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password }),
      });
      setChallengeId(response.challenge_id);
      setOtpDigits(response.otp_digits);
      setAuthMessage(response.message || `OTP sent to ${response.masked_email}.`);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function verifyOtp() {
    setAuthLoading(true);
    setAuthError("");
    try {
      const response = await apiJson("/staff/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, challenge_id: challengeId, otp }),
      });
      window.localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      setToken(response.token);
      setProfile({
        email: response.email,
        name: response.name,
        must_change_password: response.must_change_password,
      });
      setOtp("");
      setPassword("");
      setChallengeId("");
      setAuthMessage("");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function changePassword(currentPassword, newPassword) {
    await authFetch("/staff/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    setProfile((current) => (current ? { ...current, must_change_password: false } : current));
  }

  async function logout() {
    if (token) {
      try {
        await authFetch("/staff/auth/logout", { method: "POST" });
      } catch {}
    }
    clearSession();
  }

  return {
    token,
    ready,
    profile,
    loginEmail,
    setLoginEmail,
    password,
    setPassword,
    otp,
    setOtp,
    challengeId,
    otpDigits,
    authError,
    authMessage,
    authLoading,
    requestOtp,
    verifyOtp,
    changePassword,
    logout,
    authFetch,
  };
}
