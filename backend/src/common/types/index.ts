export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    version?: string;
    [key: string]: unknown;
  };
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
  meta?: {
    timestamp: string;
  };
}

export interface HealthCheckData {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  uptimeSeconds: number;
  environment: string;
  timestamp: string;
  version: string;
}
