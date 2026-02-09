export const USER_TYPES = {
  Demo: 1,
  Client: 2,
  Agency: 3,
  Administrator: 4,
} as const

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES]

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  userType: number | null
  companyId: number | null
  company?: { id: number | string; name: string | null; [key: string]: unknown } | null
}
