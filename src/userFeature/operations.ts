import type { User } from 'wasp/entities'
import type { UpdateDisplayName } from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

type UpdateDisplayNameInput = {
  displayName: string
}

export const updateDisplayName: UpdateDisplayName<UpdateDisplayNameInput, User> = async (
  { displayName },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not found')
  }

  return context.entities.User.update({
    where: { id: context.user.id },
    data: {
      displayName: displayName as string
    }
  } as any)
}
