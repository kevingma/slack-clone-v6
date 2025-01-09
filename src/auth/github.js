import { defineUserSignupFields } from 'wasp/server/auth'

export function githubConfig () {
  return {
    scopes: ['read:user', 'user:email']
  }
}

export const githubSignupFields = defineUserSignupFields({
  email: (data) => {
    if (!data.profile?.email) {
      throw new Error('No email returned from GitHub. Check your scopes or the user\'s GitHub Account permissions.')
    }
    return data.profile.email
  },
  // Placeholder username forces the user to fill in a real one via onboarding.
  username: (data) => 'github_' + (data.profile?.login || Date.now()),
  // Leave empty so user must fill it on the onboarding page.
  displayName: (_data) => ''
})