import { DefaultSession } from 'next-auth'
import { JWT as DefaultJWT } from 'next-auth/jwt'

export type SessionCompany = {
  id: number
  name: string | null
  language: string | null
}

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      userType: number | null
      companyId: number | null
      company: SessionCompany | null
    }
  }

  interface User {
    userType?: number | null
    companyId?: number | null
    company?: SessionCompany | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string
    userType?: number | null
    companyId?: number | null
    company?: SessionCompany | null
  }
}
