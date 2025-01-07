import { defineUserSignupFields } from 'wasp/server/auth'

export function githubConfig () {
  return {
    // GitHub scopes for reading user profile and email.
    scopes: ['read:user', 'user:email']
  }
}

export const githubSignupFields = defineUserSignupFields({
  // Assign the user's email from the GitHub profile data.
  email: (data) => {
    if (!data.profile?.email) {
      throw new Error('No email returned from GitHub. Check your scopes or the user\'s GitHub Account permissions.')
    }
    return data.profile.email
  },
  // Optionally, set username from GitHub’s login field:
  username: (data) => data.profile?.login || ''
})