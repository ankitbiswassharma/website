"use client";

import { useEffect, useState } from "react";

import { apiJson } from "@/lib/api";

const TOKEN_KEY = "muskit_client_token";

export default function useClientSession() {
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [otpDigits, setOtpDigits] = useState(6);
  const [stage, setStage] = useState("email"); // "email" | "otp"
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_KEY) || "";
    if (stored) setToken(stored);
    setReady(true);
  }, []);

  function clearSession() {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setOtp("");
    setChallengeId("");
    setStage("email");
    setAuthError("");
    setAuthMessage("");
  }

  async function authFetch(path, options = {}) {
    if (!token) throw new Error("Unauthorized");
    try {
      return await apiJson(path, {
        ...options,
        headers: { "x-client-token": token, ...(options.headers || {}) },
      });
    } catch (error) {
      if (error.message === "Unauthorized") clearSession();
      throw error;
    }
  }

  async function requestOtp() {
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const res = await apiJson("/client/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setChallengeId(res.challenge_id);
      setOtpDigits(res.otp_digits);
      setStage("otp");
      setAuthMessage(res.message || `Code sent to ${res.masked_email}.`);
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
      const res = await apiJson("/client/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, challenge_id: challengeId, otp }),
      });
      window.localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setOtp("");
      setChallengeId("");
      setAuthMessage("");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function logout() {
    if (token) {
      try {
        await authFetch("/client/auth/logout", { method: "POST" });
      } catch {
        /* ignore */
      }
    }
    clearSession();
  }

  return {
    token, ready, email, setEmail, otp, setOtp, challengeId, otpDigits, stage, setStage,
    authError, authMessage, authLoading, requestOtp, verifyOtp, logout, authFetch,
  };
}
