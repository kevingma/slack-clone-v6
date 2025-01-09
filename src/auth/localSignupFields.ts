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
  // Use a placeholder so Wasp creates the user, but force the real username via onboarding
  username: (_data) => 'local_' + Date.now(),
  // Keep displayName empty so Main.tsx redirects them to /onboarding
  displayName: (_data) => ''
})