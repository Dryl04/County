import type { AxiosError } from 'axios'

export interface ApiErrorResponse {
  detail?: string | { error?: { message?: string } }
}

export type ApiError = AxiosError<ApiErrorResponse>

export function getErrorMessage(error: unknown, defaultMessage: string): string {
  const axiosError = error as ApiError
  const detail = axiosError?.response?.data?.detail

  if (typeof detail === 'string') {
    return detail
  }

  if (typeof detail === 'object' && detail?.error?.message) {
    return detail.error.message
  }

  return defaultMessage
}
