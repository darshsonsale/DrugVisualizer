/**
 * Drug Path Visualiser - Centralized HTTP API Client
 * Built with standard fetch, AbortController timeouts, and structured error handling.
 */

import { ApiResponse } from './types';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class ApiClient {
  private baseUrl: string;
  private defaultTimeoutMs: number;
  private authToken: string | null = null;

  constructor(baseUrl?: string, defaultTimeoutMs: number = 10000) {
    this.baseUrl = (baseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1').replace(/\/+$/, '');
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  /**
   * Sets or clears the JWT bearer token for authenticated requests.
   * Note: Auth workflow itself is deferred to future tasks.
   */
  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  public getAuthToken(): string | null {
    return this.authToken;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  /**
   * Builds the full URL with query parameters.
   */
  private buildUrl(endpoint: string, params?: RequestOptions['params']): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Internal request executor with timeout and error handling.
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint, options.params);
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // If caller provided their own abort signal, link it
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...options.headers,
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse JSON response body if present
      let responseData: unknown = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }
      } else {
        responseData = await response.text();
      }

      // Check HTTP OK status
      if (!response.ok) {
        const errorData = responseData as { message?: string; error?: { message?: string; code?: string }; code?: string } | null;
        const errorMessage =
          errorData?.error?.message ||
          errorData?.message ||
          `HTTP Error ${response.status}: ${response.statusText}`;
        const errorCode = errorData?.error?.code || errorData?.code;

        throw new ApiError(errorMessage, response.status, errorCode, responseData);
      }

      // If backend wrapped in { success: true, data: ... } envelope, unwrap it
      if (
        responseData &&
        typeof responseData === 'object' &&
        'success' in responseData &&
        'data' in responseData
      ) {
        const envelope = responseData as ApiResponse<T>;
        if (envelope.success === false) {
          throw new ApiError(
            envelope.error?.message || 'API request indicated failure',
            response.status,
            envelope.error?.code,
            envelope.error?.details
          );
        }
        return envelope.data;
      }

      return responseData as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof ApiError) {
        throw err;
      }

      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new ApiError(
          `Request to ${endpoint} timed out after ${timeoutMs}ms`,
          408,
          'REQUEST_TIMEOUT'
        );
      }

      const message = err instanceof Error ? err.message : 'Network request failed';
      throw new ApiError(message, 0, 'NETWORK_ERROR', err);
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', endpoint, body, options);
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', endpoint, body, options);
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }
}

// Default global API client instance
export const apiClient = new ApiClient();
