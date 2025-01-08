import type { CompleteOnboarding } from 'wasp/server/operations'
import type { User } from 'wasp/entities'
import { HttpError } from 'wasp/server'

type CompleteOnboardingInput = Record<string, never> // or whatever input you need

export const completeOnboarding: CompleteOnboarding<CompleteOnboardingInput, User> = async (
  _args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  // Example logic
  const user = await context.entities.User.update({
    where: { id: context.user.id },
    data: { /* Mark user as onboarded, etc. */ }
  })

  return user
}