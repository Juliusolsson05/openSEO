import { DefaultSession } from 'next-auth'
import { JWT as DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      userType: number | null
      companyId: number | null
      company: {
        id: number | string
        name: string | null
        [key: string]: unknown
      } | null
    }
  }

  interface User {
    userType?: number | null
    companyId?: number | null
    company?: {
      id: number | string
      name: string | null
      [key: string]: unknown
    } | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string
    userType?: number | null
    companyId?: number | null
    company?: {
      id: number | string
      name: string | null
      [key: string]: unknown
    } | null
  }
}
