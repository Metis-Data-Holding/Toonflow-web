const LOCAL_API_BASE_URL = "http://localhost:60000";
const LOCAL_WS_BASE_URL = "ws://localhost:60000";

const LEGACY_LOCAL_HTTP_PATTERN = /^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[?::1\]?)(?::60000)?\/?$/i;
const LEGACY_LOCAL_WS_PATTERN = /^wss?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[?::1\]?)(?::60000)?\/?$/i;

function trimTrailingSlash(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed === "/") return trimmed;
  return trimmed.replace(/\/+$/, "");
}

export function normalizeApiBaseUrl(value: string): string {
  const normalized = trimTrailingSlash(value);
  return normalized;
}

export function normalizeWsBaseUrl(value: string): string {
  const normalized = trimTrailingSlash(value);
  return normalized;
}

export function getRuntimeEndpointDefaults(): { baseUrl: string; wsBaseUrl: string } {
  if (import.meta.env.DEV || typeof window === "undefined") {
    return { baseUrl: LOCAL_API_BASE_URL, wsBaseUrl: LOCAL_WS_BASE_URL };
  }

  if (window.location.protocol === "file:") {
    return { baseUrl: LOCAL_API_BASE_URL, wsBaseUrl: LOCAL_WS_BASE_URL };
  }

  const origin = window.location.origin.replace(/\/+$/, "");
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return {
    baseUrl: `${origin}/api`,
    wsBaseUrl: `${wsProtocol}//${window.location.host}`,
  };
}

export function isLegacyLocalApiBaseUrl(value: string): boolean {
  return LEGACY_LOCAL_HTTP_PATTERN.test(value.trim());
}

export function isLegacyLocalWsBaseUrl(value: string): boolean {
  return LEGACY_LOCAL_WS_PATTERN.test(value.trim());
}
