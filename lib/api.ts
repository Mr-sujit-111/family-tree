/**
 * API client for FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken()
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle different error formats from FastAPI
        let errorMessage = 'An error occurred'
        
        if (data.detail) {
          if (Array.isArray(data.detail)) {
            // Validation errors - format them nicely
            errorMessage = data.detail
              .map((err: any) => `${err.loc?.join('.')}: ${err.msg}`)
              .join(', ')
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail
          }
        }
        
        return {
          error: errorMessage,
        }
      }

      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Auth endpoints
  async register(data: {
    family_name: string
    password: string
    root_member_name: string
    root_member_gender: 'male' | 'female'
  }) {
    return this.request<{ access_token: string; token_type: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(family_name: string, password: string) {
    return this.request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ family_name, password }),
    })
  }

  async getMe() {
    return this.request<{ id: string; family_name: string; created_at: string }>('/auth/me', {
      method: 'GET',
    })
  }

  // Member endpoints
  async getMemberById(id: string) {
    return this.request<any>(`/members/${id}`, {
      method: 'GET',
    })
  }

  async createMember(data: {
    first_name: string
    last_name?: string
    gender: 'male' | 'female'
    birth_date?: string
    notes?: string
    relation?: 'child' | 'parent' | 'sibling'
    target_id?: string
    is_deceased?: boolean
    passed_away_date?: string
    mobile_numbers?: string[]
    spouse?: {
      first_name: string
      last_name?: string
      gender: 'male' | 'female'
      birth_date?: string
      notes?: string
      is_deceased?: boolean
      passed_away_date?: string
      mobile_numbers?: string[]
    }
    anniversary_date?: string
  }) {
    return this.request<any>('/members', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateMember(id: string, data: {
    first_name?: string
    last_name?: string
    birth_date?: string
    notes?: string
    anniversary_date?: string
    is_deceased?: boolean
    passed_away_date?: string
    mobile_numbers?: string[]
    spouse?: {
      first_name?: string
      last_name?: string
      gender?: 'male' | 'female'
      birth_date?: string
      notes?: string
      is_deceased?: boolean
      passed_away_date?: string
      mobile_numbers?: string[]
    } | null
  }) {
    return this.request<any>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteMember(id: string) {
    return this.request<void>(`/members/${id}`, {
      method: 'DELETE',
    })
  }

  async uploadMemberImage(id: string, file: File) {
    const token = this.getToken()
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${this.baseUrl}/members/${id}/image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.detail || 'Failed to upload image',
        }
      }

      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  async uploadSpouseImage(id: string, file: File) {
    const token = this.getToken()
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${this.baseUrl}/members/${id}/spouse/image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.detail || 'Failed to upload spouse image',
        }
      }

      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      }
    }
  }

  // Tree endpoint
  async getTree() {
    return this.request<any[]>(`/tree`, {
      method: 'GET',
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

