const API_BASE_URL = process.env["NEXT_PUBLIC_API_URL"] || 'http://localhost:3001'

class AdminAPI {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const session = await this.getSession()
    const userEmail = session?.user?.email

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail || '',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private async getSession() {
    try {
      const response = await fetch('/api/auth/session')
      return response.json()
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async checkAdminStatus(): Promise<any> {
    return this.makeRequest('/api/admin/check')
  }
}

export const adminAPI = new AdminAPI() 