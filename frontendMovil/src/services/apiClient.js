import { Platform } from 'react-native';

const defaultBaseUrl = Platform.select({
  android: 'http://10.0.2.2:8000/api',
  default: 'http://localhost:8000/api',
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || defaultBaseUrl;

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const parsePayload = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const getMessage = (payload, fallback) => {
  if (!payload) return fallback;
  if (typeof payload === 'string') return payload;
  if (payload.message) return payload.message;
  if (payload.error) return payload.error;
  if (payload.errors) {
    return Array.isArray(payload.errors)
      ? payload.errors.join(', ')
      : Object.values(payload.errors).flat().join(', ');
  }
  return fallback;
};

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, token, headers = {} } = options;
  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await parsePayload(response);

  if (!response.ok) {
    throw new ApiError(getMessage(payload, 'Request failed'), response.status, payload);
  }

  return payload;
}
