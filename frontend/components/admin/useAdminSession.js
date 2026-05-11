"use client";

import { useEffect, useState } from "react";

import { apiJson, buildApiUrl } from "@/lib/api";

const TOKEN_STORAGE_KEY = "muskit_admin_token";
const DEFAULT_ADMIN_EMAIL = "ankitbiswassharma@muskit.in";

export default function useAdminSession() {
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [loginEmail, setLoginEmail] = useState(DEFAULT_ADMIN_EMAIL);
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
    setOtp("");
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
          "x-admin-token": token,
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

  async function authFetchRaw(path, options = {}) {
    if (!token) {
      throw new Error("Unauthorized");
    }

    const response = await fetch(buildApiUrl(path), {
      ...options,
      headers: {
        "x-admin-token": token,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      const message = data?.detail || data?.message || "Request failed";
      if (message === "Unauthorized") {
        clearSession();
      }
      throw new Error(message);
    }

    return response;
  }

  async function downloadFile(path, fallbackFilename = "download") {
    const response = await authFetchRaw(path);
    const blob = await response.blob();
    const contentDisposition = response.headers.get("content-disposition") || "";
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
    const filename = filenameMatch?.[1] || fallbackFilename;
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  }

  async function requestOtp() {
    setAuthLoading(true);
    setAuthError("");
    setAuthMessage("");

    try {
      const response = await apiJson("/admin/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail }),
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
      const response = await apiJson("/admin/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: loginEmail,
          challenge_id: challengeId,
          otp,
        }),
      });

      window.localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      setToken(response.token);
      setOtp("");
      setChallengeId("");
      setAuthMessage("Login successful.");
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function logout() {
    if (token) {
      try {
        await authFetch("/admin/auth/logout", { method: "POST" });
      } catch {}
    }
    clearSession();
  }

  return {
    token,
    ready,
    loginEmail,
    setLoginEmail,
    otp,
    setOtp,
    challengeId,
    otpDigits,
    authError,
    authMessage,
    authLoading,
    requestOtp,
    verifyOtp,
    logout,
    authFetch,
    authFetchRaw,
    downloadFile,
  };
}
