export interface IApiResponse<T = any> {
  success: boolean
  message: {
    en: string
    [key: string]: string
  }
  data: T
  errors?: Record<string, string[]>
}

export interface IApiError {
  success: false
  message: {
    en: string
    [key: string]: string
  }
  errors?: Record<string, string[]>
}
