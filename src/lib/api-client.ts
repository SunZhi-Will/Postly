const API_KEY = process.env.GAS_API_KEY
const GAS_URL = process.env.GAS_URL

type RequestOptions<T> = {
  table: string
  method?: 'GET' | 'POST'
  params?: Record<string, string>
  body?: T
  userId?: string
}

export class ApiClient {
  private static instance: ApiClient
  private constructor() {}

  static getInstance(): ApiClient {
    if (!this.instance) {
      this.instance = new ApiClient()
    }
    return this.instance
  }

  async request<T, B = unknown>({ table, method = 'GET', params = {}, body, userId }: RequestOptions<B>): Promise<T> {
    try {
      const url = new URL(GAS_URL!)
      url.searchParams.set('apiKey', API_KEY!)
      url.searchParams.set('table', table)
      
      if (userId) {
        url.searchParams.set('user_id', userId)
      }

      // 添加其他查詢參數
      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.set(key, value)
      })

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      }

      if (body) {
        options.body = JSON.stringify(body)
      }

      const startTime = Date.now()
      const response = await fetch(url.toString(), options)
      const endTime = Date.now()
      
      console.log(`API ${method} ${table} took ${endTime - startTime}ms`)

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      console.error(`API request error (${table}):`, error)
      throw error
    }
  }
} 