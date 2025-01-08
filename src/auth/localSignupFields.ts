import { defineUserSignupFields } from 'wasp/server/auth'

type LocalSignupCredentials = {
  email: string
  username?: string
  password: string
}

type LocalSignupData = {
  credentials: LocalSignupCredentials
}

export const localSignupFields = defineUserSignupFields({
  email: (data) => (data as LocalSignupData).credentials.email,
  username: (data) => (data as LocalSignupData).credentials.username || null,
})