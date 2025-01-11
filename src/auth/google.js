import { defineUserSignupFields } from 'wasp/server/auth'

export function googleConfig () {
  return {
    // Request both 'profile' and 'email' scopes.
    scopes: ['profile', 'email']
  }
}

export const googleSignupFields = defineUserSignupFields({
  // In your schema, User.email is required. 
  // We'll set it from the Google profile data.
  email: (data) => {
    if (!data.profile?.email) {
      throw new Error('No email returned from Google. Check your scopes or the user\'s Google Account permissions.')
    }
    return data.profile.email
  },
  // Optionally, if you want to also set username from the Google profile:
  // username: (data) => data.profile?.name || ''
  username: (data) => data.profile?.name || ('google_' + Date.now()),
  displayName: (data) => data.profile?.name || ''
})