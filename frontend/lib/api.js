const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

function isLocalhostUrl(url) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url);
}

function isBrowserOnLocalhost() {
  if (typeof window === "undefined") {
    return true;
  }

  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

function getApiBaseUrl() {
  if (!configuredApiBaseUrl) {
    return "/api/v1";
  }

  if (typeof window !== "undefined" && isLocalhostUrl(configuredApiBaseUrl) && !isBrowserOnLocalhost()) {
    return "/api/v1";
  }

  return configuredApiBaseUrl.replace(/\/$/, "");
}

export function buildApiUrl(path) {
  return `${getApiBaseUrl()}${path}`;
}

export async function apiJson(path, options = {}) {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || "Request failed");
  }
  return data;
}

export function loadExternalScript(src) {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Browser context required"));
      return;
    }

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}
