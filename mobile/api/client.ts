import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown> | null;
};

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(input: { code: string; message: string; status: number; details?: Record<string, unknown> }) {
    super(input.message);
    this.name = 'ApiError';
    this.code = input.code;
    this.status = input.status;
    this.details = input.details;
  }
}

function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  return trimmed;
}

function getExpoDevHost(): string | null {
  const anyConstants = Constants as unknown as {
    expoConfig?: { hostUri?: string };
    expoGoConfig?: { debuggerHost?: string };
    manifest?: { debuggerHost?: string };
    manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
  };

  const hostUri =
    anyConstants.expoConfig?.hostUri ??
    anyConstants.expoGoConfig?.debuggerHost ??
    anyConstants.manifest2?.extra?.expoClient?.hostUri ??
    anyConstants.manifest?.debuggerHost;

  if (!hostUri) return null;
  return hostUri.split(':')[0] ?? null;
}

export function getApiBaseUrl(): string {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env && env.trim().length > 0) return normalizeBaseUrl(env);

  const defaultPort = 8010;

  if (Platform.OS === 'web') return `http://localhost:${defaultPort}`;

  const host = getExpoDevHost();
  if (host) return `http://${host}:${defaultPort}`;

  if (Platform.OS === 'android') return `http://10.0.2.2:${defaultPort}`;
  return `http://localhost:${defaultPort}`;
}

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

async function readJsonSafe(res: Response): Promise<unknown | null> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function unwrapCommonResponseShape<T>(payload: unknown): T {
  if (!payload || typeof payload !== 'object') return payload as T;

  const anyPayload = payload as Record<string, unknown>;

  if (anyPayload.success === true && 'data' in anyPayload) {
    return (anyPayload as ApiSuccess<T>).data;
  }

  if (!('success' in anyPayload) && 'data' in anyPayload) {
    const keys = Object.keys(anyPayload);
    const looksLikeWrapper = keys.every((k) => k === 'data' || k === 'meta' || k === 'message');
    if (looksLikeWrapper) return anyPayload.data as T;
  }

  return payload as T;
}

export async function apiRequest<T>(input: {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  token?: string | null;
  query?: Record<string, string | number | boolean | undefined | null>;
  json?: unknown;
  formData?: FormData;
}): Promise<T> {
  const base = getApiBaseUrl();
  const url = new URL(joinUrl(base, input.path));
  if (input.query) {
    for (const [k, v] of Object.entries(input.query)) {
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {};
  if (input.token) headers.Authorization = `Bearer ${input.token}`;

  const method = input.method ?? 'GET';
  const body =
    input.formData ??
    (input.json !== undefined
      ? JSON.stringify(input.json)
      : undefined);

  if (input.json !== undefined && !input.formData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url.toString(), { method, headers, body });
  const payload = await readJsonSafe(res);

  if (!res.ok) {
    if (payload && typeof payload === 'object' && (payload as ApiErrorBody).success === false) {
      const p = payload as ApiErrorBody;
      throw new ApiError({
        code: p.error.code || 'HTTP_ERROR',
        message: p.error.message || 'Request failed',
        status: res.status,
        details: p.error.details,
      });
    }
    throw new ApiError({ code: 'HTTP_ERROR', message: `Request failed (${res.status})`, status: res.status });
  }

  return unwrapCommonResponseShape<T>(payload);
}
